const { Scenes, Markup } = require('telegraf');
const { Product, Category } = require('../../../models');

const addProductScene = new Scenes.WizardScene(
    'ADD_PRODUCT_SCENE',
    // Шаг 1: Выбор категории
    async (ctx) => {
        const categories = await Category.findAll({ where: { isActive: true } });
        if (categories.length === 0) {
            await ctx.reply('Нет активных категорий. Сначала активируйте категорию.');
            return ctx.scene.leave();
        }

        const buttons = categories.map(c => [Markup.button.callback(c.name, `select_cat_${c.id}`)]);
        buttons.push([Markup.button.callback('Отмена', 'cancel')]);

        await ctx.reply('В какую категорию добавляем товар?', Markup.inlineKeyboard(buttons));
        return ctx.wizard.next();
    },
    // Шаг 2: Ввод названия
    async (ctx) => {
        if (ctx.callbackQuery) {
            const data = ctx.callbackQuery.data;
            if (data === 'cancel') {
                await ctx.reply('Отменено.');
                return ctx.scene.leave();
            }
            if (data.startsWith('select_cat_')) {
                ctx.wizard.state.categoryId = data.replace('select_cat_', '');
                await ctx.reply('Введите название товара (например, Сибирский Чан "Элит"):');
                return ctx.wizard.next();
            }
        }
        await ctx.reply('Пожалуйста, выберите категорию кнопкой.');
    },
    // Шаг 3: Ввод цены
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        ctx.wizard.state.name = ctx.message.text;
        await ctx.reply('Введите цену товара (только цифры, например: 150000):');
        return ctx.wizard.next();
    },
    // Шаг 4: Описание
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const price = parseInt(ctx.message.text);
        if (isNaN(price)) {
            await ctx.reply('Пожалуйста, введите корректное число:');
            return;
        }
        ctx.wizard.state.price = price;
        await ctx.reply('Введите описание товара:');
        return ctx.wizard.next();
    },
    // Шаг 5: Ссылка на изображение (опционально)
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        ctx.wizard.state.description = ctx.message.text;
        await ctx.reply('Отправьте URL картинки (или введите "нет" если пока без картинки):');
        return ctx.wizard.next();
    },
    // Шаг 6: Сохранение
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        let image = ctx.message.text;
        if (image.toLowerCase() === 'нет') image = null;

        try {
            const product = await Product.create({
                categoryId: ctx.wizard.state.categoryId,
                name: ctx.wizard.state.name,
                price: ctx.wizard.state.price,
                description: ctx.wizard.state.description,
                image: image,
                isActive: true
            });
            await ctx.reply(`✅ Товар успешно добавлен!\nID: ${product.id}\nНазвание: ${product.name}`);
        } catch (e) {
            console.error(e);
            await ctx.reply('❌ Ошибка при добавлении товара в БД.');
        }
        return ctx.scene.leave();
    }
);

// Глобальный обработчик для отмены
addProductScene.action('cancel', async (ctx) => {
    await ctx.reply('Создание товара отменено.');
    return ctx.scene.leave();
});

module.exports = { addProductScene };
