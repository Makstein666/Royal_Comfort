const { Scenes, Markup } = require('telegraf');
const { Order, Review, Category, Product } = require('../../../models');

const addReviewScene = new Scenes.WizardScene(
    'ADD_REVIEW_SCENE',
    // Шаг 1: Запрос ID заказа
    async (ctx) => {
        await ctx.reply('🆔 Пожалуйста, введите номер вашего заказа (например, RC-2605-1234):', Markup.keyboard([['❌ Отмена']]).resize());
        return ctx.wizard.next();
    },
    // Шаг 2: Валидация и подтверждение
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const orderId = ctx.message.text.trim();

        if (orderId === '❌ Отмена') {
            await ctx.reply('Отменено.', Markup.removeKeyboard());
            return ctx.scene.leave();
        }

        try {
            const order = await Order.findByPk(orderId);
            if (!order) {
                await ctx.reply('❌ Заказ с таким номером не найден. Пожалуйста, проверьте правильность ввода или обратитесь в поддержку.');
                return;
            }

            // Проверка на существующий отзыв
            const existing = await Review.findOne({ where: { orderId } });
            if (existing) {
                await ctx.reply('⚠️ Вы уже оставляли отзыв по этому заказу. Спасибо!');
                return ctx.scene.leave();
            }

            ctx.wizard.state.order = order;
            
            const details = `📦 Ваш заказ:\n` +
                            `👤 Имя: ${order.clientName}\n` +
                            `🏷 Товар: ${order.productName || 'Индивидуальный проект'}\n` +
                            `💰 Сумма: ${order.totalPrice ? order.totalPrice.toLocaleString() + ' ₽' : 'Расчетная'}\n\n` +
                            `Это ваш заказ?`;

            await ctx.reply(details, Markup.inlineKeyboard([
                [Markup.button.callback('✅ Да, всё верно', 'confirm_order')],
                [Markup.button.callback('❌ Нет, другой ID', 'retry_order')]
            ]));
            return ctx.wizard.next();
        } catch (e) {
            console.error(e);
            await ctx.reply('❌ Ошибка при поиске заказа.');
            return ctx.scene.leave();
        }
    },
    // Шаг 3: Оценка
    async (ctx) => {
        if (ctx.callbackQuery) {
            const data = ctx.callbackQuery.data;
            if (data === 'retry_order') {
                await ctx.editMessageText('Ок, введите правильный номер заказа:');
                return ctx.wizard.back();
            }
            if (data === 'confirm_order') {
                await ctx.answerCbQuery();
                await ctx.editMessageText('⭐ Оцените качество нашей работы от 1 до 5:', Markup.inlineKeyboard([
                    [1, 2, 3, 4, 5].map(n => Markup.button.callback(n.toString(), `rate_${n}`))
                ]));
                return ctx.wizard.next();
            }
        }
    },
    // Шаг 4: Текст отзыва
    async (ctx) => {
        if (ctx.callbackQuery && ctx.callbackQuery.data.startsWith('rate_')) {
            ctx.wizard.state.rating = parseInt(ctx.callbackQuery.data.replace('rate_', ''));
            await ctx.answerCbQuery();
            await ctx.reply('💬 Напишите ваш отзыв (что понравилось, а что можно улучшить):');
            return ctx.wizard.next();
        }
    },
    // Шаг 5: Фотографии
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        ctx.wizard.state.text = ctx.message.text;
        ctx.wizard.state.images = [];

        await ctx.reply('📸 Пришлите фотографии товара (до 5 штук) или нажмите кнопку "Завершить без фото"', Markup.keyboard([['✅ Завершить без фото'], ['❌ Отмена']]).resize());
        return ctx.wizard.next();
    },
    // Шаг 6: Сбор фото и сохранение
    async (ctx) => {
        if (ctx.message && ctx.message.text === '❌ Отмена') {
            await ctx.reply('Отменено.', Markup.removeKeyboard());
            return ctx.scene.leave();
        }

        if (ctx.message && (ctx.message.text === '✅ Завершить без фото' || ctx.message.photo)) {
            if (ctx.message.photo) {
                // Берем самое большое разрешение фото
                const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                // Получаем ссылку на файл через Telegram API (в реальности нужно скачать и сохранить у себя)
                // Но для прототипа сохраним fileId или URL если бот имеет доступ
                const fileUrl = await ctx.telegram.getFileLink(fileId);
                ctx.wizard.state.images.push(fileUrl.href);
                
                if (ctx.wizard.state.images.length < 5) {
                    await ctx.reply(`📸 Фото получено (${ctx.wizard.state.images.length}/5). Можете прислать еще или нажать "Готово"`, Markup.keyboard([['✅ Готово'], ['❌ Отмена']]).resize());
                    return; // Ждем следующее фото
                }
            }

            // Сохранение
            try {
                const { order, rating, text, images } = ctx.wizard.state;
                
                // Определяем категорию
                let categoryId = order.productId;
                const category = await Category.findByPk(order.productId);
                if (!category) {
                    const product = await Product.findByPk(order.productId);
                    if (product) categoryId = product.categoryId;
                }

                await Review.create({
                    author: order.clientName,
                    text,
                    rating,
                    images: images || [],
                    orderId: order.id,
                    productName: order.productName,
                    categoryId,
                    date: new Date().toLocaleDateString('ru-RU'),
                    isApproved: false
                });

                await ctx.reply('🎉 Спасибо за ваш отзыв! Он появится на сайте после модерации.', Markup.removeKeyboard());
            } catch (e) {
                console.error(e);
                await ctx.reply('❌ Ошибка при сохранении отзыва.');
            }
            return ctx.scene.leave();
        }
        
        if (ctx.message && ctx.message.text === '✅ Готово') {
             // Повтор логики сохранения (DRY - можно вынести в функцию)
             // Для краткости просто скопирую
             try {
                const { order, rating, text, images } = ctx.wizard.state;
                let categoryId = order.productId;
                const category = await Category.findByPk(order.productId);
                if (!category) {
                    const product = await Product.findByPk(order.productId);
                    if (product) categoryId = product.categoryId;
                }
                await Review.create({
                    author: order.clientName, text, rating, images, orderId: order.id, productName: order.productName, categoryId, date: new Date().toLocaleDateString('ru-RU'), isApproved: false
                });
                await ctx.reply('🎉 Спасибо за ваш отзыв! Он появится на сайте после модерации.', Markup.removeKeyboard());
            } catch (e) { console.error(e); await ctx.reply('❌ Ошибка при сохранении.'); }
            return ctx.scene.leave();
        }
    }
);

addReviewScene.hears('❌ Отмена', async (ctx) => {
    await ctx.reply('Отменено.', Markup.removeKeyboard());
    return ctx.scene.leave();
});

module.exports = { addReviewScene };
