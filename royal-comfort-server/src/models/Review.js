const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // ИЗМЕНЕНИЕ: Теперь храним массив ссылок (JSON)
  images: {
    type: DataTypes.JSON, 
    allowNull: true,
    defaultValue: [] // По умолчанию пустой массив
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false 
  }
});

module.exports = Review;