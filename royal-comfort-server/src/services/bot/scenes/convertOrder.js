const { Scenes, Markup } = require('telegraf');
const { mainMenuAdmin } = require('../keyboards');
const { Order } = require('../../../models');

const convertOrderScene = new Scenes.BaseScene('CONVERT_CONSULTATION_SCENE');

convertOrderScene.enter((ctx) => {
    ctx.reply(
        '🔄 Перевод консультации в заказ.\n\n' +
        'Пожалуйста, введите название товара или услуги, на которую согласился клиент (например: "Чан Алтай 2 метра" или "Индивидуальный проект"):',
        Markup.inlineKeyboard([[Markup.button.callback('❌ Отмена', 'cancel_convert')]])
    );
});

convertOrderScene.on('text', async (ctx) => {
    const productName = ctx.message.text.trim();
    const orderId = ctx.session.convertOrderId;

    if (!orderId) {
        ctx.reply('⚠️ Ошибка: ID заказа утерян. Попробуйте снова.');
        return ctx.scene.leave();
    }

    try {
        const order = await Order.findByPk(orderId);
        
        if (!order) {
            ctx.reply('❌ Заказ не найден в базе.');
            return ctx.scene.leave();
        }

        // Обновляем заказ
        await order.update({
            type: 'order',
            productName: productName,
            status: 'Обработка',
            history: [
                ...order.history,
                { title: 'Заказ оформлен', date: new Date().toLocaleDateString('ru-RU') }
            ]
        });

        await ctx.reply(
            `✅ Успешно! Консультация переведена в полноценный заказ.\n\n` +
            `📦 Товар: ${productName}\n` +
            `🆔 ID заказа: \`${orderId}\`\n\n` +
            `Сообщите этот ID клиенту, чтобы он мог отслеживать статус на сайте.`,
            { parse_mode: 'Markdown' }
        );

    } catch (error) {
        console.error('Ошибка перевода в заказ:', error);
        ctx.reply('❌ Ошибка базы данных.');
    }

    delete ctx.session.convertOrderId;
    return ctx.scene.leave();
});

convertOrderScene.action('cancel_convert', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('❌ Операция отменена.');
    delete ctx.session.convertOrderId;
    ctx.scene.leave();
});

module.exports = { convertOrderScene };

