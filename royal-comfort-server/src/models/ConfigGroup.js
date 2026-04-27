const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Группа опций конфигуратора (например: "Размер чаши", "Материал")
const ConfigGroup = sequelize.define('ConfigGroup', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
    // Пример: 'tub_size', 'tub_material'
  },
  categoryId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
    // Пример: 'Размер чаши'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = ConfigGroup;
