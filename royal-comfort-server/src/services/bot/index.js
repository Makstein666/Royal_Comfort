const { Telegraf, session, Scenes } = require('telegraf');
const { Category, ConfigOption, Admin } = require('../../models');
const { isAdmin, addAdminToCache } = require('./utils/constants');

const { mainMenuAdmin, mainMenuClient, backToCatalogInline } = require('./keyboards');
const { setupOrdersHandlers } = require('./handlers/orders');
const { setupCatalogHandlers, pendingActions } = require('./handlers/catalog');
const { setupAdminHandlers } = require('./handlers/admin');

const { addProductScene } = require('./scenes/addProduct');
const { addOptionScene } = require('./scenes/addOption');
const { addPromoScene } = require('./scenes/addPromo');

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error('CRITICAL: BOT_TOKEN is not defined in .env');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Сцены
const stage = new Scenes.Stage([addProductScene, addOptionScene, addPromoScene]);
bot.use(session());
bot.use(stage.middleware());

// Глобальная обработка ошибок
bot.catch((err, ctx) => {
    console.error(`Ошибка для ${ctx.updateType}`, err);
});

// START
bot.start((ctx) => {
    if (isAdmin(ctx)) {
        ctx.reply('👋 Добро пожаловать, Босс!\nСистема управления Royal Comfort активирована.', mainMenuAdmin);
    } else {
        ctx.reply('👋 Добро пожаловать в Royal Service!\nЧем могу помочь?', mainMenuClient);
    }
});

bot.command('id', (ctx) => {
    ctx.reply(`🆔 Ваш Telegram ID: ${ctx.from.id}`);
});

bot.command('admin_login', async (ctx) => {
    const password = ctx.message.text.split(' ')[1];
    const systemPassword = process.env.ADMIN_PASSWORD || 'RoyalAdmin2026';

    if (password === systemPassword) {
        try {
            const [admin, created] = await Admin.findOrCreate({
                where: { telegramId: ctx.from.id },
                defaults: { username: ctx.from.username || 'unknown' }
            });

            addAdminToCache(ctx.from.id);
            ctx.reply('✅ Авторизация успешна! Теперь вы администратор.', mainMenuAdmin);
        } catch (err) {
            console.error('Ошибка при логине админа:', err);
            ctx.reply('❌ Ошибка базы данных при авторизации.');
        }
    } else {
        ctx.reply('❌ Неверный пароль. Использование: /admin_login <пароль>');
    }
});


// Настройка модульных обработчиков
setupOrdersHandlers(bot);
setupCatalogHandlers(bot);
setupAdminHandlers(bot);


// Заглушки для клиентского меню
bot.hears(/Связь с менеджером/i, (ctx) => {
    ctx.reply('📞 Наш телефон: +7 (999) 000-00-00\nTelegram: @RoyalComfortManager');
});

bot.hears(/Каталог проектов/i, (ctx) => {
    ctx.reply('🌐 Наш полный каталог доступен на сайте: https://royalcomfort.ru');
});

bot.hears(/Проверить статус заказа/i, (ctx) => {
    ctx.reply('🔍 Пожалуйста, введите номер вашего заказа (например, RC-2405-A1B2):');
});

// Обработка текстового ввода (для pendingActions)
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    const userId = ctx.from.id;

    // Проверяем, есть ли ожидаемое действие от этого админа
    if (isAdmin(ctx) && pendingActions.has(userId)) {
        const state = pendingActions.get(userId);
        
        if (state.action === 'set_price') {
            const val = parseInt(text);
            if (isNaN(val)) return ctx.reply('⚠️ Введите число. Повторите:');
            
            await Category.update({ basePrice: val }, { where: { id: state.catId } });
            pendingActions.delete(userId);
            return ctx.reply(`✅ Новая базовая цена установлена: ${val.toLocaleString()} ₽`, backToCatalogInline);
        }

        if (state.action === 'set_discount') {
            const val = parseInt(text);
            if (isNaN(val) || val < 0 || val > 100) return ctx.reply('⚠️ Введите число от 0 до 100. Повторите:');
            
            await Category.update({ discountPercent: val }, { where: { id: state.catId } });
            pendingActions.delete(userId);
            return ctx.reply(`✅ Скидка установлена: ${val}%`, backToCatalogInline);
        }

        if (state.action === 'set_opt_price') {
            const val = parseInt(text);
            if (isNaN(val)) return ctx.reply('⚠️ Введите число. Повторите:');
            
            await ConfigOption.update({ price: val }, { where: { id: state.optId } });
            pendingActions.delete(userId);
            return ctx.reply(`✅ Новая цена надбавки установлена: ${val.toLocaleString()} ₽`, backToCatalogInline);
        }
    }
});

const launchBot = async () => {
    try {
        console.log('🤖 Инициализация бота...');
        
        // Загружаем админов из БД в кэш
        const dbAdmins = await Admin.findAll();
        dbAdmins.forEach(a => addAdminToCache(a.telegramId));
        console.log(`👥 Загружено админов из БД: ${dbAdmins.length}`);

        bot.launch().then(() => {

            console.log('✅ 🤖 БОТ ЗАПУЩЕН И ГОТОВ К РАБОТЕ!');
        }).catch(err => {
            console.error('❌ Ошибка при bot.launch():', err);
        });
    } catch (err) {
        console.error('❌ Ошибка в launchBot:', err);
    }
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Функция для вызова извне (например, из ordersController)
const notifyAdminAboutNewOrder = async (orderId, orderDetails) => {
    const admins = await Admin.findAll();
    const message = `🔔 **НОВЫЙ ЗАКАЗ / ЗАЯВКА** 🔔\n\n` +
                    `🆔 ID: ${orderId}\n` +
                    `👤 Клиент: ${orderDetails.clientName}\n` +
                    `📞 Телефон: ${orderDetails.clientPhone}\n` +
                    `💬 Связь: ${orderDetails.contactMethod || 'Не указан'}\n` +
                    `📦 Товар: ${orderDetails.productName || 'Индивидуальный проект'}\n` +
                    `💰 Сумма: ${orderDetails.totalPrice ? orderDetails.totalPrice.toLocaleString() + ' ₽' : 'По расчету'}\n\n` +
                    `⚡️ Перейдите в "В работе" для управления заказом.`;

    for (const admin of admins) {
        try {
            await bot.telegram.sendMessage(admin.telegramId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Управление заказом', callback_data: `manage_${orderId}` }
                    ]]
                }
            });
        } catch (error) {
            console.error(`Ошибка отправки уведомления админу ${admin.telegramId}:`, error);
        }
    }
};

module.exports = { launchBot, notifyAdminAboutNewOrder };
