const { Order } = require('../models');
const { Op } = require('sequelize');
const { notifyAdminAboutNewOrder } = require('../services/bot');

// Функция генерации ID (RC-ГГММ-СЛУЧАЙНОЕ)
const generateOrderId = () => {
    const datePart = new Date().toISOString().slice(2, 7).replace('-', ''); 
    const randomPart = Math.floor(1000 + Math.random() * 9000); 
    return `RC-${datePart}-${randomPart}`;
};

// 1. Создать новый заказ
exports.createOrder = async (req, res) => {
    try {
        const { 
            type, clientName, clientPhone, contactMethod, preferredTime,
            productId, productName, totalPrice, configuration, gift
        } = req.body;

        const newId = generateOrderId();
        const initialHistory = [
            { title: "Заказ оформлен", date: new Date().toLocaleDateString('ru-RU') }
        ];

        const newOrder = await Order.create({
            id: newId,
            type: type || 'order',
            status: 'Новый', // Начальный статус
            clientName,
            clientPhone,
            contactMethod,
            preferredTime,
            productId,
            productName,
            totalPrice,
            configuration,
            gift,
            history: initialHistory
        });

        console.log(`✅ Создан заказ: ${newId}`);
        
        // Уведомляем админа
        notifyAdminAboutNewOrder(newId, {
            clientName,
            clientPhone,
            contactMethod,
            productName,
            totalPrice
        });

        res.status(201).json({ success: true, orderId: newId });

    } catch (error) {
        console.error("Ошибка при создании:", error);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
};

// 2. Получить статус конкретного заказа (Поиск)
exports.getOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const orderId = id.toUpperCase(); 

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ message: "Заказ не найден" });
        }

        res.json({
            id: order.id,
            product: order.productName || 'Индивидуальный заказ',
            status: order.status,
            date: order.createdAt,
            history: order.history,
            manager: "Алексей" 
        });

    } catch (error) {
        console.error("Ошибка поиска:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 3. Получить список АКТИВНЫХ заказов (Для сайдбара)
exports.getActiveOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: {
                type: 'order', // Только полноценные заказы (не консультации)
                status: {
                    [Op.notIn]: ['Вручение', 'Отменен'] // Исключаем завершенные
                }
            },
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'productName', 'status', 'createdAt'] 
        });

        const safeOrders = orders.map(o => ({
            id: o.id,
            product: o.productName,
            status: o.status,
            date: new Date(o.createdAt).toLocaleDateString('ru-RU')
        }));

        res.json(safeOrders);
    } catch (error) {
        console.error("Ошибка получения активных заявок:", error);
        // Если забыли импортировать Op, ошибка упадет сюда
        res.status(500).json([]);
    }
};

// 4. Поиск заказов по контактным данным (телефон или telegram)
exports.searchOrdersByContact = async (req, res) => {
    try {
        const { phone, telegram } = req.query;

        if (!phone && !telegram) {
            return res.status(400).json({ message: 'Укажите телефон или Telegram' });
        }

        const whereClause = {};

        if (phone) {
            // Нормализуем телефон: оставляем только цифры для гибкого поиска
            const digitsOnly = phone.replace(/\D/g, '');
            // Ищем заказы, где в clientPhone содержатся эти цифры
            whereClause[Op.or] = [
                { clientPhone: { [Op.like]: `%${digitsOnly}%` } },
                { clientPhone: { [Op.like]: `%${phone}%` } }
            ];
        } else if (telegram) {
            // Нормализуем: убираем @ если есть, ищем без него
            const cleanTg = telegram.replace(/^@/, '');
            whereClause[Op.or] = [
                { clientPhone: { [Op.like]: `%${cleanTg}%` } },
                { clientPhone: { [Op.like]: `%@${cleanTg}%` } }
            ];
        }

        const orders = await Order.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'productName', 'status', 'createdAt', 'type']
        });

        if (orders.length === 0) {
            return res.status(404).json({ message: 'Заказы не найдены' });
        }

        const result = orders.map(o => ({
            id: o.id,
            product: o.productName || 'Индивидуальный заказ',
            status: o.status,
            date: new Date(o.createdAt).toLocaleDateString('ru-RU')
        }));

        res.json(result);

    } catch (error) {
        console.error('Ошибка поиска по контакту:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};