const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PromoSettings = sequelize.define('PromoSettings', {
  categoryId: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true // Один подарок на категорию (или 'default' для общих)
  },
  giftName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  giftImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = PromoSettings;
