const { Category, ConfigGroup, ConfigOption, Product, Review } = require('../models');

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
            description: g.description,
            type: g.id.endsWith('extras') ? 'multiple' : 'single',
            options: g.options.map(o => ({
                id: o.id,
                name: o.name,
                price: o.price,
                description: o.description,
                image: o.image
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
        const { categoryId } = req.query;
        const whereClause = categoryId ? { categoryId, isApproved: true } : { isApproved: true };

        const reviews = await Review.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        
        res.json(reviews);
    } catch (err) {
        console.error('Ошибка getReviews:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// POST /api/catalog/reviews — создать отзыв (с валидацией по заказу)
exports.createReview = async (req, res) => {
    try {
        const { orderId, rating, text, images } = req.body;
        const { Order, Product } = require('../models');
        const { notifyAdminAboutNewReview } = require('../services/bot');

        if (!orderId || !rating || !text) {
            return res.status(400).json({ message: 'Заполните все обязательные поля' });
        }

        // Ищем заказ
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Заказ с таким номером не найден' });
        }

        // Проверяем, нет ли уже отзыва по этому заказу
        const existingReview = await Review.findOne({ where: { orderId } });
        if (existingReview) {
            return res.status(400).json({ message: 'Отзыв по этому заказу уже оставлен' });
        }

        // Определяем категорию
        let categoryId = null;
        let productName = order.productName;

        if (order.productId) {
            const category = await Category.findByPk(order.productId);
            if (!category) {
                const product = await Product.findByPk(order.productId);
                if (product) {
                    categoryId = product.categoryId;
                }
            } else {
                categoryId = category.id;
            }
        }

        // Обработка загруженных картинок (декодирование Base64)
        const savedImageUrls = [];
        if (images && Array.isArray(images)) {
            const fs = require('fs');
            const path = require('path');
            
            for (const imgBase64 of images) {
                if (typeof imgBase64 === 'string' && imgBase64.startsWith('data:image/')) {
                    try {
                        const matches = imgBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                        if (matches && matches.length === 3) {
                            const extMap = {
                                'image/jpeg': '.jpg',
                                'image/jpg': '.jpg',
                                'image/png': '.png',
                                'image/webp': '.webp',
                                'image/gif': '.gif'
                            };
                            const mimeType = matches[1];
                            const ext = extMap[mimeType] || '.jpg';
                            const dataBuffer = Buffer.from(matches[2], 'base64');

                            const uniqueFilename = `reviews_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
                            const targetDir = path.join(__dirname, '../../public/uploads/reviews');
                            const targetFilePath = path.join(targetDir, uniqueFilename);

                            fs.mkdirSync(targetDir, { recursive: true });
                            fs.writeFileSync(targetFilePath, dataBuffer);

                            savedImageUrls.push(`/uploads/reviews/${uniqueFilename}`);
                        }
                    } catch (saveErr) {
                        console.error('Ошибка сохранения Base64 картинки:', saveErr);
                    }
                } else if (typeof imgBase64 === 'string') {
                    // Если это уже путь, сохраняем как есть
                    savedImageUrls.push(imgBase64);
                }
            }
        }

        const review = await Review.create({
            author: order.clientName,
            text,
            rating,
            images: savedImageUrls,
            orderId,
            productName,
            categoryId,
            date: new Date().toLocaleDateString('ru-RU'),
            isApproved: false // На модерацию
        });

        // Отправляем уведомление админам
        notifyAdminAboutNewReview(review).catch(e => console.error('Ошибка отправки уведомления:', e));

        res.status(201).json({ success: true, review });
    } catch (err) {
        console.error('Ошибка createReview:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// GET /api/reviews/check-order/:orderId — проверить заказ перед отзывом и вернуть имя клиента
exports.checkOrderForReview = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { Order } = require('../models');

        if (!orderId) {
            return res.status(400).json({ message: 'Номер заказа не указан' });
        }

        const order = await Order.findByPk(orderId.toUpperCase());
        if (!order) {
            return res.status(404).json({ message: 'Заказ с таким номером не найден' });
        }

        // Проверяем, нет ли уже отзыва
        const existingReview = await Review.findOne({ where: { orderId: order.id } });
        if (existingReview) {
            return res.status(400).json({ message: 'Отзыв по этому заказу уже оставлен' });
        }

        res.json({
            success: true,
            clientName: order.clientName,
            productName: order.productName
        });
    } catch (err) {
        console.error('Ошибка checkOrderForReview:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
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