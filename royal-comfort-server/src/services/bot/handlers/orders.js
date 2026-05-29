const { Markup } = require('telegraf');
const { Order } = require('../../../models');
const { Op } = require('sequelize');
const { isAdmin, getStatusIcon } = require('../utils/constants');

const setupOrdersHandlers = (bot) => {
    
    bot.hears(/В работе/i, (ctx) => {
        if (!isAdmin(ctx)) return;
        showOrderList(ctx, { activeOnly: true, page: 0 });
    });

    bot.hears(/История заявок/i, (ctx) => {
        if (!isAdmin(ctx)) return;
        showOrderList(ctx, { activeOnly: false, page: 0 });
    });

    bot.hears(/Статистика/i, async (ctx) => {
        if (!isAdmin(ctx)) return;
        try {
            const total = await Order.count();
            const active = await Order.count({ where: { status: { [Op.notIn]: ['Вручение', 'Отменен'] } } });
            const income = await Order.sum('totalPrice', { where: { status: { [Op.ne]: 'Отменен' }, type: 'order' } }) || 0;
            ctx.reply(`📊 Статистика\n💰 Оборот: ${income.toLocaleString()} ₽\n📝 Всего заявок: ${total}\n⚡️ В работе: ${active}`);
        } catch (e) { ctx.reply('❌ Ошибка при получении статистики'); }
    });

    bot.hears(/Поиск/i, async (ctx) => {
        if (!isAdmin(ctx)) return;
        ctx.reply('🔍 Введите данные для поиска (Имя, Телефон, Название товара или Цена):', Markup.forceReply());
    });

    bot.action('refresh_active', (ctx) => {
        ctx.answerCbQuery('Обновлено');
        return showOrderList(ctx, { activeOnly: true, page: 0 }, true);
    });
    bot.action('refresh_history', (ctx) => {
        ctx.answerCbQuery('Обновлено');
        return showOrderList(ctx, { activeOnly: false, page: 0 }, true);
    });
    bot.action('back_to_list', (ctx) => {
        ctx.answerCbQuery();
        return showOrderList(ctx, { activeOnly: false, page: 0 }, true);
    });

    bot.action(/orders_active_page_(.+)/, (ctx) => {
        const page = parseInt(ctx.match[1]) || 0;
        ctx.answerCbQuery();
        return showOrderList(ctx, { activeOnly: true, page }, true);
    });

    bot.action(/orders_history_page_(.+)/, (ctx) => {
        const page = parseInt(ctx.match[1]) || 0;
        ctx.answerCbQuery();
        return showOrderList(ctx, { activeOnly: false, page }, true);
    });

    const getOrderButtons = (order) => {
        if (order.type === 'consultation') {
            return [
                [Markup.button.callback('🔄 Перевести в заказ', `convert_consultation_${order.id}`)],
                [Markup.button.callback('✅ Завершить', `set_${order.id}_Завершен`), Markup.button.callback('❌ Удалить', `confirm_delete_${order.id}`)],
                [Markup.button.callback('🔙 Назад', 'back_to_list')]
            ];
        }
        
        return [
            [Markup.button.callback('⏳ Обработка', `set_${order.id}_Обработка`), Markup.button.callback('📞 Уточнение', `set_${order.id}_Уточнение деталей`)],
            [Markup.button.callback('🤝 Утверждение', `set_${order.id}_Утверждение`), Markup.button.callback('🔨 Пр-во', `set_${order.id}_Производство`)],
            [Markup.button.callback('🚚 Доставка', `set_${order.id}_Доставка`), Markup.button.callback('🛠 Установка', `set_${order.id}_Установка`)],
            [Markup.button.callback('✅ Завершен', `set_${order.id}_Завершен`), Markup.button.callback('⛔️ Отмена', `set_${order.id}_Отменен`)],
            [Markup.button.callback('❌ Удалить', `confirm_delete_${order.id}`), Markup.button.callback('🔙 Назад', 'back_to_list')]
        ];
    };

    // ВАЖНО: только заказы — не трогаем manage_prod_, manage_referrals_, manage_admins и другие
    bot.action(/^manage_(?!prod_|referrals|admins)(.+)$/, async (ctx) => {
        try {
            const id = ctx.match[1];
            if (id.startsWith('delete_') || id.startsWith('set_') || id.startsWith('convert_') || id.startsWith('confirm_')) return;
            const order = await Order.findByPk(id);
            if (!order) return ctx.answerCbQuery('Заказ не найден');
            const info = await getOrderDetailsText(order);
            ctx.editMessageText(info, Markup.inlineKeyboard(getOrderButtons(order)));
        } catch (e) { ctx.answerCbQuery('Ошибка'); }
    });

    bot.action(/set_(.+)_(.+)/, async (ctx) => {
        const id = ctx.match[1];
        const newStatus = ctx.match[2];
        try {
            await Order.update({ status: newStatus }, { where: { id } });
            await ctx.answerCbQuery(`✅ Статус: ${newStatus}`);
            const order = await Order.findByPk(id);
            if (!order) return;
            const info = await getOrderDetailsText(order);
            await ctx.editMessageText(info, Markup.inlineKeyboard(getOrderButtons(order)));
        } catch (e) {
            console.error('Ошибка при смене статуса:', e);
            ctx.answerCbQuery('❌ Ошибка при смене статуса').catch(() => {});
        }
    });

    bot.action(/convert_consultation_(.+)/, (ctx) => {
        ctx.session.convertOrderId = ctx.match[1];
        ctx.scene.enter('CONVERT_CONSULTATION_SCENE');
    });

    bot.action(/confirm_delete_(.+)/, (ctx) => ctx.editMessageText(
        `Удалить заказ ${ctx.match[1]}?`,
        Markup.inlineKeyboard([
            [Markup.button.callback('🗑 ДА', `delete_${ctx.match[1]}`)],
            [Markup.button.callback('🔙 Назад', `manage_${ctx.match[1]}`)]
        ])
    ));

    bot.action(/delete_(.+)/, async (ctx) => {
        await Order.destroy({ where: { id: ctx.match[1] } });
        ctx.answerCbQuery('Удалено');
        showOrderList(ctx, { activeOnly: false, page: 0 }, true);
    });
};

async function showOrderList(ctx, options = {}, isEdit = false) {
    try {
        const limit = 5;
        const page = options.page || 0;
        const offset = page * limit;
        const activeOnly = !!options.activeOnly;

        const where = activeOnly ? { status: { [Op.notIn]: ['Вручение', 'Отменен'] } } : {};
        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        if (count === 0) {
            const msg = activeOnly ? '📭 Активных заказов нет' : '📭 История пуста';
            return isEdit ? ctx.editMessageText(msg) : ctx.reply(msg);
        }

        const buttons = orders.map(o => {
            const icon = o.type === 'consultation' ? '📞' : '📦';
            return [Markup.button.callback(`${icon} ${getStatusIcon(o.status)} ${o.clientName} (${(o.totalPrice || 0).toLocaleString()}₽)`, `manage_${o.id}`)];
        });

        // Пагинационные кнопки
        const navButtons = [];
        const actionPrefix = activeOnly ? 'orders_active_page' : 'orders_history_page';
        
        if (page > 0) {
            navButtons.push(Markup.button.callback('⬅️ Предыдущие', `${actionPrefix}_${page - 1}`));
        }
        if (offset + limit < count) {
            navButtons.push(Markup.button.callback('Следующие ➡️', `${actionPrefix}_${page + 1}`));
        }
        if (navButtons.length > 0) {
            buttons.push(navButtons);
        }

        buttons.push([Markup.button.callback('🔄 Обновить', activeOnly ? 'refresh_active' : 'refresh_history')]);

        const totalPages = Math.ceil(count / limit);
        const text = (activeOnly ? '⚡️ В РАБОТЕ' : '🗂 АРХИВ') + ` (Страница ${page + 1} из ${totalPages})`;
        
        if (isEdit) {
            try { await ctx.editMessageText(text, Markup.inlineKeyboard(buttons)); } catch (e) {}
        } else {
            await ctx.reply(text, Markup.inlineKeyboard(buttons));
        }
    } catch (e) {
        console.error('❌ Ошибка SQL:', e);
        ctx.reply('⚠️ Ошибка базы данных');
    }
}

async function getOrderDetailsText(order) {
    let info = `🆔 ${order.id}\n👤 ${order.clientName}\n📞 ${order.clientPhone}\n💬 Тип: ${order.type === 'consultation' ? 'Консультация' : 'Заказ'}\n📍 Статус: ${order.status}\n💰 Сумма: ${order.totalPrice ? order.totalPrice.toLocaleString() + ' ₽' : 'Не указана'}`;
    
    if (order.referralCode) {
        info += `\n🎁 Реф. код: ${order.referralCode}`;
        try {
            const { ReferralCode } = require('../../../models');
            const ref = await ReferralCode.findByPk(order.referralCode.trim().toUpperCase());
            if (ref) {
                info += `\n👤 Привел: ${ref.ownerName} (${ref.ownerPhone})`;
            }
        } catch (e) {
            console.error(e);
        }
    }
    
    return info;
}

module.exports = { setupOrdersHandlers };
