const { Markup } = require('telegraf');
const { createBackup, listBackups, restoreBackup } = require('../../../utils/backup');
const { isAdmin } = require('../utils/constants');

const setupAdminHandlers = (bot) => {
    
    // МЕНЮ УПРАВЛЕНИЯ (БЭКАПЫ)
    bot.hears(/Настройки/i, async (ctx) => {
        if (!isAdmin(ctx)) return;
        await showAdminMenu(ctx);
    });

    bot.action('admin_menu', (ctx) => showAdminMenu(ctx, true));

    bot.action('create_backup', async (ctx) => {
        try {
            const filename = await createBackup();
            ctx.answerCbQuery('✅ Бэкап создан');
            ctx.reply(`💾 Резервная копия создана: ${filename}`);
            await showAdminMenu(ctx);
        } catch (e) {
            ctx.answerCbQuery('❌ Ошибка');
            ctx.reply('❌ Не удалось создать бэкап');
        }
    });

    bot.action('list_backups', async (ctx) => {
        const files = listBackups();
        if (files.length === 0) return ctx.answerCbQuery('📭 Бэкапов нет');
        
        const buttons = files.slice(0, 5).map(f => [
            Markup.button.callback(`⏪ ${f}`, `restore_confirm_${f}`)
        ]);
        buttons.push([Markup.button.callback('🔙 Назад', 'admin_menu')]);

        await ctx.editMessageText('⏪ ВЫБЕРИТЕ ФАЙЛ ДЛЯ ОТКАТА\n⚠️ Сайт перезагрузится после выбора!', Markup.inlineKeyboard(buttons));
    });

    bot.action(/restore_confirm_(.+)/, (ctx) => {
        const filename = ctx.match[1];
        ctx.editMessageText(
            `❓ Вы уверены, что хотите откатить базу к состоянию ${filename}?\nВсе текущие изменения будут потеряны!`,
            Markup.inlineKeyboard([
                [Markup.button.callback('✅ ДА, ОТКАТИТЬ', `do_restore_${filename}`)],
                [Markup.button.callback('❌ ОТМЕНА', 'list_backups')]
            ])
        );
    });

    bot.action(/do_restore_(.+)/, async (ctx) => {
        const filename = ctx.match[1];
        try {
            ctx.answerCbQuery('⏳ Восстановление...');
            await ctx.editMessageText(`🚀 Начинаю восстановление из ${filename}...\nСервер будет перезагружен через секунду.`);
            await restoreBackup(filename);
        } catch (e) {
            ctx.reply('❌ Ошибка при восстановлении');
        }
    });
};

async function showAdminMenu(ctx, isEdit = false) {
    const text = '⚙️ АДМИНИСТРИРОВАНИЕ И СИСТЕМА\nЗдесь вы можете управлять состоянием базы данных.';
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('💾 Сделать Backup', 'create_backup')],
        [Markup.button.callback('⏪ Откатить изменения', 'list_backups')],
        [Markup.button.callback('🔙 Главное меню', 'admin_home')]
    ]);

    if (isEdit) {
        try { await ctx.editMessageText(text, keyboard); } catch (e) {}
    } else {
        await ctx.reply(text, keyboard);
    }
}

module.exports = { setupAdminHandlers };
