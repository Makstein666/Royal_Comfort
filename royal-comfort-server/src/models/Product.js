// src/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  // Название товара
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Цена (число)
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Описание
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Картинка
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Галочка "Хит продаж" (true или false)
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  images: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true
  },
  features: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true
  },
  specs: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true
  },
  defaultConfig: {
    type: DataTypes.TEXT, // JSON string
    allowNull: true
  }
  // Поле categoryId (связь с категорией) создастся автоматически на Шаге 3
});

module.exports = Product;