const { Telegraf, Markup } = require('telegraf');
const { Order, Review, Category, ConfigGroup, ConfigOption } = require('../models');
const { Op } = require('sequelize');

require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN || '8424726635:AAE-dDjAwM6tfPsr-K1ZhqDfp6mKrZ5KK2I';
const ADMIN_IDS = [1078381605];

const bot = new Telegraf(BOT_TOKEN);

bot.catch((err) => console.error('🔴 Ошибка бота:', err));

// --- ИЗОБРАЖЕНИЯ ---
const IMAGES = {
    welcome: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000',
    status_new: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=1000',
    status_production: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000',
    status_delivery: 'https://images.unsplash.com/photo-1605218457233-bc2747372b3b?q=80&w=1000',
    status_done: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000',
    notFound: 'https://cdn-icons-png.flaticon.com/512/2748/2748558.png'
};

// --- ХЕЛПЕРЫ ---
const isAdmin = (ctx) => ADMIN_IDS.includes(ctx.from.id);

function getStatusIcon(s) {
    if (s === 'Новый') return '🆕';
    if (s === 'Вручение') return '✅';
    if (s === 'Отменен') return '⛔️';
    return '🔄';
}

function getOrderStatusInfo(s) {
    let p = '🟩⬜️⬜️⬜️⬜️ 20%', d = 'Принято', i = IMAGES.status_new;
    if (s === 'В производстве') { p = '🟩🟩🟩⬜️⬜️ 60%'; d = 'Сборка'; i = IMAGES.status_production; }
    else if (s === 'Доставка') { p = '🟩🟩🟩🟩🚀 90%'; d = 'Едет к вам'; i = IMAGES.status_delivery; }
    else if (s === 'Вручение') { p = '🟩🟩🟩🟩🟩 100%'; d = 'Готово'; i = IMAGES.status_done; }
    return { image: i, progress: p, desc: d };
}

// --- МЕНЮ ---
const mainMenuAdmin = Markup.keyboard([
    ['⚡️ В работе', '🗂 История заявок'],
    ['📊 Статистика', '🛍 Каталог']
]).resize();

const mainMenuClient = Markup.keyboard([
    ['🔍 Проверить статус заказа'],
    ['📒 Каталог проектов', '📞 Связь с менеджером']
]).resize();

const backToAdminMenu = Markup.keyboard([
    ['👨‍💼 Вернуться в Админку']
]).resize();

// ==========================================
// START
// ==========================================
bot.start((ctx) => {
    if (isAdmin(ctx)) return ctx.reply('👨‍💼 Панель администратора', mainMenuAdmin);
    ctx.replyWithPhoto(IMAGES.welcome, {
        caption: '🌲 Добро пожаловать в Royal Comfort!\n👇 Выберите действие:',
        ...mainMenuClient
    });
});

bot.hears(/Вернуться в Админку/i, (ctx) => {
    if (isAdmin(ctx)) ctx.reply('🔙 Главное меню', mainMenuAdmin);
});

// ==========================================
// ЗАКАЗЫ (существующая логика)
// ==========================================
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

async function showOrderList(ctx, options = {}, isEdit = false) {
    if (!isAdmin(ctx)) return;
    try {
        const where = options.activeOnly ? { status: { [Op.notIn]: ['Вручение', 'Отменен'] } } : {};
        const orders = await Order.findAll({ where, limit: 10, order: [['createdAt', 'DESC']] });

        if (orders.length === 0) {
            const msg = options.activeOnly ? '📭 Активных заказов нет' : '📭 История пуста';
            return isEdit ? ctx.editMessageText(msg) : ctx.reply(msg);
        }

        const buttons = orders.map(o => {
            const icon = o.type === 'consultation' ? '📞' : '📦';
            return [Markup.button.callback(`${icon} ${getStatusIcon(o.status)} ${o.clientName} (${o.totalPrice}₽)`, `manage_${o.id}`)];
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

bot.action('refresh_active', (ctx) => showOrderList(ctx, { activeOnly: true }, true));
bot.action('refresh_history', (ctx) => showOrderList(ctx, { activeOnly: false }, true));
bot.action('back_to_list', (ctx) => showOrderList(ctx, { activeOnly: false }, true));

bot.action(/manage_(.+)/, async (ctx) => {
    try {
        const id = ctx.match[1];
        const order = await Order.findByPk(id);
        if (!order) return ctx.answerCbQuery('Заказ не найден');
        const info = `🆔 ${order.id}\n👤 ${order.clientName}\n📞 ${order.clientPhone}\n📍 ${order.status}\n💰 ${order.totalPrice} ₽`;
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
    const info = `🆔 ${order.id}\n👤 ${order.clientName}\n📞 ${order.clientPhone}\n📍 ${order.status}\n💰 ${order.totalPrice} ₽`;
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

// ==========================================
// 🛍 КАТАЛОГ — НОВЫЙ РАЗДЕЛ
// ==========================================
bot.hears(/Каталог/i, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await showCatalogMenu(ctx);
});

async function showCatalogMenu(ctx, isEdit = false) {
    const categories = await Category.findAll({ order: [['sortOrder', 'ASC']] });
    const buttons = categories.map(cat => {
        const icon = cat.isActive ? '🟢' : '🔴';
        const discount = cat.discountPercent > 0 ? ` 🏷-${cat.discountPercent}%` : '';
        return [Markup.button.callback(`${icon} ${cat.name}${discount}`, `cat_${cat.id}`)];
    });
    buttons.push([Markup.button.callback('🔙 Главное меню', 'admin_home')]);

    const text = '🛍 УПРАВЛЕНИЕ КАТАЛОГОМ\n🟢 = активна на сайте  🔴 = скрыта';
    if (isEdit) {
        try { await ctx.editMessageText(text, Markup.inlineKeyboard(buttons)); } catch (e) {}
    } else {
        await ctx.reply(text, Markup.inlineKeyboard(buttons));
    }
}

bot.action('catalog_menu', (ctx) => showCatalogMenu(ctx, true));
bot.action('admin_home', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('👨‍💼 Главное меню', mainMenuAdmin);
});

// --- Управление конкретной категорией ---
bot.action(/cat_(.+)/, async (ctx) => {
    const catId = ctx.match[1];
    await showCategoryMenu(ctx, catId);
});

async function showCategoryMenu(ctx, catId) {
    const cat = await Category.findByPk(catId);
    if (!cat) return ctx.answerCbQuery('Не найдено');

    const statusText = cat.isActive ? '✅ Активна' : '❌ Скрыта';
    const discountText = cat.discountPercent > 0 ? `🏷 ${cat.discountPercent}%` : 'нет';
    const toggleLabel = cat.isActive ? '🔴 Скрыть на сайте' : '🟢 Показать на сайте';

    const text = `📦 ${cat.name}\n💰 Базовая цена: ${(cat.basePrice || 0).toLocaleString()} ₽\n🏷 Скидка: ${discountText}\n📊 Статус: ${statusText}`;

    await ctx.editMessageText(text, Markup.inlineKeyboard([
        [Markup.button.callback('✏️ Изменить базовую цену', `edit_price_${catId}`)],
        [Markup.button.callback('🏷 Установить скидку', `edit_discount_${catId}`)],
        [Markup.button.callback('🔧 Опции конфигуратора', `cat_opts_${catId}`)],
        [Markup.button.callback(toggleLabel, `toggle_cat_${catId}`)],
        [Markup.button.callback('🔙 К каталогу', 'catalog_menu')]
    ]));
}

// --- Включить/выключить категорию ---
bot.action(/toggle_cat_(.+)/, async (ctx) => {
    const catId = ctx.match[1];
    const cat = await Category.findByPk(catId);
    if (!cat) return ctx.answerCbQuery('Не найдено');
    if (catId === 'custom') return ctx.answerCbQuery('⚠️ Этот блок всегда активен');

    await cat.update({ isActive: !cat.isActive });
    const status = cat.isActive ? 'скрыта' : 'активирована';
    ctx.answerCbQuery(`✅ Категория ${status}`);
    await showCategoryMenu(ctx, catId);
});

// --- Состояния ожидания ввода ---
const pendingActions = new Map(); // userId -> { action, catId, optId }

// --- Изменить базовую цену ---
bot.action(/edit_price_(.+)/, async (ctx) => {
    const catId = ctx.match[1];
    pendingActions.set(ctx.from.id, { action: 'set_price', catId });
    ctx.answerCbQuery();
    await ctx.reply(`💰 Введите новую базовую цену для категории (только цифры):\nПример: 95000`, Markup.forceReply());
});

// --- Установить скидку ---
bot.action(/edit_discount_(.+)/, async (ctx) => {
    const catId = ctx.match[1];
    pendingActions.set(ctx.from.id, { action: 'set_discount', catId });
    ctx.answerCbQuery();
    await ctx.reply(`🏷 Введите скидку в % (0 = убрать скидку):\nПример: 15`, Markup.forceReply());
});

// --- Опции конфигуратора ---
bot.action(/cat_opts_(.+)/, async (ctx) => {
    const catId = ctx.match[1];
    const groups = await ConfigGroup.findAll({
        where: { categoryId: catId },
        order: [['sortOrder', 'ASC']],
        include: [{ model: ConfigOption, as: 'options', order: [['sortOrder', 'ASC']] }]
    });

    if (groups.length === 0) {
        return ctx.editMessageText(
            `🔧 У категории пока нет опций конфигуратора.\nОпции нужно добавить через панель разработчика.`,
            Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', `cat_${catId}`)]])
        );
    }

    const buttons = [];
    for (const group of groups) {
        buttons.push([Markup.button.callback(`📋 ${group.title}`, `group_${group.id}`)]);
    }
    buttons.push([Markup.button.callback('🔙 Назад', `cat_${catId}`)]);

    await ctx.editMessageText(`🔧 ГРУППЫ ОПЦИЙ`, Markup.inlineKeyboard(buttons));
});

// --- Управление группой опций ---
bot.action(/group_(.+)/, async (ctx) => {
    const groupId = ctx.match[1];
    const group = await ConfigGroup.findByPk(groupId, {
        include: [{ model: ConfigOption, as: 'options', order: [['sortOrder', 'ASC']] }]
    });
    if (!group) return ctx.answerCbQuery('Не найдено');

    const buttons = group.options.map(opt => [
        Markup.button.callback(
            `${opt.name} — ${opt.price === 0 ? 'В базе' : '+' + opt.price.toLocaleString() + ' ₽'}`,
            `opt_${opt.id}`
        )
    ]);
    buttons.push([Markup.button.callback('🔙 Назад', `cat_opts_${group.categoryId}`)]);

    await ctx.editMessageText(`📋 ${group.title}`, Markup.inlineKeyboard(buttons));
});

// --- Управление опцией ---
bot.action(/opt_(.+)/, async (ctx) => {
    const optId = ctx.match[1];
    const opt = await ConfigOption.findByPk(optId);
    if (!opt) return ctx.answerCbQuery('Не найдено');

    const priceText = opt.price === 0 ? 'В базе (0 ₽)' : `+${opt.price.toLocaleString()} ₽`;
    await ctx.editMessageText(
        `⚙️ Опция: ${opt.name}\n💰 Надбавка: ${priceText}`,
        Markup.inlineKeyboard([
            [Markup.button.callback('✏️ Изменить цену надбавки', `edit_opt_price_${optId}`)],
            [Markup.button.callback('🔙 Назад', `group_${opt.groupId}`)]
        ])
    );
});

// --- Изменить цену опции ---
bot.action(/edit_opt_price_(.+)/, async (ctx) => {
    const optId = ctx.match[1];
    pendingActions.set(ctx.from.id, { action: 'set_opt_price', optId });
    ctx.answerCbQuery();
    await ctx.reply(`✏️ Введите новую надбавку к цене (0 = входит в базу):\nПример: 35000`, Markup.forceReply());
});

// ==========================================
// ОБРАБОТКА ТЕКСТОВЫХ ОТВЕТОВ
// ==========================================
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();
    const userId = ctx.from.id;

    // Проверяем ожидание ввода от администратора
    if (isAdmin(ctx) && pendingActions.has(userId)) {
        const pending = pendingActions.get(userId);
        pendingActions.delete(userId);

        if (pending.action === 'set_price') {
            const price = parseInt(text.replace(/\D/g, ''));
            if (isNaN(price)) return ctx.reply('❌ Введите корректное число');
            await Category.update({ basePrice: price }, { where: { id: pending.catId } });
            const cat = await Category.findByPk(pending.catId);
            return ctx.reply(`✅ Базовая цена для «${cat.name}» установлена: ${price.toLocaleString()} ₽\n\nОбновление отразится на сайте при следующем обращении.`);
        }

        if (pending.action === 'set_discount') {
            const discount = parseInt(text.replace(/\D/g, ''));
            if (isNaN(discount) || discount < 0 || discount > 99) return ctx.reply('❌ Введите число от 0 до 99');
            await Category.update({ discountPercent: discount }, { where: { id: pending.catId } });
            const cat = await Category.findByPk(pending.catId);
            const msg = discount === 0
                ? `✅ Скидка для «${cat.name}» убрана`
                : `✅ Скидка для «${cat.name}»: ${discount}% установлена`;
            return ctx.reply(msg);
        }

        if (pending.action === 'set_opt_price') {
            const price = parseInt(text.replace(/\D/g, ''));
            if (isNaN(price)) return ctx.reply('❌ Введите корректное число');
            await ConfigOption.update({ price }, { where: { id: pending.optId } });
            const opt = await ConfigOption.findByPk(pending.optId);
            return ctx.reply(`✅ Надбавка для «${opt.name}»: ${price === 0 ? 'в базе' : '+' + price.toLocaleString() + ' ₽'}`);
        }
        return;
    }

    // Игнорируем кнопки меню
    const menuItems = ['⚡️ В работе', '🗂 История заявок', '📊 Статистика', '🛍 Каталог', '👨‍💼 Вернуться в Админку'];
    if (menuItems.some(cmd => text.includes(cmd.replace(/[⚡️🗂📊🛍👨‍💼]/g, '').trim()))) return;

    // Поиск заказа по номеру
    if (text.toUpperCase().startsWith('RC-')) {
        try {
            const order = await Order.findByPk(text.toUpperCase());
            if (!order) return ctx.replyWithPhoto(IMAGES.notFound, { caption: `❌ Заказ ${text} не найден` });
            const { image, progress, desc } = getOrderStatusInfo(order.status);
            ctx.replyWithPhoto(image, {
                caption: `📦 Заказ #${order.id}\n👤 ${order.clientName}\n🛠 ${order.productName || 'Проект'}\n📍 ${order.status}\n📝 ${desc}\n\n${progress}`
            });
        } catch (e) { ctx.reply('⚠️ Ошибка поиска.'); }
    }
});

// --- Клиентские кнопки ---
bot.hears('📒 Каталог проектов', (ctx) => {
    ctx.reply('🔥 Наш каталог:', Markup.inlineKeyboard([
        [Markup.button.url('🌐 Перейти на сайт', 'http://localhost:5173')]
    ]));
});

bot.hears('🔍 Проверить статус заказа', (ctx) => {
    ctx.reply('🔢 Введите номер заказа (например: RC-2505-1234)');
});

// ==========================================
// ЗАПУСК
// ==========================================
const launchBot = async () => {
    try {
        console.log('🤖 Инициализация бота...');
        console.log('🔑 Используется токен:', BOT_TOKEN);
        console.log('📡 Проверяем связь с Telegram...');

        const timeout = 5000;
        const me = await Promise.race([
            bot.telegram.getMe(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
        ]);
        console.log('✅ Бот найден в Telegram:', me.username);

        const deleteResult = await Promise.race([
            bot.telegram.deleteWebhook({ drop_pending_updates: true }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
        ]);
        console.log('✅ Вебхук сброшен:', deleteResult);

        await bot.launch();
        console.log('✅ 🤖 БОТ ЗАПУЩЕН И ГОТОВ К РАБОТЕ!');
    } catch (err) {
        console.error('❌ Ошибка в launchBot:', err);
    }
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const notifyAdminAboutReview = () => {};
module.exports = { launchBot, notifyAdminAboutReview };