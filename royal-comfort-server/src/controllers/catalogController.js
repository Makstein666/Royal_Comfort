const { Category, ConfigGroup, ConfigOption, Product } = require('../models');

// GET /api/catalog/categories — все АКТИВНЫЕ категории для сайта
exports.getActiveCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC']],
            attributes: ['id', 'name', 'image', 'description', 'basePrice', 'discountPercent', 'sortOrder']
        });
        res.json(categories);
    } catch (err) {
        console.error('Ошибка getActiveCategories:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// GET /api/catalog/categories/all — ВСЕ категории (для бота/админа)
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['sortOrder', 'ASC']]
        });
        res.json(categories);
    } catch (err) {
        console.error('Ошибка getAllCategories:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// GET /api/catalog/categories/:id — данные категории + конфигуратор
exports.getCategoryWithConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: 'Категория не найдена' });

        // Загружаем группы с опциями
        const groups = await ConfigGroup.findAll({
            where: { categoryId: id },
            order: [['sortOrder', 'ASC']],
            include: [{
                model: ConfigOption,
                as: 'options',
                order: [['sortOrder', 'ASC']]
            }]
        });

        // Форматируем для совместимости с фронтендом
        const formattedGroups = groups.map(g => ({
            id: g.id,
            title: g.title,
            options: g.options.map(o => ({
                id: o.id,
                name: o.name,
                price: o.price
            }))
        }));

        res.json({
            id: category.id,
            name: category.name,
            image: category.image,
            description: category.description,
            basePrice: category.basePrice,
            discountPercent: category.discountPercent,
            isActive: category.isActive,
            groups: formattedGroups
        });
    } catch (err) {
        console.error('Ошибка getCategoryWithConfig:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// PUT /api/catalog/categories/:id — обновить категорию (бот)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, basePrice, discountPercent, name, description } = req.body;

        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: 'Категория не найдена' });

        await category.update({
            ...(isActive !== undefined && { isActive }),
            ...(basePrice !== undefined && { basePrice }),
            ...(discountPercent !== undefined && { discountPercent }),
            ...(name && { name }),
            ...(description && { description })
        });

        res.json({ success: true, category });
    } catch (err) {
        console.error('Ошибка updateCategory:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// PUT /api/catalog/options/:id — обновить цену опции (бот)
exports.updateOption = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, name } = req.body;

        const option = await ConfigOption.findByPk(id);
        if (!option) return res.status(404).json({ message: 'Опция не найдена' });

        await option.update({
            ...(price !== undefined && { price }),
            ...(name && { name })
        });

        res.json({ success: true, option });
    } catch (err) {
        console.error('Ошибка updateOption:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};