const { Markup } = require('telegraf');
const { createBackup, listBackups, restoreBackup } = require('../../../utils/backup');
const { isAdmin, isSuperAdmin, removeAdminFromCache } = require('../utils/constants');
const { Admin } = require('../../../models');

const setupAdminHandlers = (bot) => {
    
    // МЕНЮ УПРАВЛЕНИЯ (БЭКАПЫ)
    bot.hears(/Настройки/i, async (ctx) => {
        if (!isAdmin(ctx)) return;
        await showAdminMenu(ctx);
    });

    bot.action('admin_menu', (ctx) => showAdminMenu(ctx, true));

    // --- МОДЕРАЦИЯ ОТЗЫВОВ ---
    bot.action('moderate_reviews', async (ctx) => {
        if (!isAdmin(ctx)) return;
        ctx.answerCbQuery();
        await showNextReviewForModeration(ctx);
    });

    bot.action(/approve_review_(.+)/, async (ctx) => {
        if (!isAdmin(ctx)) return;
        const id = ctx.match[1];
        try {
            const { Review } = require('../../../models');
            await Review.update({ isApproved: true }, { where: { id } });
            ctx.answerCbQuery('✅ Отзыв опубликован!');
            await showNextReviewForModeration(ctx);
        } catch (e) { ctx.answerCbQuery('Ошибка'); }
    });

    bot.action(/delete_review_(.+)/, async (ctx) => {
        if (!isAdmin(ctx)) return;
        const id = ctx.match[1];
        try {
            const { Review } = require('../../../models');
            await Review.destroy({ where: { id } });
            ctx.answerCbQuery('❌ Отзыв удален');
            await showNextReviewForModeration(ctx);
        } catch (e) { ctx.answerCbQuery('Ошибка'); }
    });

    // --- БЭКАПЫ ---

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

    // УПРАВЛЕНИЕ АДМИНАМИ (ТОЛЬКО СУПЕРАДМИНЫ)
    bot.action('manage_admins', async (ctx) => {
        if (!isSuperAdmin(ctx)) return ctx.answerCbQuery('❌ Доступно только суперадминам');
        
        try {
            const admins = await Admin.findAll();
            
            let text = '👥 **Управление администраторами**\n\n';
            const buttons = [];

            admins.forEach(admin => {
                const isSuper = admin.role === 'superadmin';
                text += `• ID: ${admin.telegramId} (@${admin.username}) ${isSuper ? '👑 (Суперадмин)' : ''}\n`;
                
                // Добавляем кнопку удаления только для обычных админов
                if (!isSuper) {
                    buttons.push([Markup.button.callback(`❌ Удалить @${admin.username}`, `remove_admin_${admin.telegramId}`)]);
                }
            });

            buttons.push([Markup.button.callback('➕ Добавить админа', 'add_admin_prompt')]);
            buttons.push([Markup.button.callback('🔙 Назад', 'admin_menu')]);

            await ctx.editMessageText(text, {
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard(buttons).reply_markup
            });
        } catch (error) {
            console.error('Ошибка manage_admins:', error);
            ctx.answerCbQuery('❌ Ошибка БД');
        }
    });

    bot.action('add_admin_prompt', (ctx) => {
        if (!isSuperAdmin(ctx)) return ctx.answerCbQuery('❌ Доступно только суперадминам');
        ctx.scene.enter('ADD_ADMIN_SCENE');
    });

    bot.action(/remove_admin_(.+)/, async (ctx) => {
        if (!isSuperAdmin(ctx)) return ctx.answerCbQuery('❌ Отказано');
        const targetId = ctx.match[1];

        try {
            const admin = await Admin.findOne({ where: { telegramId: targetId } });
            if (!admin) return ctx.answerCbQuery('❌ Админ не найден');
            if (admin.role === 'superadmin') return ctx.answerCbQuery('❌ Суперадмина удалить нельзя!');

            await admin.destroy();
            removeAdminFromCache(targetId);

            ctx.answerCbQuery('✅ Админ удален');
            // Перезагружаем список
            const admins = await Admin.findAll();
            let text = '👥 **Управление администраторами**\n\n';
            const buttons = [];
            admins.forEach(a => {
                const isSuper = a.role === 'superadmin';
                text += `• ID: ${a.telegramId} (@${a.username}) ${isSuper ? '👑 (Суперадмин)' : ''}\n`;
                if (!isSuper) {
                    buttons.push([Markup.button.callback(`❌ Удалить @${a.username}`, `remove_admin_${a.telegramId}`)]);
                }
            });
            buttons.push([Markup.button.callback('➕ Добавить админа', 'add_admin_prompt')]);
            buttons.push([Markup.button.callback('🔙 Назад', 'admin_menu')]);

            await ctx.editMessageText(text, {
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard(buttons).reply_markup
            });
        } catch (err) {
            console.error('Ошибка удаления админа:', err);
            ctx.answerCbQuery('❌ Ошибка удаления');
        }
    });

    bot.action('manage_referrals', async (ctx) => {
        if (!isAdmin(ctx)) return;
        ctx.answerCbQuery();
        await showReferralsListWithPagination(ctx, 0);
    });

    bot.action(/manage_referrals_page_(.+)/, async (ctx) => {
        if (!isAdmin(ctx)) return;
        const page = parseInt(ctx.match[1]) || 0;
        ctx.answerCbQuery();
        await showReferralsListWithPagination(ctx, page);
    });
};

async function showAdminMenu(ctx, isEdit = false) {
    const text = '⚙️ АДМИНИСТРИРОВАНИЕ И СИСТЕМА\nЗдесь вы можете управлять состоянием базы данных и контентом.';
    const buttons = [
        [Markup.button.callback('⭐️ Модерация отзывов', 'moderate_reviews')],
        [Markup.button.callback('🎁 Управление рефералами', 'manage_referrals')],
        [Markup.button.callback('💾 Сделать Backup', 'create_backup')],
        [Markup.button.callback('⏪ Откатить изменения', 'list_backups')]
    ];

    if (isSuperAdmin(ctx)) {
        buttons.push([Markup.button.callback('👥 Управление админами', 'manage_admins')]);
    }
    
    buttons.push([Markup.button.callback('🔙 Главное меню', 'admin_home')]);

    const keyboard = Markup.inlineKeyboard(buttons);

    if (isEdit) {
        try { 
            await ctx.editMessageText(text, keyboard); 
        } catch (e) {
            try { await ctx.deleteMessage(); } catch (err) {}
            await ctx.reply(text, keyboard);
        }
    } else {
        await ctx.reply(text, keyboard);
    }
}

async function showNextReviewForModeration(ctx) {
    try {
        const { Review } = require('../../../models');
        const count = await Review.count({ where: { isApproved: false } });
        
        if (count === 0) {
            const text = '📭 Новых отзывов для модерации нет.';
            const buttons = Markup.inlineKeyboard([
                [Markup.button.callback('🔙 Назад', 'admin_menu')]
            ]);
            
            try {
                await ctx.editMessageText(text, buttons);
            } catch (err) {
                try { await ctx.deleteMessage(); } catch (e) {}
                await ctx.reply(text, buttons);
            }
            return;
        }

        const review = await Review.findOne({ where: { isApproved: false } });
        if (!review) return;

        const text = `⭐️ **МОДЕРАЦИЯ ОТЗЫВА** (Осталось: ${count}) ⭐️\n\n` +
                     `👤 **Автор:** ${review.author}\n` +
                     `⭐️ **Оценка:** ${review.rating}/5\n` +
                     `📦 **Товар:** ${review.productName || 'Не указан'}\n` +
                     `💬 **Текст:** ${review.text}`;

        const buttons = Markup.inlineKeyboard([
            [Markup.button.callback('✅ Опубликовать на сайте', `approve_review_${review.id}`)],
            [Markup.button.callback('❌ Удалить отзыв', `delete_review_${review.id}`)],
            [Markup.button.callback('🔙 Назад в меню', 'admin_menu')]
        ]);

        try { await ctx.deleteMessage(); } catch (e) {}

        if (review.images && review.images.length > 0) {
            await ctx.replyWithPhoto(review.images[0], {
                caption: text,
                parse_mode: 'Markdown',
                reply_markup: buttons.reply_markup
            });
        } else {
            await ctx.reply(text, {
                parse_mode: 'Markdown',
                reply_markup: buttons.reply_markup
            });
        }
    } catch (e) {
        console.error(e);
        ctx.reply('❌ Ошибка загрузки отзывов');
    }
}

async function showReferralsListWithPagination(ctx, page = 0) {
    try {
        const { ReferralCode } = require('../../../models');
        const limit = 5;
        const offset = page * limit;

        const { count, rows: referrals } = await ReferralCode.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        if (count === 0) {
            return ctx.editMessageText('📭 Созданных реферальных кодов пока нет.', Markup.inlineKeyboard([
                [Markup.button.callback('🔙 Назад', 'admin_menu')]
            ]));
        }

        let text = `🎁 **Управление реферальными кодами** (Всего: ${count})\n\n`;
        const buttons = [];

        referrals.forEach(ref => {
            const statusIcon = ref.isUsed ? '🔴 (Использован)' : '🟢 (Активен)';
            text += `• **Код:** \`${ref.code}\`\n` +
                    `  👤 Владелец: ${ref.ownerName} (${ref.ownerPhone})\n` +
                    `  📊 Статус: ${statusIcon}\n`;
            
            if (ref.isUsed && ref.usedByOrderId) {
                text += `  🛒 Заказ: \`${ref.usedByOrderId}\`\n`;
                buttons.push([Markup.button.callback(`🔍 Заказ ${ref.usedByOrderId}`, `manage_${ref.usedByOrderId}`)]);
            }
            text += `\n`;
        });

        const navButtons = [];
        if (page > 0) {
            navButtons.push(Markup.button.callback('⬅️ Предыдущие', `manage_referrals_page_${page - 1}`));
        }
        if (offset + limit < count) {
            navButtons.push(Markup.button.callback('Следующие ➡️', `manage_referrals_page_${page + 1}`));
        }
        if (navButtons.length > 0) {
            buttons.push(navButtons);
        }

        buttons.push([Markup.button.callback('🔙 Назад в меню', 'admin_menu')]);

        const totalPages = Math.ceil(count / limit);
        text += `Страница ${page + 1} из ${totalPages}`;

        try {
            await ctx.editMessageText(text, {
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard(buttons).reply_markup
            });
        } catch (e) {
            try { await ctx.deleteMessage(); } catch (err) {}
            await ctx.reply(text, {
                parse_mode: 'Markdown',
                reply_markup: Markup.inlineKeyboard(buttons).reply_markup
            });
        }
    } catch (error) {
        console.error('Ошибка в showReferralsListWithPagination:', error);
        ctx.reply('❌ Ошибка при получении списка реферальных кодов.');
    }
}

module.exports = { setupAdminHandlers };
