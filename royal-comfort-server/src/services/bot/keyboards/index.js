const { Markup } = require('telegraf');

const mainMenuAdmin = Markup.keyboard([
    ['⚡️ В работе', '🗂 История заявок'],
    ['📊 Статистика', '🛍 Каталог'],
    ['⚙️ Настройки']
]).resize();

const mainMenuClient = Markup.keyboard([
    ['🔍 Проверить статус заказа'],
    ['📒 Каталог проектов', '📞 Связь с менеджером']
]).resize();

const backToAdminMenu = Markup.keyboard([
    ['👨‍💼 Вернуться в Админку']
]).resize();

const backToCatalogInline = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 К каталогу', 'catalog_menu')]
]);

module.exports = {
    mainMenuAdmin,
    mainMenuClient,
    backToAdminMenu,
    backToCatalogInline
};
