const { ReferralCode, Order } = require('../models');
const { Op } = require('sequelize');

// 1. Сгенерировать реферальный код для телефона
exports.generateReferralCode = async (req, res) => {
    try {
        const { phone, name } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Укажите номер телефона' });
        }

        // Нормализуем телефон (только цифры)
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return res.status(400).json({ success: false, message: 'Некорректный номер телефона' });
        }

        // Проверяем, есть ли уже код для этого телефона
        const existing = await ReferralCode.findOne({ where: { ownerPhone: cleanPhone } });
        if (existing) {
            return res.status(200).json({ success: true, code: existing.code });
        }

        // --- НОВАЯ ПРОВЕРКА НАЛИЧИЯ ЗАКАЗА ---
        const phoneSuffix = cleanPhone.slice(-10); // Ищем по последним 10 цифрам, чтобы избежать проблем с форматами +7/8
        
        const orders = await Order.findAll({
            where: {
                clientPhone: {
                    [Op.like]: `%${phoneSuffix}%`
                }
            }
        });

        const allowedStatuses = ['Производство', 'Доставка', 'Установка', 'Завершен', 'Вручение'];
        const hasValidOrder = orders.some(order => allowedStatuses.includes(order.status));

        if (!hasValidOrder) {
            return res.status(403).json({ 
                success: false, 
                message: 'Создание реферального кода доступно только действующим клиентам (ваш заказ должен быть в стадии производства или завершен).' 
            });
        }
        // ------------------------------------

        // Генерируем уникальный код: RC-{последние 4 цифры}-{случайные 3 цифры}
        const last4 = cleanPhone.slice(-4);
        const rand = Math.floor(100 + Math.random() * 900);
        const code = `RC-${last4}-${rand}`;

        // Сохраняем в бд
        const newCode = await ReferralCode.create({
            code,
            ownerPhone: cleanPhone,
            ownerName: name || 'Клиент'
        });

        console.log(`🎁 Сгенерирован реф-код: ${code} для ${cleanPhone}`);
        return res.status(201).json({ success: true, code: newCode.code });
    } catch (error) {
        console.error('Ошибка генерации реф-кода:', error);
        return res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
};

// 2. Валидация реферального кода
exports.validateReferralCode = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ valid: false, message: 'Введите код' });
        }

        const cleanCode = code.trim().toUpperCase();
        const referral = await ReferralCode.findByPk(cleanCode);

        if (!referral) {
            return res.status(404).json({ valid: false, message: 'Код не найден' });
        }

        if (referral.isUsed) {
            return res.status(400).json({ valid: false, message: 'Этот код уже был использован' });
        }

        return res.json({ valid: true, ownerName: referral.ownerName });
    } catch (error) {
        console.error('Ошибка валидации реф-кода:', error);
        return res.status(500).json({ valid: false, message: 'Ошибка сервера' });
    }
};
