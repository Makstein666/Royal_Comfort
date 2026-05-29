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
            productId, productName, totalPrice, configuration, gift, referralCode,
            notes, referenceFiles
        } = req.body;

        if (!clientName || clientName.trim().length < 2) {
            return res.status(400).json({ success: false, message: "Некорректное имя клиента" });
        }
        if (!clientPhone || clientPhone.replace(/\D/g, '').length < 10) {
            return res.status(400).json({ success: false, message: "Некорректный номер телефона" });
        }
        if (totalPrice !== undefined && (isNaN(totalPrice) || totalPrice < 0)) {
            return res.status(400).json({ success: false, message: "Некорректная сумма заказа" });
        }

        const newId = generateOrderId();
        const initialHistory = [
            { title: "Заказ оформлен", date: new Date().toLocaleDateString('ru-RU') }
        ];

        const { ReferralCode } = require('../models');
        let refDetails = null;

        if (referralCode) {
            const cleanCode = referralCode.trim().toUpperCase();
            const referral = await ReferralCode.findByPk(cleanCode);
            const cleanClientPhone = clientPhone.replace(/\D/g, '');
            
            // Защита от самореферальства (нельзя применить свой же код)
            if (referral && !referral.isUsed && referral.ownerPhone !== cleanClientPhone) {
                await referral.update({ isUsed: true, usedByOrderId: newId });
                refDetails = {
                    code: cleanCode,
                    ownerName: referral.ownerName,
                    ownerPhone: referral.ownerPhone
                };
            }
        }

        let finalConfig = configuration || {};
        if (notes || (referenceFiles && referenceFiles.length > 0)) {
            finalConfig = { ...finalConfig, notes, referenceFiles };
        }

        const newOrder = await Order.create({
            id: newId,
            type: type || 'order',
            status: 'Новый',
            clientName,
            clientPhone,
            contactMethod,
            preferredTime,
            productId,
            productName,
            totalPrice,
            configuration: finalConfig,
            gift,
            referralCode,
            history: initialHistory
        });

        console.log(`✅ Создан заказ: ${newId}`);
        
        // Уведомляем админа
        notifyAdminAboutNewOrder(newId, {
            type,
            clientName,
            clientPhone,
            contactMethod,
            productName,
            totalPrice,
            referralCode,
            referralDetails: refDetails,
            configuration: finalConfig
        });

        res.status(201).json({ success: true, orderId: newId });

    } catch (error) {
        console.error("Ошибка при создании:", error);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
};

// 2. Получить статус(ы) конкретного заказа (Поиск по ID)
exports.getOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const orderId = id.toUpperCase(); 

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ message: "Заказ не найден" });
        }

        if (order.type === 'consultation') {
            return res.status(404).json({ message: "Это заявка на консультацию. Менеджер свяжется с вами." });
        }

        // Ищем все заказы этого же клиента (по телефону или имени)
        const whereClause = {
            type: 'order',
            [Op.or]: []
        };
        
        if (order.clientPhone) whereClause[Op.or].push({ clientPhone: order.clientPhone });
        if (order.clientName) whereClause[Op.or].push({ clientName: order.clientName });

        const allOrders = await Order.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        // Возвращаем массив
        const result = allOrders.map(o => ({
            id: o.id,
            product: o.productName || 'Индивидуальный заказ',
            status: o.status,
            date: o.createdAt,
            history: o.history,
            manager: "Алексей" 
        }));

        res.json(result);

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