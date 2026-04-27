const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Опция внутри группы (например: "Малый (2-4 чел) — +0 ₽")
const ConfigOption = sequelize.define('ConfigOption', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
    // Пример: 'tub_size_small', 'tub_size_medium'
  },
  groupId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
    // Пример: 'Малый (2-4 чел)'
  },
  price: {
    type: DataTypes.INTEGER,
    defaultValue: 0
    // Надбавка к базовой цене (0 = входит в базу)
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = ConfigOption;
