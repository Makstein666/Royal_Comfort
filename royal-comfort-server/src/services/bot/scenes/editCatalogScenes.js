const { Scenes, Markup } = require('telegraf');
const { mainMenuAdmin } = require('../keyboards');
const { Category, ConfigOption } = require('../../../models');

// 1. Сцена изменения базовой цены категории
const editCategoryPriceScene = new Scenes.WizardScene(
    'EDIT_CATEGORY_PRICE_SCENE',
    // Шаг 1: Запрос новой цены
    async (ctx) => {
        const catId = ctx.scene.state.catId;
        const category = await Category.findByPk(catId);
        if (!category) {
            await ctx.reply('⚠️ Категория не найдена.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.catId = catId;
        ctx.wizard.state.catName = category.name;
        
        await ctx.reply(
            `💰 Изменение базовой цены категории "${category.name}"\n` +
            `Текущая цена: ${(category.basePrice || 0).toLocaleString()} ₽\n\n` +
            `Введите новую базовую цену (только цифры, например: 95000):`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    // Шаг 2: Валидация и подтверждение
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const text = ctx.message.text.trim();

        if (text === '❌ Отмена') {
            await ctx.reply('Изменение цены отменено.', mainMenuAdmin);
            return ctx.scene.leave();
        }

        const price = parseInt(text.replace(/\s+/g, ''));
        if (isNaN(price) || price < 0) {
            await ctx.reply('⚠️ Пожалуйста, введите корректное число (больше или равно 0):');
            return;
        }

        ctx.wizard.state.newPrice = price;

        await ctx.reply(
            `❓ Установить базовую цену ${price.toLocaleString()} ₽ для категории "${ctx.wizard.state.catName}"?`,
            Markup.inlineKeyboard([
                [Markup.button.callback('✅ Да, изменить', 'confirm_price_edit')],
                [Markup.button.callback('❌ Отмена', 'cancel_price_edit')]
            ])
        );
        return ctx.wizard.next();
    },
    // Шаг 3: Сохранение
    async (ctx) => {
        if (ctx.callbackQuery) {
            const data = ctx.callbackQuery.data;
            await ctx.answerCbQuery();

            if (data === 'confirm_price_edit') {
                const { catId, newPrice } = ctx.wizard.state;
                await Category.update({ basePrice: newPrice }, { where: { id: catId } });
                await ctx.reply(`✅ Базовая цена успешно изменена на ${newPrice.toLocaleString()} ₽!`, mainMenuAdmin);
            } else {
                await ctx.reply('❌ Изменение цены отменено.', mainMenuAdmin);
            }
            return ctx.scene.leave();
        }
    }
);

// 2. Сцена изменения скидки категории
const editCategoryDiscountScene = new Scenes.WizardScene(
    'EDIT_CATEGORY_DISCOUNT_SCENE',
    // Шаг 1: Запрос новой скидки
    async (ctx) => {
        const catId = ctx.scene.state.catId;
        const category = await Category.findByPk(catId);
        if (!category) {
            await ctx.reply('⚠️ Категория не найдена.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.catId = catId;
        ctx.wizard.state.catName = category.name;

        await ctx.reply(
            `🏷 Изменение скидки категории "${category.name}"\n` +
            `Текущая скидка: ${category.discountPercent || 0}%\n\n` +
            `Введите новую скидку от 0 до 100% (0 = без скидки):`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    // Шаг 2: Валидация и подтверждение
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const text = ctx.message.text.trim();

        if (text === '❌ Отмена') {
            await ctx.reply('Изменение скидки отменено.', mainMenuAdmin);
            return ctx.scene.leave();
        }

        const discount = parseInt(text.replace(/\s+/g, ''));
        if (isNaN(discount) || discount < 0 || discount > 100) {
            await ctx.reply('⚠️ Пожалуйста, введите число от 0 до 100:');
            return;
        }

        ctx.wizard.state.newDiscount = discount;

        await ctx.reply(
            `❓ Установить скидку ${discount}% для категории "${ctx.wizard.state.catName}"?`,
            Markup.inlineKeyboard([
                [Markup.button.callback('✅ Да, изменить', 'confirm_discount_edit')],
                [Markup.button.callback('❌ Отмена', 'cancel_discount_edit')]
            ])
        );
        return ctx.wizard.next();
    },
    // Шаг 3: Сохранение
    async (ctx) => {
        if (ctx.callbackQuery) {
            const data = ctx.callbackQuery.data;
            await ctx.answerCbQuery();

            if (data === 'confirm_discount_edit') {
                const { catId, newDiscount } = ctx.wizard.state;
                await Category.update({ discountPercent: newDiscount }, { where: { id: catId } });
                await ctx.reply(`✅ Скидка успешно изменена на ${newDiscount}%!`, mainMenuAdmin);
            } else {
                await ctx.reply('❌ Изменение скидки отменено.', mainMenuAdmin);
            }
            return ctx.scene.leave();
        }
    }
);

// 3. Сцена изменения надбавки опции
const editOptionPriceScene = new Scenes.WizardScene(
    'EDIT_OPTION_PRICE_SCENE',
    // Шаг 1: Запрос новой цены опции
    async (ctx) => {
        const optId = ctx.scene.state.optId;
        const option = await ConfigOption.findByPk(optId);
        if (!option) {
            await ctx.reply('⚠️ Опция не найдена.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.optId = optId;
        ctx.wizard.state.optName = option.name;

        await ctx.reply(
            `⚙️ Изменение цены надбавки опции "${option.name}"\n` +
            `Текущая надбавка: ${option.price.toLocaleString()} ₽\n\n` +
            `Введите новую надбавку (0 = входит в базовую цену):`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    // Шаг 2: Валидация и подтверждение
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const text = ctx.message.text.trim();

        if (text === '❌ Отмена') {
            await ctx.reply('Изменение цены опции отменено.', mainMenuAdmin);
            return ctx.scene.leave();
        }

        const price = parseInt(text.replace(/\s+/g, ''));
        if (isNaN(price) || price < 0) {
            await ctx.reply('⚠️ Пожалуйста, введите корректное число (больше или равно 0):');
            return;
        }

        ctx.wizard.state.newPrice = price;

        await ctx.reply(
            `❓ Установить цену надбавки ${price.toLocaleString()} ₽ для опции "${ctx.wizard.state.optName}"?`,
            Markup.inlineKeyboard([
                [Markup.button.callback('✅ Да, изменить', 'confirm_opt_price_edit')],
                [Markup.button.callback('❌ Отмена', 'cancel_opt_price_edit')]
            ])
        );
        return ctx.wizard.next();
    },
    // Шаг 3: Сохранение
    async (ctx) => {
        if (ctx.callbackQuery) {
            const data = ctx.callbackQuery.data;
            await ctx.answerCbQuery();

            if (data === 'confirm_opt_price_edit') {
                const { optId, newPrice } = ctx.wizard.state;
                await ConfigOption.update({ price: newPrice }, { where: { id: optId } });
                await ctx.reply(`✅ Цена надбавки успешно изменена на ${newPrice.toLocaleString()} ₽!`, mainMenuAdmin);
            } else {
                await ctx.reply('❌ Изменение цены опции отменено.', mainMenuAdmin);
            }
            return ctx.scene.leave();
        }
    }
);

// Глобальные обработчики отмены для текстовых команд в сценах
const setupCancelHears = (scene) => {
    scene.hears('❌ Отмена', async (ctx) => {
        await ctx.reply('Действие отменено.', mainMenuAdmin);
        return ctx.scene.leave();
    });
};

setupCancelHears(editCategoryPriceScene);
setupCancelHears(editCategoryDiscountScene);
setupCancelHears(editOptionPriceScene);

module.exports = {
    editCategoryPriceScene,
    editCategoryDiscountScene,
    editOptionPriceScene
};
