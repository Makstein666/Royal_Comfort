const { Markup } = require('telegraf');
const { Order } = require('../../../models');
const { Op } = require('sequelize');
const { isAdmin, getStatusIcon, getOrderStatusInfo, IMAGES } = require('../utils/constants');

const setupOrdersHandlers = (bot) => {
    
    bot.hears(/В работе/i, (ctx) => {
        if (!isAdmin(ctx)) return;
        showOrderList(ctx, { activeOnly: true });
    });

    bot.hears(/История заявок/i, (ctx) => {
        if (!isAdmin(ctx)) return;
        showOrderList(ctx, { activeOnly: false });
    });

    bot.hears(/Статистика/i, async (ctx) => {
        if (!isAdmin(ctx)) return;
        try {
            const total = await Order.count();
            const active = await Order.count({ where: { status: { [Op.notIn]: ['Вручение', 'Отменен'] } } });
            const income = await Order.sum('totalPrice', { where: { status: { [Op.ne]: 'Отменен' }, type: 'order' } }) || 0;
            ctx.reply(`📊 Статистика\n💰 Оборот: ${income.toLocaleString()} ₽\n📝 Всего заявок: ${total}\n⚡️ В работе: ${active}`);
        } catch (e) {
            ctx.reply('❌ Ошибка при получении статистики');
        }
    });

    bot.action('refresh_active', (ctx) => {
        ctx.answerCbQuery('Обновлено');
        return showOrderList(ctx, { activeOnly: true }, true);
    });
    bot.action('refresh_history', (ctx) => {
        ctx.answerCbQuery('Обновлено');
        return showOrderList(ctx, { activeOnly: false }, true);
    });
    bot.action('back_to_list', (ctx) => {
        ctx.answerCbQuery();
        return showOrderList(ctx, { activeOnly: false }, true);
    });

    bot.action(/manage_(.+)/, async (ctx) => {
        try {
            const id = ctx.match[1];
            const order = await Order.findByPk(id);
            if (!order) return ctx.answerCbQuery('Заказ не найден');
            const info = `🆔 ${order.id}\n👤 ${order.clientName}\n📞 ${order.clientPhone}\n💬 Тип: ${order.type === 'consultation' ? 'Консультация' : 'Заказ'}\n📍 Статус: ${order.status}\n💰 Сумма: ${order.totalPrice ? order.totalPrice.toLocaleString() + ' ₽' : 'Не указана'}`;
            ctx.editMessageText(info, Markup.inlineKeyboard([
                [Markup.button.callback('🔨 В пр-ве', `set_${order.id}_В производстве`), Markup.button.callback('🚚 Доставка', `set_${order.id}_Доставка`)],
                [Markup.button.callback('✅ Вручение', `set_${order.id}_Вручение`), Markup.button.callback('⛔️ Отмена', `set_${order.id}_Отменен`)],
                [Markup.button.callback('❌ Удалить', `confirm_delete_${order.id}`)],
                [Markup.button.callback('🔙 Назад', 'back_to_list')]
            ]));
        } catch (e) { ctx.answerCbQuery('Ошибка'); }
    });

    bot.action(/set_(.+)_(.+)/, async (ctx) => {
        const id = ctx.match[1];
        const newStatus = ctx.match[2];
        await Order.update({ status: newStatus }, { where: { id } });
        ctx.answerCbQuery(`✅ Статус: ${newStatus}`);
        const order = await Order.findByPk(id);
        const info = `🆔 ${order.id}\n👤 ${order.clientName}\n📞 ${order.clientPhone}\n💬 Тип: ${order.type === 'consultation' ? 'Консультация' : 'Заказ'}\n📍 Статус: ${order.status}\n💰 Сумма: ${order.totalPrice ? order.totalPrice.toLocaleString() + ' ₽' : 'Не указана'}`;
        ctx.editMessageText(info, Markup.inlineKeyboard([
            [Markup.button.callback('🔨 В пр-ве', `set_${id}_В производстве`), Markup.button.callback('🚚 Доставка', `set_${id}_Доставка`)],
            [Markup.button.callback('✅ Вручение', `set_${id}_Вручение`), Markup.button.callback('⛔️ Отмена', `set_${id}_Отменен`)],
            [Markup.button.callback('❌ Удалить', `confirm_delete_${id}`)],
            [Markup.button.callback('🔙 Назад', 'back_to_list')]
        ]));
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
        showOrderList(ctx, { activeOnly: false }, true);
    });
};

async function showOrderList(ctx, options = {}, isEdit = false) {
    try {
        const where = options.activeOnly ? { status: { [Op.notIn]: ['Вручение', 'Отменен'] } } : {};
        const orders = await Order.findAll({ where, limit: 10, order: [['createdAt', 'DESC']] });

        if (orders.length === 0) {
            const msg = options.activeOnly ? '📭 Активных заказов нет' : '📭 История пуста';
            return isEdit ? ctx.editMessageText(msg) : ctx.reply(msg);
        }

        const buttons = orders.map(o => {
            const icon = o.type === 'consultation' ? '📞' : '📦';
            return [Markup.button.callback(`${icon} ${getStatusIcon(o.status)} ${o.clientName} (${o.totalPrice || 0}₽)`, `manage_${o.id}`)];
        });
        buttons.push([Markup.button.callback('🔄 Обновить', options.activeOnly ? 'refresh_active' : 'refresh_history')]);

        const text = options.activeOnly ? '⚡️ В РАБОТЕ' : '🗂 АРХИВ';
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

module.exports = { setupOrdersHandlers };
