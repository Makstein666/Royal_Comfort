const sequelize = require('../config/database');
const Category = require('./Category');
const Product = require('./Product');
const Review = require('./Review');
const Order = require('./Order');
const ConfigGroup = require('./ConfigGroup');
const ConfigOption = require('./ConfigOption');

// Связи товаров и категорий
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Связи отзывов
Category.hasMany(Review, { foreignKey: 'categoryId', as: 'reviews' });
Review.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Связи конфигуратора
Category.hasMany(ConfigGroup, { foreignKey: 'categoryId', as: 'configGroups' });
ConfigGroup.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

ConfigGroup.hasMany(ConfigOption, { foreignKey: 'groupId', as: 'options' });
ConfigOption.belongsTo(ConfigGroup, { foreignKey: 'groupId', as: 'group' });

module.exports = {
  sequelize,
  Category,
  Product,
  Review,
  Order,
  ConfigGroup,
  ConfigOption
};