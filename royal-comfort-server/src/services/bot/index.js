const { Telegraf, session, Scenes, Markup } = require('telegraf');
const { Category, ConfigOption, Admin } = require('../../models');
const { isAdmin, addAdminToCache } = require('./utils/constants');

const { mainMenuAdmin, mainMenuClient, backToCatalogInline } = require('./keyboards');
const { setupOrdersHandlers } = require('./handlers/orders');
const { setupCatalogHandlers } = require('./handlers/catalog');
const { setupAdminHandlers } = require('./handlers/admin');

const { addProductScene } = require('./scenes/addProduct');
const { addOptionScene } = require('./scenes/addOption');
const { addPromoScene } = require('./scenes/addPromo');
const { addReviewScene } = require('./scenes/addReview');
const { addAdminScene } = require('./scenes/addAdmin');
const { convertOrderScene } = require('./scenes/convertOrder');
const { editCategoryPriceScene, editCategoryDiscountScene, editOptionPriceScene } = require('./scenes/editCatalogScenes');
const {
    editProductNameScene, editProductPriceScene, editProductDescScene, editProductImageScene, editProductSpecsScene,
    editCategoryNameScene, editCategoryImageScene, addGroupScene, editGroupNameScene, editOptionNameScene
} = require('./scenes/manageCatalogScenes');
const { checkOrderScene } = require('./scenes/checkOrder');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error('CRITICAL: BOT_TOKEN is not defined in .env');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Сцены
const stage = new Scenes.Stage([
    addProductScene, 
    addOptionScene, 
    addPromoScene, 
    addReviewScene, 
    addAdminScene, 
    convertOrderScene,
    editCategoryPriceScene,
    editCategoryDiscountScene,
    editOptionPriceScene,
    editProductNameScene,
    editProductPriceScene,
    editProductDescScene,
    editProductImageScene,
    editProductSpecsScene,
    editCategoryNameScene,
    editCategoryImageScene,
    addGroupScene,
    editGroupNameScene,
    editOptionNameScene,
    checkOrderScene
]);
bot.use(session());
bot.use(stage.middleware());

// Глобальная обработка ошибок
bot.catch((err, ctx) => {
    console.error(`Ошибка для ${ctx.updateType}`, err);
});

// START
bot.start(async (ctx) => {
    // Авто-авторизация суперадминов
    const { isSuperAdmin } = require('./utils/constants');
    
    if (isSuperAdmin(ctx)) {
        try {
            const [admin, created] = await Admin.findOrCreate({
                where: { telegramId: ctx.from.id },
                defaults: { username: ctx.from.username || 'unknown', role: 'superadmin' }
            });
            
            // Если уже был, но роль не суперадмин - обновим
            if (!created && admin.role !== 'superadmin') {
                await admin.update({ role: 'superadmin' });
            }
            
            addAdminToCache(ctx.from.id);
        } catch (err) {
            console.error('Ошибка авто-авторизации суперадмина:', err);
        }
    }

    if (isAdmin(ctx)) {
        ctx.reply('👋 Добро пожаловать, Босс!\nСистема управления Royal Comfort активирована.', mainMenuAdmin);
    } else {
        ctx.reply('👋 Добро пожаловать в Royal Service!\nЧем могу помочь?', mainMenuClient);
    }
});

bot.command('id', (ctx) => {
    ctx.reply(`🆔 Ваш Telegram ID: ${ctx.from.id}`);
});


// Настройка модульных обработчиков
setupOrdersHandlers(bot);
setupCatalogHandlers(bot);
setupAdminHandlers(bot);


// Заглушки для клиентского меню
bot.hears(/Связь с менеджером/i, (ctx) => {
    ctx.reply(
        '📞 Телефон: +7 (933) 898-77-88\n' +
        'Telegram: @royal_comfort1\n' +
        'Макс: https://max.ru/u/f9LHodD0cOIaP6VEQ8R6vANhN5ifyiIsyqMYVa3wPSOsnnKMyZ9ZfK2m5Vg'
    );
});

bot.hears(/Каталог проектов/i, (ctx) => {
    ctx.reply('🌐 Наш полный каталог доступен на сайте: https://royalcomfort.ru');
});

bot.hears(/Проверить статус заказа/i, (ctx) => {
    ctx.scene.enter('CHECK_ORDER_SCENE');
});

bot.hears(/Оставить отзыв/i, (ctx) => {
    ctx.scene.enter('ADD_REVIEW_SCENE');
});

// Обработка текстового ввода для Админа (поиск и прочее)
bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    // Обработка ПОИСКА для админов
    if (isAdmin(ctx) && ctx.message.reply_to_message && ctx.message.reply_to_message.text.includes('Введите данные для поиска')) {
        const { Order } = require('../../models');
        const { Op } = require('sequelize');
        const query = text;
        
        try {
            const orders = await Order.findAll({
                where: {
                    [Op.or]: [
                        { id: { [Op.like]: `%${query}%` } },
                        { clientName: { [Op.like]: `%${query}%` } },
                        { clientPhone: { [Op.like]: `%${query}%` } },
                        { productName: { [Op.like]: `%${query}%` } },
                        { totalPrice: isNaN(parseInt(query)) ? -1 : parseInt(query) }
                    ]
                },
                limit: 5
            });

            if (orders.length === 0) return ctx.reply('❌ Ничего не найдено.', require('./keyboards').mainMenuAdmin);

            await ctx.reply(`✅ Найдено заказов: ${orders.length}`, require('./keyboards').mainMenuAdmin);

            for (const o of orders) {
                const info = `🆔 ${o.id}\n👤 ${o.clientName}\n📞 ${o.clientPhone}\n📦 ${o.productName || '-'}\n💰 ${o.totalPrice} ₽\n📍 Статус: ${o.status}`;
                await ctx.reply(info, Markup.inlineKeyboard([
                    [Markup.button.callback('Управлять', `manage_${o.id}`)]
                ]));
            }
            
            // Восстанавливаем главное меню отдельным сообщением в конце
            await ctx.reply('Выбор заказа из списка 👆', require('./keyboards').mainMenuAdmin);
        } catch (e) {
            console.error(e);
            ctx.reply('❌ Ошибка при поиске.', require('./keyboards').mainMenuAdmin);
        }
    }
});

const launchBot = async () => {
    try {
        console.log('🤖 Инициализация бота...');
        
        // Загружаем админов из БД в кэш
        const dbAdmins = await Admin.findAll();
        dbAdmins.forEach(a => addAdminToCache(a.telegramId));
        console.log(`👥 Загружено админов из БД: ${dbAdmins.length}`);

        bot.launch().then(() => {

            console.log('✅ 🤖 БОТ ЗАПУЩЕН И ГОТОВ К РАБОТЕ!');
        }).catch(err => {
            console.error('❌ Ошибка при bot.launch():', err);
        });
    } catch (err) {
        console.error('❌ Ошибка в launchBot:', err);
    }
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Функция для вызова извне (например, из ordersController)
const notifyAdminAboutNewOrder = async (orderId, orderDetails) => {
    const admins = await Admin.findAll();
    const typeText = orderDetails.type === 'consultation' ? '📞 КОНСУЛЬТАЦИЯ' : '🛒 НОВЫЙ ЗАКАЗ';
    let message = `🔔 **${typeText}** 🔔\n\n` +
                    `🆔 ID: ${orderId}\n` +
                    `👤 Клиент: ${orderDetails.clientName}\n` +
                    `📞 Телефон: ${orderDetails.clientPhone}\n` +
                    `💬 Связь: ${orderDetails.contactMethod || 'Не указан'}\n`;
                    
    if (orderDetails.type !== 'consultation') {
        message += `📦 Товар: ${orderDetails.productName || 'Индивидуальный проект'}\n` +
                   `💰 Сумма: ${orderDetails.totalPrice ? orderDetails.totalPrice.toLocaleString() + ' ₽' : 'По расчету'}\n`;
    }
    
    if (orderDetails.configuration && orderDetails.configuration.notes) {
        message += `\n📝 **Комментарий:**\n_${orderDetails.configuration.notes}_\n`;
        if (orderDetails.configuration.referenceFiles && orderDetails.configuration.referenceFiles.length > 0) {
             message += `📎 **Прикрепленные файлы:** ${orderDetails.configuration.referenceFiles.join(', ')}\n`;
        }
    }

    if (orderDetails.referralCode) {
        message += `\n🎁 **Реф. код:** ${orderDetails.referralCode}`;
        if (orderDetails.referralDetails) {
            message += `\n👤 **Создатель:** ${orderDetails.referralDetails.ownerName} (${orderDetails.referralDetails.ownerPhone})\n`;
        } else {
            message += `\n`;
        }
    }
    
    message += `\n⚡️ Перейдите в "В работе" для управления заказом.`;

    for (const admin of admins) {
        try {
            await bot.telegram.sendMessage(admin.telegramId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Управление заказом', callback_data: `manage_${orderId}` }
                    ]]
                }
            });
        } catch (error) {
            console.error(`Ошибка отправки уведомления админу ${admin.telegramId}:`, error);
        }
    }
};

const notifyAdminAboutNewReview = async (review) => {
    const admins = await Admin.findAll();
    const message = `🔔 **НОВЫЙ ОТЗЫВ НА МОДЕРАЦИЮ** 🔔\n\n` +
                    `👤 Автор: ${review.author}\n` +
                    `⭐️ Оценка: ${review.rating}/5\n` +
                    `📦 Товар: ${review.productName || 'Не указан'}\n` +
                    `💬 Текст: ${review.text}\n\n` +
                    `Перейдите в меню модерации, чтобы опубликовать его на сайте.`;
    
    for (const admin of admins) {
        try {
            await bot.telegram.sendMessage(admin.telegramId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '⭐️ Модерация отзывов', callback_data: 'moderate_reviews' }
                    ]]
                }
            });
        } catch (error) {
            console.error(`Ошибка отправки уведомления об отзыве админу ${admin.telegramId}:`, error);
        }
    }
};

module.exports = { launchBot, notifyAdminAboutNewOrder, notifyAdminAboutNewReview };
