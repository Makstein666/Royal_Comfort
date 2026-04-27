// src/data/mockData.js

// ==========================================
// 1. СПИСОК КАТЕГОРИЙ
// ==========================================
export const categoriesList = [
  { id: 'tub', name: 'Банные Чаны', image: '/images/chan.jpg' },
  { id: 'sauna', name: 'Бани-Бочки', image: '/images/banya.jpg' },
  { id: 'plunge', name: 'Купели', image: '/images/kupel.jpeg' },
  { id: 'gazebo', name: 'Беседки', image: '/images/besedki.jpg' },
  { id: 'fireplace', name: 'Уличные Камины', image: '/images/kamin.webp' },
  { id: 'greenhouse', name: 'Теплицы Premium', image: '/images/teplica.webp' },
  { id: 'pool', name: 'Бассейны', image: '/images/waterpool.jpg' },
  { id: 'mangal', name: 'Мангальные Зоны', image: '/images/mangal.jpg' },
  { id: 'swing', name: 'Садовые Качели', image: '/images/kacheli.jpg' },
];

export const categoryNames = {
  tub: "Банные чаны",
  sauna: "Бани-бочки",
  plunge: "Купели",
  gazebo: "Беседки",
  fireplace: "Уличные камины",
  greenhouse: "Теплицы",
  pool: "Бассейны",
  mangal: "Мангальные зоны",
  swing: "Садовые качели"
};

// ==========================================
// 2. ШАБЛОНЫ ДЕТАЛЕЙ (Для всплывающего окна "Детали проекта")
// ==========================================
const DETAILS_TEMPLATE = {
  tub: {
    specs: [
      { label: "Материал чаши", value: "Нержавеющая сталь AISI 304 / 316" },
      { label: "Обшивка", value: "Алтайский кедр / Лиственница" },
      { label: "Толщина стали", value: "2 - 3 мм" },
      { label: "Срок службы", value: "до 50 лет" },
      { label: "Гарантия", value: "3 года (шов), 1 год (дерево)" },
    ],
    colors: [
      { name: "Натуральный", hex: "#e3cfae" },
      { name: "Тик", hex: "#c28742" },
      { name: "Палисандр", hex: "#5c4033" },
      { name: "Графит", hex: "#2d2d2d" }
    ],
    process: "Каждый чан проходит 8 этапов проверки. Мы используем лазерную резку металла для идеальной геометрии, а сварочные швы проходят ультразвуковой контроль. Древесина сушится в вакуумных камерах до влажности 8-10%."
  },
  sauna: {
    specs: [
      { label: "Каркас", value: "Ель / Кедр камерной сушки" },
      { label: "Кровля", value: "Гибкая черепица (Финляндия)" },
      { label: "Толщина стенки", value: "45 мм" },
      { label: "Печь", value: "Дровяная / Электрическая" },
    ],
    colors: [
      { name: "Сосна", hex: "#f0e68c" },
      { name: "Орех", hex: "#8b4513" },
      { name: "Венге", hex: "#2f1b15" }
    ],
    process: "Бесщелевая технология сборки 'Лунный паз'. Сборка производится на стапеле, что гарантирует идеальную геометрию. Используем только нержавеющий крепеж и экологичные пропитки."
  },
  plunge: {
    specs: [
      { label: "Материал", value: "Лиственница / Композит" },
      { label: "Обручи", value: "Нержавеющая сталь с регулировкой" },
      { label: "Покрытие", value: "Полиуретановый лак" },
    ],
    colors: [
      { name: "Натуральный", hex: "#e3cfae" },
      { name: "Мореный дуб", hex: "#4a3c31" }
    ],
    process: "Традиционная бондарная технология в сочетании с современными герметиками. Древесина проходит термическую обработку для защиты от гниения."
  },
  gazebo: {
    specs: [
      { label: "Брус", value: "Клееный брус 150х150" },
      { label: "Остекление", value: "Закаленное стекло / Монолитный поликарбонат" },
      { label: "Пол", value: "Террасная доска ДПК" },
    ],
    colors: [
      { name: "Белый", hex: "#ffffff" },
      { name: "Тик", hex: "#c28742" },
      { name: "Антрацит", hex: "#374151" }
    ],
    process: "Все детали выпиливаются на станках ЧПУ с точностью до 0.5мм. Контрольная сборка на производстве перед отправкой клиенту."
  },
  greenhouse: {
    specs: [
      { label: "Профиль", value: "Алюминиевая труба 40х20" },
      { label: "Покраска", value: "Порошковая (любой RAL)" },
      { label: "Стекло", value: "Закаленное 4мм" },
    ],
    colors: [
      { name: "Шоколад", hex: "#5c4033" },
      { name: "Зеленый мох", hex: "#354a21" },
      { name: "Серый", hex: "#808080" }
    ],
    process: "Заводская сварка каркасов. Полимерное покрытие запекается в печи при 200 градусах, обеспечивая защиту от коррозии на 20 лет."
  },
  pool: {
    specs: [
      { label: "Чаша", value: "Многослойный композит" },
      { label: "Покрытие", value: "Gelcoat (Франция)" },
      { label: "Гарантия", value: "20 лет на чашу" }
    ],
    colors: [
      { name: "Голубой", hex: "#60a5fa" },
      { name: "Белый", hex: "#ffffff" },
      { name: "Песочный", hex: "#fde047" }
    ],
    process: "Напыление 8 слоев композитных материалов и керамики. Армирование углеволокном."
  },
  mangal: {
    specs: [
      { label: "Сталь", value: "09Г2С / Нержавейка" },
      { label: "Толщина", value: "3мм - 8мм" },
      { label: "Покраска", value: "Термостойкая эмаль (до 1200°С)" }
    ],
    colors: [{ name: "Черный", hex: "#111827" }],
    process: "Лазерная резка и гибка металла на высокоточном оборудовании. Пескоструйная обработка перед покраской."
  },
  swing: {
    specs: [
      { label: "Нагрузка", value: "до 400 кг" },
      { label: "Массив", value: "Сосна / Лиственница" },
      { label: "Ткань", value: "Оксфорд (водоотталкивающая)" }
    ],
    colors: [{ name: "Дерево", hex: "#a16207" }, { name: "Белый", hex: "#ffffff" }],
    process: "Использование клееных балок для предотвращения деформации. Обработка маслом Osmo."
  },
  fireplace: {
    specs: [
      { label: "Сталь", value: "Конструкционная / Corten" },
      { label: "Диаметр", value: "600 - 1200 мм" }
    ],
    colors: [{ name: "Черный", hex: "#000000" }, { name: "Ржавчина", hex: "#9a3412" }],
    process: "Художественная плазменная резка."
  },
  default: {
    specs: [
      { label: "Материал", value: "Премиальные материалы" },
      { label: "Производство", value: "Ручная работа / ЧПУ" },
      { label: "Гарантия", value: "12 месяцев" }
    ],
    colors: [{ name: "Стандарт", hex: "#cccccc" }],
    process: "Изделие изготавливается по индивидуальному проекту с контролем качества на каждом этапе."
  }
};
// ==========================================
// 3. ДАННЫЕ ДЛЯ КОНФИГУРАТОРА (ОПЦИИ И ЦЕНЫ)
// ==========================================
export const configuratorData = {
  // === ЧАНЫ ===
  tub: {
    basePrice: 95000, 
    groups: [
      {
        id: 'size', title: 'Размер чаши', type: 'single',
        options: [
          // Малый теперь доступен и для премиума
          { id: 'small', name: 'Малый (2-4 чел)', price: 0, image: '/images/config/size-s.jpg', desc: 'Ø 160см', info: 'Компактный и уютный.', allowedTiers: ['standard', 'premium'] },
          { id: 'medium', name: 'Средний (4-6 чел)', price: 35000, image: '/images/config/size-m.jpg', desc: 'Ø 185см', info: 'Хит продаж.', allowedTiers: ['standard', 'premium'] },
          { id: 'large', name: 'Большой (6-8 чел)', price: 65000, image: '/images/config/size-l.jpg', desc: 'Ø 200см', info: 'Для больших компаний.', allowedTiers: ['standard', 'premium'] },
          // Гигант - только премиум
          { id: 'giant', name: 'Grand (8-10 чел)', price: 95000, image: '/images/config/size-xl.jpg', desc: 'Ø 230см', info: 'Максимальный размер.', allowedTiers: ['premium'] },
        ]
      },
      {
        id: 'material', title: 'Материал чаши', type: 'single',
        options: [
          { id: 'steel_304', name: 'Сталь AISI 304', price: 0, desc: 'Пищевая', info: 'Классическая нержавейка.', allowedTiers: ['standard', 'premium'] },
          { id: 'steel_316', name: 'Сталь AISI 316', price: 45000, desc: 'Кислотостойкая', info: 'Повышенная защита от солей.', allowedTiers: ['premium'] },
          { id: 'copper', name: 'Медный сплав', price: 250000, desc: 'Luxury', info: 'Элитный внешний вид и свойства.', allowedTiers: ['premium'] },
        ]
      },
      {
        id: 'finish', title: 'Отделка деревом', type: 'single',
        options: [
          { id: 'cedar', name: 'Кедр Натуральный', price: 0, color: '#d4b996', info: 'Ароматный алтайский кедр.', allowedTiers: ['standard', 'premium'] },
          { id: 'cedar_dark', name: 'Кедр (Орех)', price: 5000, color: '#5c4033', info: 'Тонировка пропиткой.', allowedTiers: ['standard', 'premium'] },
          { id: 'larch', name: 'Лиственница', price: 15000, color: '#e3cfae', info: 'Максимальная прочность.', allowedTiers: ['standard', 'premium'] },
          { id: 'larch_burned', name: 'Лиственница (Обжиг)', price: 25000, color: '#2d2d2d', info: 'Японская технология Yakisugi.', allowedTiers: ['premium'] },
          { id: 'oak', name: 'Мореный Дуб', price: 55000, color: '#3e2723', desc: 'Elite', info: 'Премиальная порода дерева.', allowedTiers: ['premium'] },
        ]
      },
      {
        id: 'stove', title: 'Печь', type: 'single',
        options: [
          { 
            id: 'simple', name: 'Погружная (Внутренняя)', price: 0, 
            desc: 'Компакт', info: 'Находится в воде.',
            incompatibleWith: { size: ['giant'] },
            allowedTiers: ['standard', 'premium'] 
          },
          { id: 'external', name: 'Внешняя (Сварная)', price: 45000, desc: 'Удобство', info: 'Больше места в чаше.', allowedTiers: ['standard', 'premium'] },
          { 
            id: 'jacket', name: 'С водяной рубашкой', price: 85000, desc: 'Turbo', info: 'Нагрев в 2 раза быстрее.',
            incompatibleWith: { size: ['small'] },
            allowedTiers: ['premium']
          },
          { id: 'electric', name: 'Электронагрев 12кВт', price: 60000, desc: 'Авто', info: 'Поддержание температуры.', allowedTiers: ['standard', 'premium'] },
        ]
      },
      {
        id: 'extras', title: 'Опции и Тюнинг', type: 'multiple',
        options: [
          // Базовые удобства
          { id: 'lid', name: 'Термокрышка', price: 18000, desc: 'Экономия', info: 'Ускоряет нагрев.', allowedTiers: ['standard', 'premium'] },
          { id: 'stairs_podium', name: 'Лестница-подиум', price: 35000, desc: 'Комфорт', info: 'Удобный заход с площадкой.', allowedTiers: ['standard', 'premium'] },
          { id: 'chimney_protection', name: 'Защита дымохода', price: 7500, desc: 'Безопасность', info: 'Кожух от ожогов.', allowedTiers: ['standard', 'premium'] },
          { id: 'shelf', name: 'Полка для напитков', price: 4500, desc: 'Удобство', info: 'Съемная полка на борт.', allowedTiers: ['standard', 'premium'] },
          
          // Премиум технологии
          { id: 'insulation', name: 'Утепление чаши (ППУ)', price: 25000, desc: 'Термос', info: 'Сохраняет тепло до 24ч.', allowedTiers: ['premium'] },
          { id: 'chrome', name: 'Chrome-пакет', price: 30000, desc: 'Стиль', info: 'Зеркальный дымоход.', allowedTiers: ['premium'] },
          
          // SPA функции
          { id: 'hydro', name: 'Гидромассаж (6 форсунок)', price: 55000, desc: 'SPA', info: 'Мощный массаж спины.', allowedTiers: ['premium'] },
          { id: 'aero', name: 'Аэромассаж (Джакузи)', price: 65000, desc: 'Relax', info: 'Тысячи пузырьков.', allowedTiers: ['premium'] },
          { id: 'light', name: 'LED подсветка', price: 15000, desc: 'RGB', info: 'Хромотерапия.', allowedTiers: ['standard', 'premium'] },
          { id: 'audio', name: 'Аудиосистема Marine', price: 45000, desc: 'Music', info: 'Bluetooth акустика.', allowedTiers: ['premium'] },
          { 
            id: 'smart', name: 'Smart-Control', price: 30000, desc: 'Wi-Fi', info: 'Управление с телефона.',
            incompatibleWith: { stove: ['simple', 'external', 'jacket'] }, 
            allowedTiers: ['premium'] 
          },
        ]
      }
    ]
  },

  // === БАНИ ===
  sauna: {
    basePrice: 190000, 
    groups: [
      {
        id: 'shape', title: 'Форма', type: 'single',
        options: [
          { id: 'round', name: 'Круглая (Бочка)', price: 0, image: '/images/config/sauna-round.jpg', info: 'Классика.', allowedTiers: ['standard', 'premium'] },
          { id: 'quadro', name: 'Квадро', price: 40000, image: '/images/config/sauna-quadro.jpg', info: 'Больше места.', allowedTiers: ['standard', 'premium'] },
          { id: 'oval', name: 'Овальная', price: 60000, image: '/images/config/sauna-oval.jpg', info: 'Две секции, вход сбоку.', allowedTiers: ['premium'] },
        ]
      },
      {
        id: 'length', title: 'Длина', type: 'single',
        options: [
          { id: '2m', name: '2 метра (Мини)', price: 0, desc: 'Только парная', allowedTiers: ['standard', 'premium'] },
          { id: '4m', name: '4 метра (Оптима)', price: 90000, desc: 'Парная + Предбанник', allowedTiers: ['standard', 'premium'] },
          { id: '6m', name: '6 метров (Макси)', price: 180000, desc: 'Дом-баня', allowedTiers: ['premium'] },
        ]
      },
      {
        id: 'wood', title: 'Материал', type: 'single',
        options: [
          { id: 'spruce', name: 'Ель Северная', price: 0, color: '#f2e8d5', info: 'Светлая.', allowedTiers: ['standard', 'premium'] },
          { id: 'cedar', name: 'Кедр Алтайский', price: 65000, color: '#d4b996', info: 'Целебный.', allowedTiers: ['standard', 'premium'] },
          { id: 'thermo', name: 'Термо-сосна', price: 85000, color: '#8d6e63', info: 'Не гниет.', allowedTiers: ['premium'] },
        ]
      },
      {
        id: 'stove', title: 'Печь', type: 'single',
        options: [
          { id: 'std', name: 'Дровяная (Base)', price: 0, info: 'Стальная.', allowedTiers: ['standard', 'premium'] },
          { id: 'harvia', name: 'Harvia M3 (Finland)', price: 55000, info: 'Быстрый прогрев.', allowedTiers: ['standard', 'premium'] },
          { id: 'cometa', name: 'GrillD Cometa Vega', price: 65000, desc: 'Закрытая каменка', info: 'Легкий пар.', allowedTiers: ['premium'] },
        ]
      },
      {
        id: 'extras', title: 'Опции', type: 'multiple',
        options: [
          { id: 'panorama', name: 'Панорамное окно', price: 45000, desc: 'FullView', allowedTiers: ['premium'] },
          { id: 'glass_door', name: 'Стеклянная дверь', price: 15000, info: 'Бронза.', allowedTiers: ['standard', 'premium'] },
          { id: 'shower', name: 'Душевая система', price: 35000, info: 'Бак и поддон.', incompatibleWith: { length: ['2m'] }, allowedTiers: ['standard', 'premium'] },
          { id: 'salt_wall', name: 'Панно из соли', price: 25000, desc: 'Здоровье', info: 'Гималайская соль с подсветкой.', allowedTiers: ['premium'] },
          { id: 'starry_sky', name: 'Звездное небо', price: 45000, desc: 'Свет', info: 'Точки на потолке.', allowedTiers: ['premium'] },
        ]
      }
    ]
  },
  // === БЕСЕДКИ ===
  gazebo: {
    basePrice: 150000,
    groups: [
      {
        id: 'size', title: 'Размер', type: 'single',
        options: [
          { id: '3x3', name: '3x3 м', price: 0, allowedTiers: ['standard', 'premium'] },
          { id: '3x4', name: '3x4 м', price: 50000, allowedTiers: ['standard', 'premium'] },
          { id: '4x6', name: '4x6 м', price: 120000, allowedTiers: ['premium'] },
        ]
      },
      {
        id: 'type', title: 'Остекление', type: 'single',
        options: [
          { id: 'open', name: 'Открытая', price: 0, allowedTiers: ['standard', 'premium'] },
          { id: 'soft', name: 'Мягкие окна (ПВХ)', price: 45000, info: 'Защита от ветра.', allowedTiers: ['standard', 'premium'] },
          { id: 'glass', name: 'Стеклопакеты (Alu)', price: 180000, info: 'Раздвижная система.', allowedTiers: ['premium'] },
        ]
      },
      {
        id: 'extras', title: 'Наполнение', type: 'multiple',
        options: [
            { id: 'furniture', name: 'Мебель (Стол+Лавки)', price: 35000, allowedTiers: ['standard', 'premium'] },
            { id: 'mosquito', name: 'Москитные сетки', price: 15000, allowedTiers: ['standard', 'premium'] },
            { id: 'bbq', name: 'Печь-барбекю (Кирпич)', price: 120000, desc: 'Кухня', allowedTiers: ['premium'] },
            { id: 'heater', name: 'ИК-обогреватель', price: 12000, desc: 'Тепло', allowedTiers: ['premium'] },
            { id: 'floor_ins', name: 'Утепление пола', price: 25000, allowedTiers: ['premium'] },
        ]
      }
    ]
  },

  // === КУПЕЛИ ===
  plunge: {
    basePrice: 55000,
    groups: [
      {
        id: 'form', title: 'Форма', type: 'single',
        options: [
          { id: 'oval', name: 'Овальная', price: 0, allowedTiers: ['standard', 'premium'] },
          { id: 'round', name: 'Круглая', price: 15000, allowedTiers: ['standard', 'premium'] },
        ]
      },
      {
        id: 'insert', title: 'Вставка', type: 'single',
        options: [
          { id: 'none', name: 'Без вставки (Дерево)', price: 0, allowedTiers: ['standard', 'premium'] },
          { id: 'plastic', name: 'Пластиковая чаша', price: 25000, allowedTiers: ['standard', 'premium'] },
        ]
      },
      {
        id: 'heat', title: 'Подогрев', type: 'single',
        options: [
            { id: 'none', name: 'Без печи', price: 0, allowedTiers: ['standard', 'premium'] },
            { id: 'external', name: 'Внешняя дровяная печь', price: 35000, allowedTiers: ['standard', 'premium'] }
        ]
      },
      {
        id: 'extras', title: 'Аксессуары', type: 'multiple',
        options: [
            { id: 'ladder', name: 'Лестница', price: 5000, allowedTiers: ['standard', 'premium'] },
            { id: 'lid', name: 'Крышка', price: 8000, allowedTiers: ['standard', 'premium'] },
            { id: 'jacuzzi', name: 'Аэромассаж', price: 45000, desc: 'SPA', allowedTiers: ['premium'] },
        ]
      }
    ]
  },

  // === ТЕПЛИЦЫ ===
  greenhouse: {
    basePrice: 45000,
    groups: [
        { id: 'frame', title: 'Каркас', type: 'single', options: [{id: 'steel', name: 'Стальная труба', price: 0, allowedTiers: ['standard', 'premium']}, {id: 'alum', name: 'Алюминиевый профиль', price: 35000, allowedTiers: ['premium']}] },
        { id: 'glass', title: 'Покрытие', type: 'single', options: [{id: 'poly', name: 'Поликарбонат 4мм', price: 0, allowedTiers: ['standard', 'premium']}, {id: 'glass', name: 'Закаленное стекло', price: 45000, allowedTiers: ['premium']}] },
        { id: 'extras', title: 'Дополнительно', type: 'multiple', options: [
            {id: 'autovent', name: 'Авто-проветривание', price: 5000, allowedTiers: ['standard', 'premium']},
            {id: 'watering', name: 'Система полива', price: 15000, allowedTiers: ['premium']}
        ]}
    ]
  },
  
  // === БАССЕЙНЫ ===
  pool: {
      basePrice: 150000,
      groups: [
          { id: 'type', title: 'Чаша', type: 'single', options: [{id: 'frame', name: 'Каркас (ПВХ)', price: 0, allowedTiers: ['standard', 'premium']}, {id: 'comp', name: 'Композитная чаша', price: 350000, allowedTiers: ['premium']}] },
          { id: 'equip', title: 'Оборудование', type: 'multiple', options: [
              {id: 'filter', name: 'Песочный фильтр', price: 25000, allowedTiers: ['standard', 'premium']}, 
              {id: 'heat', name: 'Подогрев воды', price: 85000, allowedTiers: ['premium']},
              {id: 'counterflow', name: 'Противоток', price: 120000, desc: 'Искусственное течение', allowedTiers: ['premium']},
              {id: 'light', name: 'Подсветка', price: 20000, allowedTiers: ['standard', 'premium']}
          ]}
      ]
  },

  // === КАМИНЫ ===
  fireplace: {
    basePrice: 25000,
    groups: [
        { id: 'fuel', title: 'Топливо', type: 'single', options: [{id: 'wood', name: 'Дрова', price: 0, allowedTiers: ['standard', 'premium']}, {id: 'bio', name: 'Биоэтанол', price: 25000, allowedTiers: ['premium']}] },
        { id: 'material', title: 'Материал', type: 'single', options: [{id: 'steel', name: 'Черная сталь', price: 0, allowedTiers: ['standard', 'premium']}, {id: 'corten', name: 'Сталь Corten', price: 15000, allowedTiers: ['premium']}] },
        { id: 'extras', title: 'Аксессуары', type: 'multiple', options: [{id: 'grill', name: 'Решетка-гриль', price: 5000, allowedTiers: ['standard', 'premium']}, {id: 'poker', name: 'Набор кочерга/совок', price: 3000, allowedTiers: ['standard', 'premium']}]}
    ]
  },
  
  // === МАНГАЛЫ ===
  mangal: {
      basePrice: 15000,
      groups: [
          { id: 'steel', title: 'Толщина стали', type: 'single', options: [{id: '3mm', name: '3мм', price: 0, allowedTiers: ['standard', 'premium']}, {id: '5mm', name: '5мм (Усиленная)', price: 10000, allowedTiers: ['premium']}] },
          { id: 'roof', title: 'Крыша', type: 'single', options: [{id: 'no', name: 'Без крыши', price: 0, allowedTiers: ['standard', 'premium']}, {id: 'yes', name: 'С крышей', price: 25000, allowedTiers: ['standard', 'premium']}] },
          { id: 'extras', title: 'Допы', type: 'multiple', options: [{id: 'kazan', name: 'Казан 12л', price: 4500, allowedTiers: ['standard', 'premium']}, {id: 'poker', name: 'Кочерга', price: 1000, allowedTiers: ['standard', 'premium']}]}
      ]
  },
  
  // === КАЧЕЛИ ===
  swing: {
      basePrice: 35000,
      groups: [
          { id: 'frame', title: 'Каркас', type: 'single', options: [{id: 'wood', name: 'Дерево', price: 0, allowedTiers: ['standard', 'premium']}, {id: 'metal', name: 'Кованый металл', price: 15000, allowedTiers: ['premium']}] },
          { id: 'roof', title: 'Навес', type: 'single', options: [{id: 'fabric', name: 'Ткань', price: 0, allowedTiers: ['standard', 'premium']}, {id: 'wood', name: 'Деревянная крыша', price: 15000, allowedTiers: ['premium']}] },
          { id: 'extras', title: 'Комфорт', type: 'multiple', options: [{id: 'pillows', name: 'Мягкие подушки', price: 5000, allowedTiers: ['standard', 'premium']}, {id: 'mosq', name: 'Сетка', price: 3000, allowedTiers: ['standard', 'premium']}]}
      ]
  }
};

// ==========================================
// 4. ПРЕСЕТЫ (БЫСТРЫЕ КОНФИГУРАЦИИ)
// ==========================================
export const configPresets = {
  tub: {
    standard: {
      name: "Сибирский Стандарт", priceStart: 175000, features: ["Сталь 304", "4-6 чел.", "Внешняя печь"],
      defaultOptions: { size: 'medium', material: 'steel_304', finish: 'cedar', stove: 'external', extras: ['lid', 'stairs_podium'] }
    },
    premium: {
      name: "Алтайский Люкс", priceStart: 350000, features: ["Сталь 316", "Рубашка", "Аэромассаж"],
      defaultOptions: { size: 'large', material: 'steel_316', finish: 'larch_burned', stove: 'jacket', extras: ['aero', 'lid', 'light', 'chrome', 'insulation'] }
    }
  },
  sauna: {
    standard: {
      name: "Баня-Бочка 4м", priceStart: 310000, features: ["Длина 4 метра", "Ель", "Печь Стандарт"],
      defaultOptions: { shape: 'round', length: '4m', wood: 'spruce', stove: 'std', extras: ['glass_door'] }
    },
    premium: {
      name: "Квадро-Мега 6м", priceStart: 650000, features: ["Квадро форма", "Кедр", "Печь Harvia", "Панорама"],
      defaultOptions: { shape: 'quadro', length: '6m', wood: 'cedar', stove: 'harvia', extras: ['panorama', 'shower', 'starry_sky'] }
    }
  },
  default: {
    standard: { name: "Стандарт", priceStart: 0, features: [], defaultOptions: {} },
    premium: { name: "Премиум", priceStart: 0, features: [], defaultOptions: {} }
  }
};
// ==========================================
// 5. ПОЛНЫЙ СПИСОК ТОВАРОВ (ЦЕНЫ СИНХРОНИЗИРОВАНЫ)
// ==========================================
const rawProducts = [
  // --- ЧАНЫ ---
  { 
      id: 101, category: 'tub', name: 'Чан "Алтай" (Малый)', price: 95000, tier: 'standard',
      image: '/images/chan.jpg', description: 'Компактный чан на 2-4 человека. Идеальный старт.',
      defaultConfig: { size: 'small', material: 'steel_304', finish: 'cedar', stove: 'simple', extras: ['shelf'] } 
  },
  { 
      id: 102, category: 'tub', name: 'Чан "Байкал" (Средний)', price: 130000, tier: 'standard',
      image: 'https://termal-istochnik.ru/wp-content/uploads/2020/03/chan-na-travax.jpg', description: 'Классический чан на 4-6 человек. Хит продаж.', isHit: true,
      defaultConfig: { size: 'medium', material: 'steel_304', finish: 'cedar', stove: 'external', extras: ['lid', 'stairs_podium'] }
  },
  { 
      id: 103, category: 'tub', name: 'Чан "Эльбрус" (Большой)', price: 160000, tier: 'standard',
      image: 'https://spb.polimer-resurs.ru/wp-content/uploads/2022/11/bannyj-chan-na-podstavke-s-pechyu-i-lestniczej-vosmigrannyj-srednij-nerzhaveyushhaya-stal-aisi-430-s-otdelkoj-iz-listvenniczy-kupit-v-sankt-peterburge.jpg', description: 'Огромный чан для компании до 8 человек.',
      defaultConfig: { size: 'large', material: 'steel_304', finish: 'larch', stove: 'external', extras: ['lid', 'stairs_podium', 'chimney_protection'] }
  },
  { 
      id: 105, category: 'tub', name: 'Чан Подвесной "Лесной"', price: 130000, tier: 'standard',
      image: 'https://zavod-t.ru/upload/iblock/c3c/c3cd585255474d284f67623589b2512f.jpg', description: 'Эффектный подвесной чан на треноге.',
      defaultConfig: { size: 'medium', stove: 'simple' }
  },
  { 
      // ПРЕМИУМ: Сразу включены дорогие опции (Chrome, Утепление, Аэромассаж)
      id: 106, category: 'tub', name: 'Чан Premium с Джакузи', price: 350000, tier: 'premium',
      image: 'https://bani-bochki.ru/wp-content/uploads/2023/04/kvadro-banya-bochka-6-metrov-s-bokovym-vhodom-kedr-1.jpg', description: 'Максимальная комплектация: гидромассаж, LED, Chrome-пакет.', isHit: true,
      defaultConfig: { size: 'large', material: 'steel_316', finish: 'larch_burned', stove: 'jacket', extras: ['aero', 'lid', 'light', 'chrome', 'insulation', 'audio'] }
  },
  { 
      // ПРЕМИУМ: Гранд размер
      id: 107, category: 'tub', name: 'Чан Grand (10 чел)', price: 420000, tier: 'premium',
      image: 'https://img.inmyroom.ru/inmyroom/thumb/620x398/jpg:85/uploads/food_post/poster/67/6792/jpg_1000.jpg', description: 'Самый большой чан в линейке для мероприятий.',
      defaultConfig: { size: 'giant', material: 'steel_316', finish: 'oak', stove: 'jacket', extras: ['stairs_podium', 'lid'] }
  },

  // --- БАНИ ---
  { 
      id: 601, category: 'sauna', name: 'Баня-Бочка 4м', price: 280000, tier: 'standard',
      image: 'https://bani-bochki.ru/wp-content/uploads/2023/04/kvadro-banya-bochka-6-metrov-s-bokovym-vhodom-kedr-1.jpg', description: 'Компактная баня: парная и предбанник.', isHit: true,
      defaultConfig: { shape: 'round', length: '4m', wood: 'spruce', stove: 'std', extras: ['glass_door'] }
  },
  { 
      id: 602, category: 'sauna', name: 'Квадро-Баня 6м', price: 410000, tier: 'standard',
      image: 'https://bani-bochki.ru/wp-content/uploads/2023/04/kvadro-banya-bochka-6-metrov-s-bokovym-vhodom-kedr-1.jpg', description: 'Просторная баня с комнатой отдыха.',
      defaultConfig: { shape: 'quadro', length: '6m', wood: 'cedar', stove: 'harvia', extras: ['glass_door', 'steps'] }
  },
  { 
      // ПРЕМИУМ: Сразу с панорамой и звездным небом
      id: 603, category: 'sauna', name: 'Баня "Викинг"', price: 530000, tier: 'premium',
      image: 'https://sk-edem.ru/wp-content/uploads/2018/12/DSC04207.jpg', description: 'Высокие потолки, скандинавский стиль.',
      defaultConfig: { shape: 'quadro', length: '6m', wood: 'thermo', stove: 'cometa', extras: ['panorama', 'starry_sky', 'salt_wall', 'shower'] }
  },
  { 
      id: 605, category: 'sauna', name: 'Баня Овальная (Танк)', price: 340000, tier: 'premium',
      image: 'https://bani-bochki.ru/wp-content/uploads/2023/04/kvadro-banya-bochka-6-metrov-s-bokovym-vhodom-kedr-1.jpg', description: 'Увеличенная ширина 2.4м. Вход сбоку.',
      defaultConfig: { shape: 'oval', length: '4m', wood: 'cedar', stove: 'harvia', extras: ['glass_door'] }
  },

  // --- БЕСЕДКИ ---
  { id: 401, category: 'gazebo', name: 'Беседка "Панорама"', price: 330000, tier: 'premium', image: 'https://besedki-msk.ru/image/catalog/besedki/derevyannye/zakrytye/b-z-46/besedka_iz_brusa_zakrytaya_4x4_kupit_nedorogo_pod_klyuch_moskva_oblast.jpg', description: 'Закрытая теплая беседка.', defaultConfig: { size: '4x6', type: 'glass', extras: ['bbq', 'floor_ins'] } },
  { id: 402, category: 'gazebo', name: 'Беседка "Шале"', price: 150000, tier: 'standard', image: 'https://sk-edem.ru/wp-content/uploads/2018/12/DSC04207.jpg', description: 'Открытая беседка.', defaultConfig: { size: '3x3', type: 'open', extras: ['furniture'] } },
  { id: 403, category: 'gazebo', name: 'Гриль-Домик', price: 270000, tier: 'standard', image: 'https://besedki-msk.ru/image/catalog/besedki/derevyannye/zakrytye/b-z-46/besedka_iz_brusa_zakrytaya_4x4_kupit_nedorogo_pod_klyuch_moskva_oblast.jpg', description: 'Финский домик с очагом.', defaultConfig: { size: '3x4', type: 'soft', extras: ['bbq'] } },

  // --- КУПЕЛИ ---
  { id: 201, category: 'plunge', name: 'Купель Овальная', price: 55000, tier: 'standard', image: 'https://avatars.mds.yandex.net/get-mpic/5235948/img_id3369651528628285513.jpeg/orig', description: 'Классическая.', defaultConfig: { form: 'oval', insert: 'none' } },
  { id: 203, category: 'plunge', name: 'Купель с Печкой', price: 120000, tier: 'standard', image: 'https://files.stroyinf.ru/Data2/1/4293751/4293751590.jpg', description: 'Уличная с подогревом.', defaultConfig: { form: 'round', heat: 'external', extras: ['lid', 'ladder'] } },
  { id: 205, category: 'plunge', name: 'Купель SPA Elite', price: 185000, tier: 'premium', image: 'https://pool-in.ru/wp-content/uploads/2019/06/kupel-kompozitnaya-kruglaia-1.jpg', description: 'С аэромассажем.', defaultConfig: { form: 'round', insert: 'plastic', heat: 'external', extras: ['jacuzzi', 'lid'] } },

  // --- КАМИНЫ ---
  { id: 301, category: 'fireplace', name: 'Очаг "Сфера Огня"', price: 45000, tier: 'premium', image: 'https://static.tildacdn.com/tild3737-6462-4363-a238-306164623164/50537380126297296316.jpg', description: 'Дизайнерский очаг.', defaultConfig: { fuel: 'wood', material: 'corten' } },
  { id: 304, category: 'fireplace', name: 'Газовый Камин "Стол"', price: 120000, tier: 'premium', image: 'https://static.insales-cdn.com/images/products/1/6024/225660808/elbrus_1.jpg', description: 'Огонь без дыма.', defaultConfig: { fuel: 'bio', material: 'steel' } },

  // --- ТЕПЛИЦЫ ---
  { id: 501, category: 'greenhouse', name: 'Теплица "Английская"', price: 120000, tier: 'premium', image: 'https://teplicy-pavlovo.ru/wp-content/uploads/2016/03/Lyuks-4.jpg', description: 'Викторианский стиль.', defaultConfig: { frame: 'alum', glass: 'glass', extras: ['autovent'] } },
  { id: 502, category: 'greenhouse', name: 'Теплица "Дачная"', price: 45000, tier: 'standard', image: 'https://teplicy-pavlovo.ru/wp-content/uploads/2016/03/Lyuks-4.jpg', description: 'Простая и надежная.', defaultConfig: { frame: 'steel', glass: 'poly' } },

  // --- БАССЕЙНЫ ---
  { id: 701, category: 'pool', name: 'Бассейн Композитный', price: 850000, tier: 'premium', image: 'https://spb.pro-basseyn.ru/wp-content/uploads/2021/04/kompozitnyj-bassejn-marsel.jpg', description: 'Чаша 6 метров.', defaultConfig: { type: 'comp', equip: ['filter', 'heat', 'light'] } },
  { id: 702, category: 'pool', name: 'Бассейн Каркасный', price: 150000, tier: 'standard', image: 'https://polimer-s-spb.ru/wp-content/uploads/2021/04/kupel-uglovaya-1.jpg', description: 'Морозостойкий.', defaultConfig: { type: 'frame', equip: ['filter'] } },

  // --- МАНГАЛЫ ---
  { id: 801, category: 'mangal', name: 'Мангальная Зона Loft', price: 140000, tier: 'premium', image: 'https://static.insales-cdn.com/images/products/1/6024/225660808/elbrus_1.jpg', description: 'Комплекс.', defaultConfig: { steel: '5mm', roof: 'yes', extras: ['kazan'] } },
  { id: 802, category: 'mangal', name: 'Мангал-Сундук', price: 25000, tier: 'standard', image: 'https://mangal-store.ru/wa-data/public/shop/products/32/08/832/images/4255/4255.970.jpg', description: 'Кованый.', defaultConfig: { steel: '3mm' } },

  // --- КАЧЕЛИ ---
  { id: 901, category: 'swing', name: 'Качели "Прованс"', price: 65000, tier: 'premium', image: 'https://kacheli-kovka.ru/wp-content/uploads/2020/02/elitnye-kacheli-provans-premium-shokolad-b.jpg', description: 'Кованые.', defaultConfig: { frame: 'metal', roof: 'fabric', extras: ['pillows'] } },
  { id: 906, category: 'swing', name: 'Гамак с Каркасом', price: 35000, tier: 'standard', image: 'https://pm.ru/upload/iblock/a87/30006760000_1.jpg', description: 'Деревянная дуга.', defaultConfig: { frame: 'wood' } },
];

// --- 6. ГЕНЕРАЦИЯ ЭКСПОРТА ---
export const products = rawProducts.map(p => {
  const details = DETAILS_TEMPLATE[p.category] || DETAILS_TEMPLATE.default;
  // Явное определение премиума
  const isPremium = p.tier === 'premium' || p.price > 300000;

  return {
      ...p,
      isPremium,
      tier: p.tier || (isPremium ? 'premium' : 'standard'), 
      details: {
          ...details,
          fullDescription: `${p.description} Мы используем только проверенные материалы и современные технологии.`,
          categoryName: categoryNames[p.category]
      }
  };
});