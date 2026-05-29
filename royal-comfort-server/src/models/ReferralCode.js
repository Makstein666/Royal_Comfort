const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReferralCode = sequelize.define('ReferralCode', {
  code: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  ownerPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ownerName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usedByOrderId: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = ReferralCode;
