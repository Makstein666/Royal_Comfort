const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Убедись, что тут лежит подключение Sequelize

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    // ID будет генерироваться на фронте или в контроллере (например, RC-2405-XXXX)
  },
  
  // ВАЖНО: Различаем типы заявок
  // 'consultation' - просто звонок
  // 'order' - оформление товара из конфигуратора
  type: {
    type: DataTypes.ENUM('consultation', 'order'),
    defaultValue: 'order',
    allowNull: false
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: 'Новый', // Новый -> В работе -> Производство -> Готов и т.д.
  },

  // --- ДАННЫЕ КЛИЕНТА (Нужны всегда) ---
  clientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  clientPhone: { // Сюда пишем телефон или ник телеграм
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactMethod: { // 'phone', 'whatsapp', 'telegram'
    type: DataTypes.STRING,
    defaultValue: 'phone'
  },
  preferredTime: { // "После 18:00" (только для заказа)
    type: DataTypes.STRING,
    allowNull: true 
  },

  // --- ДАННЫЕ О ТОВАРЕ (Только для type: 'order') ---
  productId: { // id категории или товара, например 'tub-altay'
    type: DataTypes.STRING,
    allowNull: true
  },
  productName: { // "Банный чан Алтай"
    type: DataTypes.STRING,
    allowNull: true
  },
  totalPrice: { // Итоговая стоимость
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  
  // Самое интересное: храним конфигурацию как JSON строку
  // { "size": "medium", "material": "cedar", "stove": "integrated" }
  configuration: {
    type: DataTypes.JSON, 
    allowNull: true
  },

  // Подарок (если есть)
  gift: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // --- ИСТОРИЯ И ТЕХНИЧЕСКИЕ ПОЛЯ ---
  // Массив истории статусов: [{status: 'Новый', date: '...'}, ...]
  history: {
    type: DataTypes.JSON,
    defaultValue: [] 
  },
  
  // Для связи с Telegram аккаунтом (если пользователь напишет боту)
  telegramChatId: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Order;