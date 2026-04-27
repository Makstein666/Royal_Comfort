const IMAGES = {
    welcome: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000',
    status_new: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?q=80&w=1000',
    status_production: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000',
    status_delivery: 'https://images.unsplash.com/photo-1605218457233-bc2747372b3b?q=80&w=1000',
    status_done: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000',
    notFound: 'https://cdn-icons-png.flaticon.com/512/2748/2748558.png'
};

const ADMIN_IDS_CACHE = new Set([1078381605]); // Основной ID всегда в кэше

/**
 * Проверка на права администратора.
 * Сначала проверяет кэш, затем (в перспективе) базу данных.
 */
const isAdmin = (ctx) => {
    return ADMIN_IDS_CACHE.has(ctx.from.id);
};

const addAdminToCache = (id) => {
    ADMIN_IDS_CACHE.add(Number(id));
};

const getStatusIcon = (s) => {
    if (s === 'Новый') return '🆕';
    if (s === 'Вручение') return '✅';
    if (s === 'Отменен') return '⛔️';
    return '🔄';
};

const getOrderStatusInfo = (s) => {
    let p = '🟩⬜️⬜️⬜️⬜️ 20%', d = 'Принято', i = IMAGES.status_new;
    if (s === 'В производстве') { p = '🟩🟩🟩⬜️⬜️ 60%'; d = 'Сборка'; i = IMAGES.status_production; }
    else if (s === 'Доставка') { p = '🟩🟩🟩🟩🚀 90%'; d = 'Едет к вам'; i = IMAGES.status_delivery; }
    else if (s === 'Вручение') { p = '🟩🟩🟩🟩🟩 100%'; d = 'Готово'; i = IMAGES.status_done; }
    return { image: i, progress: p, desc: d };
};

module.exports = {
    IMAGES,
    isAdmin,
    addAdminToCache,
    getStatusIcon,
    getOrderStatusInfo
};
