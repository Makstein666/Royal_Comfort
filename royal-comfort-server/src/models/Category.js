const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  basePrice: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  // Видна ли категория на сайте (включена администратором)
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Скидка в процентах (0 = нет скидки)
  discountPercent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Порядок отображения на сайте
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 99
  },
  // Устаревшее поле, оставлено для совместимости
  configuratorData: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

module.exports = Category;