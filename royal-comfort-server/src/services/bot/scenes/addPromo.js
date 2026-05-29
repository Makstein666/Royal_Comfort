const { Scenes, Markup } = require('telegraf');
const { mainMenuAdmin } = require('../keyboards');
const { PromoSettings, Category } = require('../../../models');

const addPromoScene = new Scenes.WizardScene(
    'ADD_PROMO_SCENE',
    // Шаг 1: Выбор категории
    async (ctx) => {
        const categories = await Category.findAll({ where: { isActive: true } });
        const buttons = categories.map(c => [Markup.button.callback(c.name, `promo_cat_${c.id}`)]);
        buttons.push([Markup.button.callback('Общий подарок (для всех)', 'promo_cat_default')]);
        buttons.push([Markup.button.callback('Отмена', 'cancel')]);

        await ctx.reply('Для какой категории настраиваем подарок?', Markup.inlineKeyboard(buttons));
        return ctx.wizard.next();
    },
    // Шаг 2: Ввод названия подарка
    async (ctx) => {
        if (ctx.callbackQuery) {
            const data = ctx.callbackQuery.data;
            if (data === 'cancel') {
                await ctx.reply('Отменено.');
                return ctx.scene.leave();
            }
            if (data.startsWith('promo_cat_')) {
                ctx.wizard.state.categoryId = data.replace('promo_cat_', '');
                await ctx.reply('Введите название подарка (например: Набор премиальных масел):');
                return ctx.wizard.next();
            }
        }
        await ctx.reply('Пожалуйста, выберите категорию кнопкой.');
    },
    // Шаг 3: Загрузка фото подарка
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        ctx.wizard.state.giftName = ctx.message.text;
        
        await ctx.reply(
            '📸 Отправьте фотографию подарка или введите "пропустить":',
            Markup.keyboard([['пропустить'], ['Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    // Шаг 4: Сохранение
    async (ctx) => {
        let image = null;

        if (ctx.message && ctx.message.photo) {
            const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
            try {
                const { downloadTelegramFile } = require('../../../utils/fileDownloader');
                await ctx.reply('⏳ Загрузка фотографии...');
                image = await downloadTelegramFile(ctx.telegram, fileId, 'promo');
            } catch (err) {
                console.error(err);
                await ctx.reply('⚠️ Ошибка загрузки фото. Подарок будет настроен без изображения.');
            }
        } else if (ctx.message && ctx.message.text && ctx.message.text.toLowerCase() === 'пропустить') {
            image = null;
        } else if (ctx.message && ctx.message.text && ctx.message.text.toLowerCase() === 'отмена') {
            await ctx.reply('Настройка подарка отменена.', mainMenuAdmin);
            return ctx.scene.leave();
        } else {
            await ctx.reply('Пожалуйста, отправьте фотографию подарка или напишите "пропустить":');
            return;
        }

        try {
            await PromoSettings.upsert({
                categoryId: ctx.wizard.state.categoryId,
                giftName: ctx.wizard.state.giftName,
                giftImage: image,
                isActive: true
            });
            await ctx.reply(`✅ Подарок успешно настроен!`, mainMenuAdmin);
        } catch (e) {
            console.error(e);
            await ctx.reply('❌ Ошибка при сохранении.', mainMenuAdmin);
        }
        return ctx.scene.leave();
    }
);

addPromoScene.action('cancel', async (ctx) => {
    await ctx.reply('Отменено.');
    return ctx.scene.leave();
});

module.exports = { addPromoScene };

