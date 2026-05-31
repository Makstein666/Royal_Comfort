const { Markup } = require('telegraf');
const { Category, ConfigGroup, ConfigOption, Product } = require('../../../models');
const { isAdmin } = require('../utils/constants');
const { mainMenuAdmin } = require('../keyboards');

const setupCatalogHandlers = (bot) => {
    bot.hears(/^(🛍\s*)?Каталог$/i, async (ctx) => {
        if (!isAdmin(ctx)) return;
        await showCatalogMenu(ctx);
    });

    bot.action('catalog_menu', (ctx) => showCatalogMenu(ctx, true));
    bot.action('admin_home', (ctx) => {
        ctx.answerCbQuery();
        ctx.reply('👨‍💼 Главное меню', mainMenuAdmin);
    });

    // --- ДОБАВЛЕНИЕ НОВОГО КОНТЕНТА ---
    bot.action('add_product_start', (ctx) => {
        ctx.answerCbQuery();
        ctx.scene.enter('ADD_PRODUCT_SCENE');
    });

    bot.action('add_promo_start', (ctx) => {
        ctx.answerCbQuery();
        ctx.scene.enter('ADD_PROMO_SCENE');
    });

    // --- КАТЕГОРИИ ---
    // ВАЖНО: Используем точный regex чтобы не перехватывать cat_opts_ и cat_prods_
    bot.action(/^cat_(?!opts_|prods_)(.+)$/, async (ctx) => {
        const catId = ctx.match[1];
        await showCategoryMenu(ctx, catId);
    });

    bot.action(/rename_cat_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_CATEGORY_NAME_SCENE', { catId });
    });

    bot.action(/cover_cat_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_CATEGORY_IMAGE_SCENE', { catId });
    });

    bot.action(/toggle_cat_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        const cat = await Category.findByPk(catId);
        if (!cat) return ctx.answerCbQuery('Не найдено');
        if (catId === 'custom') return ctx.answerCbQuery('⚠️ Этот блок всегда активен');

        await cat.update({ isActive: !cat.isActive });
        const status = cat.isActive ? 'активирована' : 'скрыта';
        ctx.answerCbQuery(`✅ Категория ${status}`);
        await showCategoryMenu(ctx, catId);
    });

    bot.action(/edit_price_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_CATEGORY_PRICE_SCENE', { catId });
    });

    bot.action(/edit_discount_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_CATEGORY_DISCOUNT_SCENE', { catId });
    });

    // --- ГРУППЫ ОПЦИЙ (ConfigGroup) ---
    bot.action(/cat_opts_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        const groups = await ConfigGroup.findAll({
            where: { categoryId: catId },
            order: [['sortOrder', 'ASC']],
            include: [{ model: ConfigOption, as: 'options', order: [['sortOrder', 'ASC']] }]
        });

        const buttons = [];
        for (const group of groups) {
            buttons.push([Markup.button.callback(`📋 ${group.title}`, `group_${group.id}`)]);
        }
        
        buttons.push([Markup.button.callback('➕ Создать новую группу', `add_group_${catId}`)]);
        buttons.push([Markup.button.callback('🔙 Назад', `cat_${catId}`)]);

        await ctx.editMessageText(`🔧 ГРУППЫ ОПЦИЙ КАТЕГОРИИ`, Markup.inlineKeyboard(buttons));
    });

    bot.action(/add_group_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('ADD_GROUP_SCENE', { catId });
    });

    bot.action(/group_(.+)/, async (ctx) => {
        const groupId = ctx.match[1];
        if (groupId.startsWith('delete_') || groupId.startsWith('rename_')) return;
        
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
        
        buttons.push([
            Markup.button.callback('✏️ Переименовать группу', `rename_group_${group.id}`),
            Markup.button.callback('🗑 Удалить группу', `confirm_delete_group_${group.id}`)
        ]);
        buttons.push([Markup.button.callback('➕ Добавить опцию', `add_opt_${group.id}`)]);
        buttons.push([Markup.button.callback('🔙 Назад', `cat_opts_${group.categoryId}`)]);

        await ctx.editMessageText(`📋 Управление группой: ${group.title}`, Markup.inlineKeyboard(buttons));
    });

    bot.action(/rename_group_(.+)/, async (ctx) => {
        const groupId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_GROUP_NAME_SCENE', { groupId });
    });

    bot.action(/confirm_delete_group_(.+)/, async (ctx) => {
        const groupId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.editMessageText('⚠️ Вы уверены, что хотите УДАЛИТЬ эту группу опций и ВСЕ её опции? Это действие нельзя отменить!', Markup.inlineKeyboard([
            [Markup.button.callback('🗑 ДА, УДАЛИТЬ ВСЁ', `delete_group_${groupId}`)],
            [Markup.button.callback('🔙 ОТМЕНА', `group_${groupId}`)]
        ]));
    });

    bot.action(/delete_group_(.+)/, async (ctx) => {
        const groupId = ctx.match[1];
        const group = await ConfigGroup.findByPk(groupId);
        if (group) {
            const catId = group.categoryId;
            // Каскадное удаление опций
            await ConfigOption.destroy({ where: { groupId } });
            await group.destroy();
            ctx.answerCbQuery('🗑 Группа опций удалена');
            await ctx.editMessageText('✅ Группа опций и все её опции были успешно удалены.', Markup.inlineKeyboard([
                [Markup.button.callback('🔙 К группам опций', `cat_opts_${catId}`)]
            ]));
        } else {
            ctx.answerCbQuery('Не найдено');
        }
    });

    // --- ОПЦИИ (ConfigOption) ---
    bot.action(/add_opt_(.+)/, (ctx) => {
        ctx.answerCbQuery();
        ctx.scene.enter('ADD_OPTION_SCENE', { groupId: ctx.match[1] });
    });

    bot.action(/opt_(.+)/, async (ctx) => {
        const optId = ctx.match[1];
        if (optId.startsWith('delete_') || optId.startsWith('rename_')) return;
        
        const opt = await ConfigOption.findByPk(optId);
        if (!opt) return ctx.answerCbQuery('Не найдено');

        const priceText = opt.price === 0 ? 'В базе (0 ₽)' : `+${opt.price.toLocaleString()} ₽`;
        await ctx.editMessageText(
            `⚙️ Опция: ${opt.name}\n💰 Надбавка: ${priceText}`,
            Markup.inlineKeyboard([
                [Markup.button.callback('✏️ Изменить название', `rename_opt_${optId}`)],
                [Markup.button.callback('✏️ Изменить цену надбавки', `edit_opt_price_${optId}`)],
                [Markup.button.callback('🗑 Удалить опцию навсегда', `confirm_delete_opt_${optId}`)],
                [Markup.button.callback('🔙 Назад', `group_${opt.groupId}`)]
            ])
        );
    });

    bot.action(/rename_opt_(.+)/, async (ctx) => {
        const optId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_OPTION_NAME_SCENE', { optId });
    });

    bot.action(/edit_opt_price_(.+)/, async (ctx) => {
        const optId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_OPTION_PRICE_SCENE', { optId });
    });

    bot.action(/confirm_delete_opt_(.+)/, async (ctx) => {
        const optId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.editMessageText('❓ Вы уверены, что хотите удалить эту опцию?', Markup.inlineKeyboard([
            [Markup.button.callback('🗑 ДА, УДАЛИТЬ', `delete_opt_${optId}`)],
            [Markup.button.callback('🔙 ОТМЕНА', `opt_${optId}`)]
        ]));
    });

    bot.action(/delete_opt_(.+)/, async (ctx) => {
        const optId = ctx.match[1];
        const opt = await ConfigOption.findByPk(optId);
        if (opt) {
            const groupId = opt.groupId;
            await opt.destroy();
            ctx.answerCbQuery('🗑 Опция удалена');
            
            const group = await ConfigGroup.findByPk(groupId, {
                include: [{ model: ConfigOption, as: 'options', order: [['sortOrder', 'ASC']] }]
            });
            const buttons = group.options.map(o => [
                Markup.button.callback(
                    `${o.name} — ${o.price === 0 ? 'В базе' : '+' + o.price.toLocaleString() + ' ₽'}`,
                    `opt_${o.id}`
                )
            ]);
            buttons.push([
                Markup.button.callback('✏️ Переименовать группу', `rename_group_${group.id}`),
                Markup.button.callback('🗑 Удалить группу', `confirm_delete_group_${group.id}`)
            ]);
            buttons.push([Markup.button.callback('➕ Добавить опцию', `add_opt_${group.id}`)]);
            buttons.push([Markup.button.callback('🔙 Назад', `cat_opts_${group.categoryId}`)]);
            await ctx.editMessageText(`📋 ${group.title}`, Markup.inlineKeyboard(buttons));
        } else {
            ctx.answerCbQuery('Не найдено');
        }
    });

    // --- ТОВАРЫ ---
    bot.action(/cat_prods_(.+)_(.+)/, async (ctx) => {
        const catId = ctx.match[1];
        const page = parseInt(ctx.match[2]) || 0;
        ctx.answerCbQuery();
        await showProductListWithPagination(ctx, catId, page);
    });

    bot.action(/cat_prods_(.+)/, async (ctx) => {
        const parts = ctx.match[1].split('_');
        if (parts.length > 1) return;
        const catId = ctx.match[1];
        ctx.answerCbQuery();
        await showProductListWithPagination(ctx, catId, 0);
    });

    bot.action(/manage_prod_(.+)/, async (ctx) => {
        const prodId = ctx.match[1];
        if (prodId.startsWith('delete_') || prodId.startsWith('toggle_') || prodId.startsWith('rename_') || prodId.startsWith('edit_')) return;
        
        const product = await Product.findByPk(prodId);
        if (!product) return ctx.answerCbQuery('Не найден');

        const statusText = product.isActive ? '✅ Активен' : '🔴 Скрыт';
        const text = `📦 ${product.name}\n💰 Цена: ${product.price.toLocaleString()} ₽\n📊 Статус: ${statusText}`;
        const toggleLabel = product.isActive ? '🔴 Скрыть' : '🟢 Показать';

        try {
            await ctx.editMessageText(getProductInfoText(product), Markup.inlineKeyboard(getProductButtons(product)));
        } catch (e) { /* ignore message is not modified */ }
    });

    bot.action(/rename_prod_(.+)/, async (ctx) => {
        const prodId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_PRODUCT_NAME_SCENE', { prodId });
    });

    bot.action(/edit_prod_price_(.+)/, async (ctx) => {
        const prodId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_PRODUCT_PRICE_SCENE', { prodId });
    });

    bot.action(/edit_prod_desc_(.+)/, async (ctx) => {
        const prodId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_PRODUCT_DESC_SCENE', { prodId });
    });

    bot.action(/edit_prod_img_(.+)/, async (ctx) => {
        const prodId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_PRODUCT_IMAGE_SCENE', { prodId });
    });

    bot.action(/edit_prod_specs_(.+)/, async (ctx) => {
        const prodId = ctx.match[1];
        ctx.answerCbQuery();
        await ctx.scene.enter('EDIT_PRODUCT_SPECS_SCENE', { prodId });
    });

    bot.action(/toggle_prod_(.+)/, async (ctx) => {
        const product = await Product.findByPk(ctx.match[1]);
        if (!product) return ctx.answerCbQuery('Не найден');
        await product.update({ isActive: !product.isActive });
        // Перечитываем из БД чтобы получить актуальный статус
        const updated = await Product.findByPk(ctx.match[1]);
        ctx.answerCbQuery(`✅ Товар ${updated.isActive ? 'показан' : 'скрыт'}`);
        try {
            await ctx.editMessageText(
                getProductInfoText(updated),
                Markup.inlineKeyboard(getProductButtons(updated))
            );
        } catch (e) { /* ignore */ }
    });

    bot.action(/confirm_delete_prod_(.+)/, (ctx) => {
        ctx.editMessageText('❓ Вы уверены, что хотите УДАЛИТЬ товар навсегда?', Markup.inlineKeyboard([
            [Markup.button.callback('🗑 ДА, УДАЛИТЬ', `delete_prod_${ctx.match[1]}`)],
            [Markup.button.callback('🔙 ОТМЕНА', `manage_prod_${ctx.match[1]}`)]
        ]));
    });

    bot.action(/delete_prod_(.+)/, async (ctx) => {
        const product = await Product.findByPk(ctx.match[1]);
        if (product) {
            const catId = product.categoryId;
            await product.destroy();
            ctx.answerCbQuery('🗑 Удалено');
            await showProductListWithPagination(ctx, catId, 0);
        }
    });
};

async function showCatalogMenu(ctx, isEdit = false) {
    const categories = await Category.findAll({ order: [['sortOrder', 'ASC']] });
    const buttons = categories.map(cat => {
        const icon = cat.isActive ? '🟢' : '🔴';
        const discount = cat.discountPercent > 0 ? ` 🏷-${cat.discountPercent}%` : '';
        return [Markup.button.callback(`${icon} ${cat.name}${discount}`, `cat_${cat.id}`)];
    });
    
    buttons.push([Markup.button.callback('➕ Добавить новый товар', 'add_product_start')]);
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

    const text = `📦 Категория: ${cat.name}\n💰 Базовая цена: ${(cat.basePrice || 0).toLocaleString()} ₽\n🏷 Скидка: ${discountText}\n📊 Статус: ${statusText}`;

    await ctx.editMessageText(text, Markup.inlineKeyboard([
        [Markup.button.callback('✏️ Переименовать категорию', `rename_cat_${catId}`)],
        [Markup.button.callback('🖼 Изменить обложку', `cover_cat_${catId}`)],
        [Markup.button.callback('✏️ Изменить базовую цену', `edit_price_${catId}`)],
        [Markup.button.callback('🏷 Установить скидку', `edit_discount_${catId}`)],
        [Markup.button.callback('🔧 Опции конфигуратора', `cat_opts_${catId}`)],
        [Markup.button.callback('📦 Список товаров', `cat_prods_${catId}`)],
        [Markup.button.callback(toggleLabel, `toggle_cat_${catId}`)],
        [Markup.button.callback('🔙 К каталогу', 'catalog_menu')]
    ]));
}

async function showProductListWithPagination(ctx, catId, page = 0) {
    const limit = 5;
    const offset = page * limit;

    try {
        const { count, rows: products } = await Product.findAndCountAll({
            where: { categoryId: catId },
            limit,
            offset,
            order: [['createdAt', 'ASC']]
        });

        if (count === 0) {
            return ctx.editMessageText('📭 В этой категории пока нет товаров.', Markup.inlineKeyboard([
                [Markup.button.callback('➕ Добавить товар', 'add_product_start')],
                [Markup.button.callback('🔙 Назад', `cat_${catId}`)]
            ]));
        }

        const buttons = products.map(p => {
            const icon = p.isActive ? '🟢' : '🔴';
            return [Markup.button.callback(`${icon} ${p.name}`, `manage_prod_${p.id}`)];
        });

        const navButtons = [];
        if (page > 0) {
            navButtons.push(Markup.button.callback('⬅️ Предыдущие', `cat_prods_${catId}_${page - 1}`));
        }
        if (offset + limit < count) {
            navButtons.push(Markup.button.callback('Следующие ➡️', `cat_prods_${catId}_${page + 1}`));
        }
        if (navButtons.length > 0) {
            buttons.push(navButtons);
        }

        buttons.push([Markup.button.callback('🔙 Назад к категории', `cat_${catId}`)]);

        const totalPages = Math.ceil(count / limit);
        const text = `📦 ТОВАРЫ КАТЕГОРИИ (Страница ${page + 1} из ${totalPages})`;

        try {
            await ctx.editMessageText(text, Markup.inlineKeyboard(buttons));
        } catch (e) {}
    } catch (err) {
        console.error('Ошибка в showProductListWithPagination:', err);
        ctx.reply('⚠️ Ошибка при загрузке списка товаров.');
    }
}

// --- DRY: Вспомогательные функции для товара ---
function getProductInfoText(product) {
    const statusText = product.isActive ? '✅ Активен' : '🔴 Скрыт';
    return `📦 ${product.name}\n💰 Цена: ${product.price.toLocaleString()} ₽\n📊 Статус: ${statusText}`;
}

function getProductButtons(product) {
    const toggleLabel = product.isActive ? '🔴 Скрыть' : '🟢 Показать';
    return [
        [Markup.button.callback('✏️ Изменить название', `rename_prod_${product.id}`)],
        [Markup.button.callback('💰 Изменить цену', `edit_prod_price_${product.id}`)],
        [Markup.button.callback('📝 Изменить описание', `edit_prod_desc_${product.id}`)],
        [Markup.button.callback('⚙️ Изменить характеристики', `edit_prod_specs_${product.id}`)],
        [Markup.button.callback('🖼 Заменить фото', `edit_prod_img_${product.id}`)],
        [Markup.button.callback(toggleLabel, `toggle_prod_${product.id}`)],
        [Markup.button.callback('🗑 Удалить навсегда', `confirm_delete_prod_${product.id}`)],
        [Markup.button.callback('🔙 Назад', `cat_prods_${product.categoryId}`)]
    ];
}

module.exports = { setupCatalogHandlers };
