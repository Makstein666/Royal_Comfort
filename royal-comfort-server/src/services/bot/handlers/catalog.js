const { Markup } = require('telegraf');
const { Category, ConfigGroup, ConfigOption } = require('../../../models');
const { isAdmin } = require('../utils/constants');
const { mainMenuAdmin } = require('../keyboards');

const pendingActions = new Map();

const setupCatalogHandlers = (bot) => {
    bot.hears(/Каталог/i, async (ctx) => {
        if (!isAdmin(ctx)) return;
        await showCatalogMenu(ctx);
    });

    bot.action('catalog_menu', (ctx) => showCatalogMenu(ctx, true));
    bot.action('admin_home', (ctx) => {
        ctx.answerCbQuery();
        ctx.reply('👨‍💼 Главное меню', mainMenuAdmin);
    });

    // ЗАПУСК СЦЕНЫ ДОБАВЛЕНИЯ ТОВАРА
    bot.action('add_product_start', (ctx) => {
        ctx.answerCbQuery();
        ctx.scene.enter('ADD_PRODUCT_SCENE');
    });

    // ЗАПУСК СЦЕНЫ НАСТРОЙКИ ПОДАРКА
    bot.action('add_promo_start', (ctx) => {
        ctx.answerCbQuery();
        ctx.scene.enter('ADD_PROMO_SCENE');
    });

    bot.action(/cat_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        if (catId === 'opts') return; // ignore cat_opts match
        await showCategoryMenu(ctx, catId);
    });

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

    bot.action(/edit_price_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        pendingActions.set(ctx.from.id, { action: 'set_price', catId });
        ctx.answerCbQuery();
        await ctx.reply(`💰 Введите новую базовую цену для категории (только цифры):\nПример: 95000`, Markup.forceReply());
    });

    bot.action(/edit_discount_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        pendingActions.set(ctx.from.id, { action: 'set_discount', catId });
        ctx.answerCbQuery();
        await ctx.reply(`🏷 Введите скидку в % (0 = убрать скидку):\nПример: 15`, Markup.forceReply());
    });

    bot.action(/cat_opts_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        const groups = await ConfigGroup.findAll({
            where: { categoryId: catId },
            order: [['sortOrder', 'ASC']],
            include: [{ model: ConfigOption, as: 'options', order: [['sortOrder', 'ASC']] }]
        });

        if (groups.length === 0) {
            return ctx.editMessageText(
                `🔧 У категории пока нет опций конфигуратора.`,
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
        
        // ДОБАВЛЯЕМ КНОПКУ ДОБАВЛЕНИЯ ОПЦИИ
        buttons.push([Markup.button.callback('➕ Добавить опцию', `add_opt_${group.id}`)]);
        buttons.push([Markup.button.callback('🔙 Назад', `cat_opts_${group.categoryId}`)]);

        await ctx.editMessageText(`📋 ${group.title}`, Markup.inlineKeyboard(buttons));
    });

    bot.action(/add_opt_(.+)/, (ctx) => {
        ctx.answerCbQuery();
        ctx.scene.enter('ADD_OPTION_SCENE', { groupId: ctx.match[1] });
    });

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

    bot.action(/edit_opt_price_(.+)/, async (ctx) => {
        const optId = ctx.match[1];
        pendingActions.set(ctx.from.id, { action: 'set_opt_price', optId });
        ctx.answerCbQuery();
        await ctx.reply(`✏️ Введите новую надбавку к цене (0 = входит в базу):\nПример: 35000`, Markup.forceReply());
    });
};

async function showCatalogMenu(ctx, isEdit = false) {
    const categories = await Category.findAll({ order: [['sortOrder', 'ASC']] });
    const buttons = categories.map(cat => {
        const icon = cat.isActive ? '🟢' : '🔴';
        const discount = cat.discountPercent > 0 ? ` 🏷-${cat.discountPercent}%` : '';
        return [Markup.button.callback(`${icon} ${cat.name}${discount}`, `cat_${cat.id}`)];
    });
    
    // ДОБАВЛЕНА КНОПКА СОЗДАНИЯ ТОВАРА
    buttons.push([Markup.button.callback('➕ Добавить новый товар', 'add_product_start')]);
    // ДОБАВЛЕНА КНОПКА НАСТРОЙКИ ПОДАРКА
    buttons.push([Markup.button.callback('🎁 Настроить подарок (Акция)', 'add_promo_start')]);
    buttons.push([Markup.button.callback('🔙 Главное меню', 'admin_home')]);

    const text = '🛍 УПРАВЛЕНИЕ КАТАЛОГОМ\n🟢 = активна на сайте  🔴 = скрыта (предзаказ)';
    if (isEdit) {
        try { await ctx.editMessageText(text, Markup.inlineKeyboard(buttons)); } catch (e) {}
    } else {
        await ctx.reply(text, Markup.inlineKeyboard(buttons));
    }
}

async function showCategoryMenu(ctx, catId) {
    const cat = await Category.findByPk(catId);
    if (!cat) return ctx.answerCbQuery('Не найдено');

    const statusText = cat.isActive ? '✅ Активна' : '🔴 Предзаказ (Скрыта)';
    const discountText = cat.discountPercent > 0 ? `🏷 ${cat.discountPercent}%` : 'нет';
    const toggleLabel = cat.isActive ? '🔴 Перевести в Предзаказ' : '🟢 Активировать на сайте';

    const text = `📦 ${cat.name}\n💰 Базовая цена: ${(cat.basePrice || 0).toLocaleString()} ₽\n🏷 Скидка: ${discountText}\n📊 Статус: ${statusText}`;

    await ctx.editMessageText(text, Markup.inlineKeyboard([
        [Markup.button.callback('✏️ Изменить базовую цену', `edit_price_${catId}`)],
        [Markup.button.callback('🏷 Установить скидку', `edit_discount_${catId}`)],
        [Markup.button.callback('🔧 Опции конфигуратора', `cat_opts_${catId}`)],
        [Markup.button.callback(toggleLabel, `toggle_cat_${catId}`)],
        [Markup.button.callback('🔙 К каталогу', 'catalog_menu')]
    ]));
}

module.exports = { setupCatalogHandlers, pendingActions };
