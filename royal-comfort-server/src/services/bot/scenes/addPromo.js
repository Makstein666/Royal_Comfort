const { Scenes, Markup } = require('telegraf');
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
    // Шаг 3: Ссылка на изображение
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        ctx.wizard.state.giftName = ctx.message.text;
        
        await ctx.reply('Отправьте URL картинки подарка (или введите "нет"):');
        return ctx.wizard.next();
    },
    // Шаг 4: Сохранение
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        let image = ctx.message.text;
        if (image.toLowerCase() === 'нет') image = null;

        try {
            await PromoSettings.upsert({
                categoryId: ctx.wizard.state.categoryId,
                giftName: ctx.wizard.state.giftName,
                giftImage: image,
                isActive: true
            });
            await ctx.reply(`✅ Подарок успешно настроен!`);
        } catch (e) {
            console.error(e);
            await ctx.reply('❌ Ошибка при сохранении.');
        }
        return ctx.scene.leave();
    }
);

addPromoScene.action('cancel', async (ctx) => {
    await ctx.reply('Отменено.');
    return ctx.scene.leave();
});

module.exports = { addPromoScene };
