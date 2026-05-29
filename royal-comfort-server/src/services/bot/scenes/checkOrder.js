const { Scenes, Markup } = require('telegraf');
const { mainMenuClient } = require('../keyboards');
const { Order } = require('../../../models');
const { getStatusIcon } = require('../utils/constants');

const checkOrderScene = new Scenes.BaseScene('CHECK_ORDER_SCENE');

checkOrderScene.enter((ctx) => {
    ctx.reply(
        '🔍 Введите номер вашего заказа:\n(например: RC-2605-1234)',
        Markup.keyboard([['❌ Отмена']]).resize()
    );
});

checkOrderScene.on('text', async (ctx) => {
    const text = ctx.message.text.trim();

    if (text === '❌ Отмена') {
        await ctx.reply('Отменено.', mainMenuClient);
        return ctx.scene.leave();
    }

    try {
        const order = await Order.findByPk(text);

        if (!order) {
            await ctx.reply('❌ Заказ не найден. Проверьте правильность номера (например, RC-2605-1234) или обратитесь к менеджеру.', mainMenuClient);
        } else {
            const icon = getStatusIcon(order.status);
            const msg = `📦 **Информация о заказе**\n\n` +
                        `🆔 Номер: \`${order.id}\`\n` +
                        `🏷 Товар: ${order.productName || 'Индивидуальный проект'}\n` +
                        `💰 Стоимость: ${order.totalPrice ? order.totalPrice.toLocaleString() + ' ₽' : 'Уточняется'}\n` +
                        `📍 **Статус: ${icon} ${order.status}**\n\n` +
                        (order.status === 'Готов к выдаче' ? '🎉 Ваш заказ готов! Мы свяжемся с вами для согласования доставки.' : 'Ожидайте обновления статуса.');
            
            await ctx.reply(msg, {
                parse_mode: 'Markdown',
                reply_markup: mainMenuClient.reply_markup
            });
        }
    } catch (e) {
        console.error('Ошибка проверки заказа клиентом:', e);
        await ctx.reply('❌ Ошибка при поиске. Попробуйте позже.', mainMenuClient);
    }

    return ctx.scene.leave();
});

module.exports = { checkOrderScene };
