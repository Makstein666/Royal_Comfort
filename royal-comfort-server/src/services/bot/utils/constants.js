const ADMIN_IDS_CACHE = new Set([1078381605]); // Основной ID всегда в кэше
const SUPER_ADMIN_USERNAMES = ['makste1n', 'John_Kristov']; // Суперадмины

/**
 * Проверка на права администратора.
 */
const isAdmin = (ctx) => {
    return ADMIN_IDS_CACHE.has(ctx.from.id);
};

const isSuperAdmin = (ctx) => {
    if (!ctx.from.username) return false;
    return SUPER_ADMIN_USERNAMES.includes(ctx.from.username);
};

const addAdminToCache = (id) => {
    ADMIN_IDS_CACHE.add(Number(id));
};

const removeAdminFromCache = (id) => {
    ADMIN_IDS_CACHE.delete(Number(id));
};

const getStatusIcon = (s) => {
    if (s === 'Новый' || s === 'Обработка') return '🆕';
    if (s === 'Уточнение деталей') return '📞';
    if (s === 'Утверждение') return '🤝';
    if (s === 'Производство') return '🔨';
    if (s === 'Доставка') return '🚚';
    if (s === 'Установка') return '🛠';
    if (s === 'Вручение' || s === 'Завершен') return '✅';
    if (s === 'Отменен') return '⛔️';
    return '🔄';
};

module.exports = {
    isAdmin,
    isSuperAdmin,
    addAdminToCache,
    removeAdminFromCache,
    getStatusIcon
};
