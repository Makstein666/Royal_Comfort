const { Scenes, Markup } = require('telegraf');
const { mainMenuAdmin } = require('../keyboards');
const { Admin } = require('../../../models');
const { addAdminToCache } = require('../utils/constants');

const addAdminScene = new Scenes.BaseScene('ADD_ADMIN_SCENE');

addAdminScene.enter((ctx) => {
    ctx.reply(
        '👤 Введите Telegram ID нового администратора (только цифры):\n\n' + 
        'Чтобы узнать ID, пользователь может написать боту команду /id.',
        Markup.inlineKeyboard([[Markup.button.callback('❌ Отмена', 'cancel_add_admin')]])
    );
});

addAdminScene.on('text', async (ctx) => {
    const telegramId = parseInt(ctx.message.text.replace(/\s+/g, ''));
    
    if (isNaN(telegramId) || telegramId <= 0) {
        return ctx.reply('⚠️ ID должен состоять только из цифр. Попробуйте еще раз:');
    }

    try {
        const [admin, created] = await Admin.findOrCreate({
            where: { telegramId: telegramId },
            defaults: { username: 'added_by_superadmin', role: 'admin' }
        });

        if (!created && admin.role === 'admin') {
             await ctx.reply('⚠️ Этот пользователь уже является администратором.');
        } else {
             if (!created) {
                 await admin.update({ role: 'admin' });
             }
             addAdminToCache(telegramId);
             await ctx.reply(`✅ Пользователь с ID ${telegramId} успешно назначен администратором!`);
        }
    } catch (error) {
        console.error('Ошибка добавления админа:', error);
        await ctx.reply('❌ Произошла ошибка базы данных при добавлении.');
    }

    return ctx.scene.leave();
});

addAdminScene.action('cancel_add_admin', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('❌ Добавление администратора отменено.');
    ctx.scene.leave();
});

module.exports = { addAdminScene };

