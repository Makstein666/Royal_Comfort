const { Scenes, Markup } = require('telegraf');
const { mainMenuAdmin } = require('../keyboards');
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
    // Шаг 5: Загрузка фото товара
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        ctx.wizard.state.description = ctx.message.text;
        await ctx.reply(
            '📸 Отправьте фотографию товара или введите "пропустить":',
            Markup.keyboard([['пропустить'], ['Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    // Шаг 6: Характеристики
    async (ctx) => {
        let image = null;

        if (ctx.message && ctx.message.photo) {
            const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
            try {
                const { downloadTelegramFile } = require('../../../utils/fileDownloader');
                await ctx.reply('⏳ Загрузка фотографии...');
                image = await downloadTelegramFile(ctx.telegram, fileId, 'products');
            } catch (err) {
                console.error(err);
                await ctx.reply('⚠️ Ошибка загрузки фото. Товар будет добавлен без изображения.');
            }
        } else if (ctx.message && ctx.message.text && ctx.message.text.toLowerCase() === 'пропустить') {
            image = null;
        } else if (ctx.message && ctx.message.text && ctx.message.text.toLowerCase() === 'отмена') {
            await ctx.reply('Создание товара отменено.', mainMenuAdmin);
            return ctx.scene.leave();
        } else {
            await ctx.reply('Пожалуйста, отправьте фотографию товара или напишите "пропустить":');
            return;
        }

        ctx.wizard.state.image = image;

        await ctx.reply(
            '📋 Введите характеристики товара.\n' +
            'Каждая характеристика с новой строки в формате:\n' +
            'Название: Значение\n\n' +
            'Пример:\n' +
            'Вместимость: 4-6 человек\n' +
            'Диаметр чаши: 2050 мм\n\n' +
            'Или нажмите "пропустить":',
            Markup.keyboard([['пропустить'], ['Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    // Шаг 7: Сохранение товара в БД
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const text = ctx.message.text.trim();
        
        if (text.toLowerCase() === 'отмена') {
            await ctx.reply('Создание товара отменено.', mainMenuAdmin);
            return ctx.scene.leave();
        }

        let specs = [];
        if (text.toLowerCase() !== 'пропустить') {
            const lines = text.split('\n');
            for (const line of lines) {
                if (line.includes(':')) {
                    const [label, ...valueParts] = line.split(':');
                    const value = valueParts.join(':'); // на случай, если в значении есть двоеточие
                    if (label && value) {
                        specs.push({ label: label.trim(), value: value.trim() });
                    }
                }
            }
        }

        try {
            const product = await Product.create({
                categoryId: ctx.wizard.state.categoryId,
                name: ctx.wizard.state.name,
                price: ctx.wizard.state.price,
                description: ctx.wizard.state.description,
                image: ctx.wizard.state.image,
                specs: specs.length > 0 ? JSON.stringify(specs) : null,
                isActive: true
            });
            await ctx.reply(`✅ Товар успешно добавлен!\nID: ${product.id}\nНазвание: ${product.name}`, mainMenuAdmin);
        } catch (e) {
            console.error(e);
            await ctx.reply('❌ Ошибка при добавлении товара в БД.', mainMenuAdmin);
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

