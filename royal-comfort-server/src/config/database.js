const { Sequelize } = require('sequelize');
const path = require('path');

// Создаем подключение к SQLite файлу в корне проекта
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'), // Путь к корню/database.sqlite
  logging: false // Отключаем спам в консоль
});

module.exports = sequelize;