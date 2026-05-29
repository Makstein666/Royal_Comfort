const ADMIN_IDS_CACHE = new Set([1078381605, 386165967]); // Основные ID всегда в кэше
const SUPER_ADMIN_IDS = [1078381605, 386165967]; // Суперадмины (ID вместо юзернейма)

/**
 * Проверка на права администратора.
 */
const isAdmin = (ctx) => {
    if (!ctx.from) return false;
    return ADMIN_IDS_CACHE.has(ctx.from.id);
};

const isSuperAdmin = (ctx) => {
    if (!ctx.from) return false;
    return SUPER_ADMIN_IDS.includes(ctx.from.id);
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
