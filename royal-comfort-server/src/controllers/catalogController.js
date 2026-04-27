const { Category, ConfigGroup, ConfigOption, Product } = require('../models');

// GET /api/catalog/categories — все категории для сайта (включая неактивные, чтобы показывать заглушку)
exports.getActiveCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            // Убрали where: { isActive: true }, чтобы фронт видел все категории
            order: [['sortOrder', 'ASC']],
            attributes: ['id', 'name', 'image', 'description', 'basePrice', 'discountPercent', 'sortOrder', 'isActive']
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

// GET /api/catalog/products — получить товары
exports.getProducts = async (req, res) => {
    try {
        const { categoryId } = req.query;
        const whereClause = categoryId ? { categoryId, isActive: true } : { isActive: true };
        
        const products = await Product.findAll({
            where: whereClause,
            order: [['price', 'ASC']]
        });
        
        // Форматируем для клиента (парсинг JSON-полей)
        const formattedProducts = products.map(p => ({
            id: p.id,
            categoryId: p.categoryId,
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image,
            images: p.images ? JSON.parse(p.images) : [],
            features: p.features ? JSON.parse(p.features) : [],
            specs: p.specs ? JSON.parse(p.specs) : {},
            defaultConfig: p.defaultConfig ? JSON.parse(p.defaultConfig) : {}
        }));

        res.json(formattedProducts);
    } catch (err) {
        console.error('Ошибка getProducts:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// GET /api/catalog/reviews — получить отзывы
exports.getReviews = async (req, res) => {
    try {
        // Заглушка, пока не реализуем модель Review полностью (или если она уже есть)
        // Предполагаем, что модель Review существует в db
        const { Review } = require('../models');
        if (!Review) {
             return res.json([]);
        }

        const { categoryId } = req.query;
        const whereClause = categoryId ? { categoryId, isApproved: true } : { isApproved: true };

        const reviews = await Review.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        
        res.json(reviews);
    } catch (err) {
        console.error('Ошибка getReviews:', err);
        // Если таблицы нет, возвращаем пустой массив
        res.json([]);
    }
};

// GET /api/catalog/promo — получить активные промо (подарки)
exports.getPromoSettings = async (req, res) => {
    try {
        const { PromoSettings } = require('../models');
        if (!PromoSettings) return res.json([]);
        const promos = await PromoSettings.findAll({ where: { isActive: true } });
        res.json(promos);
    } catch (err) {
        console.error('Ошибка getPromoSettings:', err);
        res.json([]);
    }
};