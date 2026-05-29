const { Scenes, Markup } = require('telegraf');
const { Product, Category, ConfigGroup, ConfigOption } = require('../../../models');

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const setupCancelHears = (scene, message = 'Действие отменено.') => {
    scene.hears('❌ Отмена', async (ctx) => {
        await ctx.reply(message, require('../keyboards').mainMenuAdmin);
        return ctx.scene.leave();
    });
};

// ==========================================
// 1. EDIT_PRODUCT_NAME_SCENE
// ==========================================
const editProductNameScene = new Scenes.WizardScene(
    'EDIT_PRODUCT_NAME_SCENE',
    async (ctx) => {
        const prodId = ctx.scene.state.prodId;
        const product = await Product.findByPk(prodId);
        if (!product) {
            await ctx.reply('⚠️ Товар не найден.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.prodId = prodId;
        ctx.wizard.state.oldName = product.name;
        
        await ctx.reply(
            `✏️ Изменение названия товара "${product.name}"\n\n` +
            `Введите новое название товара:`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const newName = ctx.message.text.trim();
        if (newName === '❌ Отмена') {
            await ctx.reply('Изменение названия отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        try {
            const { prodId } = ctx.wizard.state;
            await Product.update({ name: newName }, { where: { id: prodId } });
            await ctx.reply(`✅ Название успешно изменено на "${newName}"!`, require('../keyboards').mainMenuAdmin);
        } catch (err) {
            console.error(err);
            await ctx.reply('❌ Ошибка при изменении названия.', require('../keyboards').mainMenuAdmin);
        }
        return ctx.scene.leave();
    }
);
setupCancelHears(editProductNameScene);

// ==========================================
// 2. EDIT_PRODUCT_PRICE_SCENE
// ==========================================
const editProductPriceScene = new Scenes.WizardScene(
    'EDIT_PRODUCT_PRICE_SCENE',
    async (ctx) => {
        const prodId = ctx.scene.state.prodId;
        const product = await Product.findByPk(prodId);
        if (!product) {
            await ctx.reply('⚠️ Товар не найден.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.prodId = prodId;
        ctx.wizard.state.prodName = product.name;

        await ctx.reply(
            `💰 Изменение цены товара "${product.name}"\n` +
            `Текущая цена: ${product.price.toLocaleString()} ₽\n\n` +
            `Введите новую цену (только цифры):`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const text = ctx.message.text.trim();
        if (text === '❌ Отмена') {
            await ctx.reply('Изменение цены отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        const price = parseInt(text.replace(/\s+/g, ''));
        if (isNaN(price) || price < 0) {
            await ctx.reply('⚠️ Пожалуйста, введите корректное число:');
            return;
        }

        ctx.wizard.state.newPrice = price;

        await ctx.reply(
            `❓ Установить цену ${price.toLocaleString()} ₽ для товара "${ctx.wizard.state.prodName}"?`,
            Markup.inlineKeyboard([
                [Markup.button.callback('✅ Да, изменить', 'confirm_price')],
                [Markup.button.callback('❌ Отмена', 'cancel_price')]
            ])
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.callbackQuery) {
            const data = ctx.callbackQuery.data;
            await ctx.answerCbQuery();

            if (data === 'confirm_price') {
                const { prodId, newPrice } = ctx.wizard.state;
                await Product.update({ price: newPrice }, { where: { id: prodId } });
                await ctx.reply(`✅ Цена товара успешно обновлена на ${newPrice.toLocaleString()} ₽!`, require('../keyboards').mainMenuAdmin);
            } else {
                await ctx.reply('❌ Отменено.', require('../keyboards').mainMenuAdmin);
            }
            return ctx.scene.leave();
        }
    }
);
setupCancelHears(editProductPriceScene);

// ==========================================
// 3. EDIT_PRODUCT_DESC_SCENE
// ==========================================
const editProductDescScene = new Scenes.WizardScene(
    'EDIT_PRODUCT_DESC_SCENE',
    async (ctx) => {
        const prodId = ctx.scene.state.prodId;
        const product = await Product.findByPk(prodId);
        if (!product) {
            await ctx.reply('⚠️ Товар не найден.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.prodId = prodId;

        await ctx.reply(
            `📝 Изменение описания товара "${product.name}"\n` +
            `Текущее описание:\n_${product.description || 'отсутствует'}_\n\n` +
            `Введите новое описание товара:`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const desc = ctx.message.text.trim();
        if (desc === '❌ Отмена') {
            await ctx.reply('Изменение описания отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        try {
            const { prodId } = ctx.wizard.state;
            await Product.update({ description: desc }, { where: { id: prodId } });
            await ctx.reply('✅ Описание товара успешно обновлено!', require('../keyboards').mainMenuAdmin);
        } catch (err) {
            console.error(err);
            await ctx.reply('❌ Ошибка обновления описания.', require('../keyboards').mainMenuAdmin);
        }
        return ctx.scene.leave();
    }
);
setupCancelHears(editProductDescScene);

// ==========================================
// 4. EDIT_PRODUCT_IMAGE_SCENE
// ==========================================
const editProductImageScene = new Scenes.WizardScene(
    'EDIT_PRODUCT_IMAGE_SCENE',
    async (ctx) => {
        const prodId = ctx.scene.state.prodId;
        const product = await Product.findByPk(prodId);
        if (!product) {
            await ctx.reply('⚠️ Товар не найден.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.prodId = prodId;

        await ctx.reply(
            `🖼 Замена изображения товара "${product.name}"\n\n` +
            `📸 Пожалуйста, отправьте новую фотографию товара:`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.message && ctx.message.text === '❌ Отмена') {
            await ctx.reply('Изменение изображения отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        if (ctx.message && ctx.message.photo) {
            const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
            try {
                const { downloadTelegramFile } = require('../../../utils/fileDownloader');
                await ctx.reply('⏳ Загрузка изображения...');
                const relativeUrl = await downloadTelegramFile(ctx.telegram, fileId, 'products');

                const { prodId } = ctx.wizard.state;
                await Product.update({ image: relativeUrl }, { where: { id: prodId } });
                await ctx.reply('✅ Изображение товара успешно обновлено!', require('../keyboards').mainMenuAdmin);
            } catch (err) {
                console.error(err);
                await ctx.reply('❌ Ошибка при загрузке или сохранении изображения.', require('../keyboards').mainMenuAdmin);
            }
            return ctx.scene.leave();
        } else {
            await ctx.reply('Пожалуйста, отправьте фотографию товара или нажмите "❌ Отмена":');
            return;
        }
    }
);
setupCancelHears(editProductImageScene);

// ==========================================
// 4.5. EDIT_PRODUCT_SPECS_SCENE
// ==========================================
const editProductSpecsScene = new Scenes.WizardScene(
    'EDIT_PRODUCT_SPECS_SCENE',
    async (ctx) => {
        const prodId = ctx.scene.state.prodId;
        const product = await Product.findByPk(prodId);
        if (!product) {
            await ctx.reply('⚠️ Товар не найден.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.prodId = prodId;

        let currentSpecsStr = 'отсутствуют';
        if (product.specs) {
            try {
                const specsArr = JSON.parse(product.specs);
                if (specsArr.length > 0) {
                    currentSpecsStr = specsArr.map(s => `${s.label}: ${s.value}`).join('\n');
                }
            } catch (e) {}
        }

        await ctx.reply(
            `📋 Изменение характеристик товара "${product.name}"\n\n` +
            `Текущие характеристики:\n${currentSpecsStr}\n\n` +
            `Введите новые характеристики.\nКаждая характеристика с новой строки в формате:\n` +
            `Название: Значение\n\n` +
            `Пример:\n` +
            `Вместимость: 4-6 человек\n` +
            `Время нагрева: 2 часа\n\n` +
            `(Если хотите удалить все характеристики, отправьте слово "очистить")`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const text = ctx.message.text.trim();
        
        if (text === '❌ Отмена') {
            await ctx.reply('Изменение характеристик отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        let specsStr = null;
        if (text.toLowerCase() !== 'очистить') {
            let specs = [];
            const lines = text.split('\n');
            for (const line of lines) {
                if (line.includes(':')) {
                    const [label, ...valueParts] = line.split(':');
                    const value = valueParts.join(':');
                    if (label && value) {
                        specs.push({ label: label.trim(), value: value.trim() });
                    }
                }
            }
            if (specs.length > 0) {
                specsStr = JSON.stringify(specs);
            }
        }

        try {
            const { prodId } = ctx.wizard.state;
            await Product.update({ specs: specsStr }, { where: { id: prodId } });
            await ctx.reply('✅ Характеристики товара успешно обновлены!', require('../keyboards').mainMenuAdmin);
        } catch (err) {
            console.error(err);
            await ctx.reply('❌ Ошибка обновления характеристик.', require('../keyboards').mainMenuAdmin);
        }
        return ctx.scene.leave();
    }
);
setupCancelHears(editProductSpecsScene);

// ==========================================
// 5. EDIT_CATEGORY_NAME_SCENE
// ==========================================
const editCategoryNameScene = new Scenes.WizardScene(
    'EDIT_CATEGORY_NAME_SCENE',
    async (ctx) => {
        const catId = ctx.scene.state.catId;
        const category = await Category.findByPk(catId);
        if (!category) {
            await ctx.reply('⚠️ Категория не найдена.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.catId = catId;

        await ctx.reply(
            `✏️ Переименование категории "${category.name}"\n\n` +
            `Введите новое название категории:`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const newName = ctx.message.text.trim();
        if (newName === '❌ Отмена') {
            await ctx.reply('Переименование отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        try {
            const { catId } = ctx.wizard.state;
            await Category.update({ name: newName }, { where: { id: catId } });
            await ctx.reply(`✅ Категория успешно переименована в "${newName}"!`, require('../keyboards').mainMenuAdmin);
        } catch (err) {
            console.error(err);
            await ctx.reply('❌ Ошибка при переименовании категории.', require('../keyboards').mainMenuAdmin);
        }
        return ctx.scene.leave();
    }
);
setupCancelHears(editCategoryNameScene);

// ==========================================
// 6. EDIT_CATEGORY_IMAGE_SCENE
// ==========================================
const editCategoryImageScene = new Scenes.WizardScene(
    'EDIT_CATEGORY_IMAGE_SCENE',
    async (ctx) => {
        const catId = ctx.scene.state.catId;
        const category = await Category.findByPk(catId);
        if (!category) {
            await ctx.reply('⚠️ Категория не найдена.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.catId = catId;

        await ctx.reply(
            `🖼 Изменение обложки категории "${category.name}"\n\n` +
            `📸 Пожалуйста, отправьте новую фотографию обложки:`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.message && ctx.message.text === '❌ Отмена') {
            await ctx.reply('Изменение обложки отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        if (ctx.message && ctx.message.photo) {
            const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
            try {
                const { downloadTelegramFile } = require('../../../utils/fileDownloader');
                await ctx.reply('⏳ Загрузка изображения...');
                const relativeUrl = await downloadTelegramFile(ctx.telegram, fileId, 'categories');

                const { catId } = ctx.wizard.state;
                await Category.update({ image: relativeUrl }, { where: { id: catId } });
                await ctx.reply('✅ Обложка категории успешно обновлена!', require('../keyboards').mainMenuAdmin);
            } catch (err) {
                console.error(err);
                await ctx.reply('❌ Ошибка при загрузке изображения.', require('../keyboards').mainMenuAdmin);
            }
            return ctx.scene.leave();
        } else {
            await ctx.reply('Пожалуйста, отправьте фотографию обложки или нажмите "❌ Отмена":');
            return;
        }
    }
);
setupCancelHears(editCategoryImageScene);

// ==========================================
// 7. ADD_GROUP_SCENE
// ==========================================
const addGroupScene = new Scenes.WizardScene(
    'ADD_GROUP_SCENE',
    async (ctx) => {
        const catId = ctx.scene.state.catId;
        ctx.wizard.state.catId = catId;

        await ctx.reply(
            `➕ Создание новой группы опций конфигуратора\n\n` +
            `Введите название группы (например: "Материал отделки", "Цвет подсветки"):`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const title = ctx.message.text.trim();
        if (title === '❌ Отмена') {
            await ctx.reply('Создание группы отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        try {
            const { catId } = ctx.wizard.state;
            const count = await ConfigGroup.count({ where: { categoryId: catId } });
            
            // Простой ID на основе timestamp
            const groupId = `group_${Date.now()}`;
            
            const group = await ConfigGroup.create({
                id: groupId,
                categoryId: catId,
                title: title,
                sortOrder: count + 1
            });

            await ctx.reply(`✅ Группа опций "${group.title}" успешно создана!`, require('../keyboards').mainMenuAdmin);
        } catch (err) {
            console.error(err);
            await ctx.reply('❌ Ошибка создания группы опций.', require('../keyboards').mainMenuAdmin);
        }
        return ctx.scene.leave();
    }
);
setupCancelHears(addGroupScene);

// ==========================================
// 8. EDIT_GROUP_NAME_SCENE
// ==========================================
const editGroupNameScene = new Scenes.WizardScene(
    'EDIT_GROUP_NAME_SCENE',
    async (ctx) => {
        const groupId = ctx.scene.state.groupId;
        const group = await ConfigGroup.findByPk(groupId);
        if (!group) {
            await ctx.reply('⚠️ Группа не найдена.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.groupId = groupId;

        await ctx.reply(
            `✏️ Переименование группы опций "${group.title}"\n\n` +
            `Введите новое название группы:`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const newTitle = ctx.message.text.trim();
        if (newTitle === '❌ Отмена') {
            await ctx.reply('Переименование группы отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        try {
            const { groupId } = ctx.wizard.state;
            await ConfigGroup.update({ title: newTitle }, { where: { id: groupId } });
            await ctx.reply(`✅ Группа успешно переименована в "${newTitle}"!`, require('../keyboards').mainMenuAdmin);
        } catch (err) {
            console.error(err);
            await ctx.reply('❌ Ошибка переименования группы.', require('../keyboards').mainMenuAdmin);
        }
        return ctx.scene.leave();
    }
);
setupCancelHears(editGroupNameScene);

// ==========================================
// 9. EDIT_OPTION_NAME_SCENE
// ==========================================
const editOptionNameScene = new Scenes.WizardScene(
    'EDIT_OPTION_NAME_SCENE',
    async (ctx) => {
        const optId = ctx.scene.state.optId;
        const option = await ConfigOption.findByPk(optId);
        if (!option) {
            await ctx.reply('⚠️ Опция не найдена.');
            return ctx.scene.leave();
        }
        ctx.wizard.state.optId = optId;

        await ctx.reply(
            `✏️ Изменение названия опции "${option.name}"\n\n` +
            `Введите новое название опции:`,
            Markup.keyboard([['❌ Отмена']]).resize()
        );
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message || !ctx.message.text) return;
        const newName = ctx.message.text.trim();
        if (newName === '❌ Отмена') {
            await ctx.reply('Изменение названия опции отменено.', require('../keyboards').mainMenuAdmin);
            return ctx.scene.leave();
        }

        try {
            const { optId } = ctx.wizard.state;
            await ConfigOption.update({ name: newName }, { where: { id: optId } });
            await ctx.reply(`✅ Название опции успешно изменено на "${newName}"!`, require('../keyboards').mainMenuAdmin);
        } catch (err) {
            console.error(err);
            await ctx.reply('❌ Ошибка изменения опции.', require('../keyboards').mainMenuAdmin);
        }
        return ctx.scene.leave();
    }
);
setupCancelHears(editOptionNameScene);

module.exports = {
    editProductNameScene,
    editProductPriceScene,
    editProductDescScene,
    editProductImageScene,
    editProductSpecsScene,
    editCategoryNameScene,
    editCategoryImageScene,
    addGroupScene,
    editGroupNameScene,
    editOptionNameScene
};
