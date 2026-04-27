// src/data/configuratorData.js

// 1. СПИСОК КАТЕГОРИЙ (Для главной и каталога)
export const categories = [
    {
      id: 'tub',
      name: 'Банные Чаны',
      image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=800',
    },
    {
      id: 'sauna',
      name: 'Бани и Сауны',
      image: 'https://images.unsplash.com/photo-1595345763945-3f33878e474d?q=80&w=800',
    },
    {
      id: 'gazebo',
      name: 'Гриль-зоны',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800',
    },
    {
      id: 'pool',
      name: 'Бассейны',
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=800',
    }
];

// 2. СПИСОК ТОВАРОВ (Готовые решения для каталога)
export const products = [
    {
        id: 'tub-altay',
        categoryId: 'tub',
        name: 'Банный чан "Алтай"',
        // Цена = basePrice(95000) + cedar(25000) + medium(35000) = 155000
        price: 155000,
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800',
        description: 'Классическая модель из кедра с печью. Предварительная цена — зависит от комплектации.',
        // medium(4-6чел) + пищевая сталь + кедр + простая печь
        defaultConfig: { size: 'medium', material: 'food_steel', wood: 'cedar', stove: 'simple' }
    },
    {
        id: 'tub-baikal',
        categoryId: 'tub',
        name: 'Банный чан "Байкал"',
        // Цена = basePrice(95000) + large(65000) + premium_steel(45000) + oak(55000) + integrated(45000) = 305000
        price: 305000,
        image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800',
        description: 'Премиум модель с подсветкой и гидромассажем. Предварительная цена — зависит от комплектации.',
        // large(6-8чел) + прем сталь + дуб + интегрированная печь
        defaultConfig: { size: 'large', material: 'premium_steel', wood: 'oak', stove: 'integrated' }
    },
    {
        id: 'sauna-fin',
        categoryId: 'sauna',
        name: 'Финская сауна "Хельсинки"',
        // Цена = basePrice(350000) + 2x2(0) + linden(0) = 350000
        price: 350000,
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800',
        description: 'Компактная сауна для дома. Предварительная цена — зависит от комплектации.',
        defaultConfig: { size: '2x2', wood: 'linden' }
    }
];

// 3. ДАННЫЕ ДЛЯ КОНФИГУРАТОРА (Опции и цены)
export const configuratorData = {
    'tub': {
        basePrice: 95000,
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=800',
        groups: [
            {
                id: 'size',
                title: 'Размер чаши',
                options: [
                    { id: 'small', name: 'Малый (2-4 чел)', price: 0 },
                    { id: 'medium', name: 'Средний (4-6 чел)', price: 35000 },
                    { id: 'large', name: 'Большой (6-8 чел)', price: 65000 },
                    { id: 'giant', name: 'Гигант (10+ чел)', price: 120000 }
                ]
            },
            {
                id: 'material',
                title: 'Материал чаши',
                options: [
                    { id: 'food_steel', name: 'Сталь AISI 304 (Пищевая)', price: 0 },
                    { id: 'premium_steel', name: 'Сталь AISI 316 (Премиум)', price: 45000 }
                ]
            },
            {
                id: 'wood',
                title: 'Отделка деревом',
                options: [
                    { id: 'larch', name: 'Лиственница', price: 0 },
                    { id: 'cedar', name: 'Алтайский кедр', price: 25000 },
                    { id: 'oak', name: 'Мореный дуб', price: 55000 }
                ]
            },
            {
                id: 'stove',
                title: 'Печь',
                options: [
                    { id: 'simple', name: 'Простая (внешняя)', price: 0 },
                    { id: 'integrated', name: 'Интегрированная (с водяной рубашкой)', price: 45000 }
                ]
            }
        ]
    },
    'sauna': {
        basePrice: 350000,
        image: 'https://images.unsplash.com/photo-1595345763945-3f33878e474d?q=80&w=800',
        groups: [
            {
                id: 'size',
                title: 'Размер парной',
                options: [
                    { id: '2x2', name: '2 x 2 м', price: 0 },
                    { id: '3x3', name: '3 x 3 м', price: 150000 }
                ]
            },
            {
                id: 'wood',
                title: 'Материал отделки',
                options: [
                    { id: 'linden', name: 'Липа', price: 0 },
                    { id: 'abachi', name: 'Абаш (Африканский дуб)', price: 80000 }
                ]
            }
        ]
    },
    'gazebo': {
        basePrice: 150000,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800',
        groups: [
            {
                id: 'type',
                title: 'Тип конструкции',
                options: [
                    { id: 'open', name: 'Открытая беседка', price: 0 },
                    { id: 'closed', name: 'Закрытая (зимняя)', price: 200000 }
                ]
            }
        ]
    },
    'pool': {
        basePrice: 500000,
        image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=800',
        groups: [
            {
                id: 'bowl',
                title: 'Тип чаши',
                options: [
                    { id: 'poly', name: 'Полипропилен', price: 0 },
                    { id: 'comp', name: 'Композит', price: 300000 }
                ]
            }
        ]
    }
};