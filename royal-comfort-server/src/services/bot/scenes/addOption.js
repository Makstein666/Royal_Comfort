const { Scenes, Markup } = require('telegraf');
const { mainMenuAdmin } = require('../keyboards');
const { ConfigOption } = require('../../../models');

const addOptionScene = new Scenes.WizardScene(
    'ADD_OPTION_SCENE',
    // Шаг 1: Ожидаем ввод названия
    async (ctx) => {
        // Мы передаем groupId через ctx.scene.state.groupId при входе в сцену
        await ctx.reply('Введите название новой опции (например: Мореный дуб):', Markup.inlineKeyboard([
            [Markup.button.callback('Отмена', 'cancel')]
        ]));
        return ctx.wizard.next();
    },
    // Шаг 2: Ожидаем ввод цены
    async (ctx) => {
        if (ctx.callbackQuery && ctx.callbackQuery.data === 'cancel') {
            await ctx.reply('Добавление опции отменено.');
            return ctx.scene.leave();
        }

        if (!ctx.message || !ctx.message.text) return;
        ctx.wizard.state.name = ctx.message.text;

        await ctx.reply('Введите цену-надбавку для этой опции (только цифры, 0 = бесплатно):', Markup.inlineKeyboard([
            [Markup.button.callback('Отмена', 'cancel')]
        ]));
        return ctx.wizard.next();
    },
    // Шаг 3: Сохранение
    async (ctx) => {
        if (ctx.callbackQuery && ctx.callbackQuery.data === 'cancel') {
            await ctx.reply('Добавление опции отменено.');
            return ctx.scene.leave();
        }

        if (!ctx.message || !ctx.message.text) return;
        const price = parseInt(ctx.message.text);
        if (isNaN(price)) {
            await ctx.reply('Пожалуйста, введите корректное число:');
            return;
        }

        try {
            // Определяем sortOrder (просто берем кол-во существующих + 1)
            const count = await ConfigOption.count({ where: { groupId: ctx.scene.state.groupId } });
            
            const opt = await ConfigOption.create({
                groupId: ctx.scene.state.groupId,
                id: `opt_${Date.now()}`, // Генерируем простой ID
                name: ctx.wizard.state.name,
                price: price,
                sortOrder: count + 1
            });
            await ctx.reply(`✅ Опция "${opt.name}" успешно добавлена (+${opt.price} ₽)!`);
        } catch (e) {
            console.error(e);
            await ctx.reply('❌ Ошибка при добавлении опции.');
        }
        return ctx.scene.leave();
    }
);

addOptionScene.action('cancel', async (ctx) => {
    await ctx.reply('Отменено.');
    return ctx.scene.leave();
});

module.exports = { addOptionScene };

