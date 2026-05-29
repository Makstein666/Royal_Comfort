const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const Review = require('./Review');
const Order = require('./Order');
const ConfigGroup = require('./ConfigGroup');
const ConfigOption = require('./ConfigOption');
const PromoSettings = require('./PromoSettings');
const Admin = require('./Admin');
const ReferralCode = require('./ReferralCode');


// Связи товаров и категорий
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category', onDelete: 'CASCADE' });

// Связи отзывов
Category.hasMany(Review, { foreignKey: 'categoryId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Category, { foreignKey: 'categoryId', as: 'category', onDelete: 'CASCADE' });

// Связи конфигуратора
Category.hasMany(ConfigGroup, { foreignKey: 'categoryId', as: 'configGroups', onDelete: 'CASCADE' });
ConfigGroup.belongsTo(Category, { foreignKey: 'categoryId', as: 'category', onDelete: 'CASCADE' });

ConfigGroup.hasMany(ConfigOption, { foreignKey: 'groupId', as: 'options', onDelete: 'CASCADE' });
ConfigOption.belongsTo(ConfigGroup, { foreignKey: 'groupId', as: 'group', onDelete: 'CASCADE' });

module.exports = {
  sequelize,
  Category,
  Product,
  Review,
  Order,
  ConfigGroup,
  ConfigOption,
  PromoSettings,
  Admin,
  ReferralCode
};