/**
 * ПОЛНЫЙ скрипт заполнения БД: 10 категорий + 4 товара + детальный конфигуратор чанов.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const { Category, ConfigGroup, ConfigOption, Product } = require('../src/models');

const CATEGORIES = [
  {
    id: 'tub', name: 'Банные чаны', sortOrder: 1, isActive: true, basePrice: 100000,
    description: 'Флагманское направление. Кедр, лиственница и пищевая нержавеющая сталь.',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1200'
  },
  {
    id: 'sauna', name: 'Бани и сауны', sortOrder: 2, isActive: false,
    description: 'Индивидуальное проектирование и строительство бань под ключ.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200'
  },
  {
    id: 'mangal', name: 'Мангальные зоны', sortOrder: 3, isActive: false,
    description: 'Премиальные мангалы и обустройство зон барбекю.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200'
  },
  {
    id: 'gazebo', name: 'Беседки', sortOrder: 4, isActive: false,
    description: 'Уютные беседки из массива дерева.',
    image: 'https://images.unsplash.com/photo-1590073844006-3a44a7f3ef95?q=80&w=1200'
  },
  {
    id: 'kupel', name: 'Купели', sortOrder: 5, isActive: false,
    description: 'Классические купели для закаливания.',
    image: 'https://images.unsplash.com/photo-1517036083033-93663673327d?q=80&w=1200'
  },
  {
    id: 'fireplace', name: 'Камины', sortOrder: 6, isActive: false,
    description: 'Уличные и интерьерные камины.',
    image: 'https://images.unsplash.com/photo-1577456170107-5050355fc570?q=80&w=1200'
  },
  {
    id: 'swing', name: 'Качели', sortOrder: 7, isActive: false,
    description: 'Садовые качели премиум-класса.',
    image: 'https://images.unsplash.com/photo-1581446702206-8be956894002?q=80&w=1200'
  },
  {
    id: 'greenhouse', name: 'Теплицы', sortOrder: 8, isActive: false,
    description: 'Профессиональные теплицы с усиленным каркасом.',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1200'
  },
  {
    id: 'pool', name: 'Бассейны', sortOrder: 9, isActive: false,
    description: 'Строительство и обслуживание бассейнов.',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1200'
  },
  {
    // Нет фото — карточка стилизована отдельно в Catalog.jsx как тёмный блок
    id: 'custom', name: 'Индивидуальный проект', sortOrder: 10, isActive: false,
    description: 'Реализация ваших самых смелых идей.',
    image: null
  }
];

const TUB_GROUPS = [
  {
    id: 'tub_size', categoryId: 'tub', title: 'Размер и вместимость', sortOrder: 1,
    description: 'Выберите диаметр чаши в зависимости от количества человек.',
    options: [
      { id: 'size_d170', name: 'D170 — до 4 чел.', price: 0,     sortOrder: 1, description: 'Компактный. Быстро нагревается.' },
      { id: 'size_d205', name: 'D205 — до 6 чел.', price: 10000,  sortOrder: 2, description: 'Самый популярный.' },
      { id: 'size_d230', name: 'D230 — до 9 чел.', price: 32000,  sortOrder: 3, description: 'Для большой компании.' },
      { id: 'size_d240', name: 'D240 — до 12 чел.', price: 62000, sortOrder: 4, description: 'Флагман. Максимум комфорта.' }
    ]
  },
  {
    id: 'tub_material', categoryId: 'tub', title: 'Материал чаши', sortOrder: 2,
    description: 'Используем только сертифицированную нержавеющую сталь.',
    options: [
      { id: 'mat_430', name: 'Сталь AISI 430', price: 0,     sortOrder: 1, description: 'Техническая нержавейка. Оптимально по цене.' },
      { id: 'mat_304', name: 'Сталь AISI 304', price: 25000, sortOrder: 2, description: 'Пищевая нержавейка. Максимальная долговечность.' }
    ]
  },
  {
    id: 'tub_heating', categoryId: 'tub', title: 'Тип нагрева', sortOrder: 3,
    description: 'Классический костер или эффективный водяной контур.',
    options: [
      { id: 'heat_stat',  name: 'Стационарный (костёр)', price: 0,     sortOrder: 1, image: '/images/products/11.jpg', description: 'Печь вварена в дно чаши.' },
      { id: 'heat_water', name: 'Водяная рубашка (печь)', price: 50000, sortOrder: 2, image: '/images/products/5.jpg',  description: 'Отдельная печь с теплообменником. Более чистое горение.' }
    ]
  },
  {
    id: 'tub_ladder', categoryId: 'tub', title: 'Лестница', sortOrder: 4,
    description: 'Удобный вход в чан.',
    options: [
      { id: 'lad_none',  name: 'Без лестницы',      price: 0,     sortOrder: 1 },
      { id: 'lad_metal', name: 'С подиумом (металл)', price: 11000, sortOrder: 2, image: '/images/products/13.jpg', description: 'Лестница с широким подиумом из металлокаркаса.' },
      { id: 'lad_lean',  name: 'Приставная',         price: 7000,  sortOrder: 3, description: 'Простая приставная лестница.' }
    ]
  },
  {
    id: 'tub_cover', categoryId: 'tub', title: 'Крышка', sortOrder: 5,
    description: 'Сохраняет тепло и защищает от мусора.',
    options: [
      { id: 'cov_none', name: 'Без крышки',        price: 0,     sortOrder: 1 },
      { id: 'cov_hard', name: 'Жёсткая термокрышка', price: 15000, sortOrder: 2, image: '/images/products/2.jpg', description: 'Утеплённая жёсткая крышка. Потери тепла минимальны.' }
    ]
  },
  {
    id: 'tub_extras', categoryId: 'tub', title: 'Дополнительно', sortOrder: 6,
    description: 'Аксессуары для комфортного отдыха.',
    options: [
      { id: 'ext_none',   name: 'Ничего',              price: 0,    sortOrder: 1 },
      { id: 'ext_table',  name: 'Центральный столик',  price: 9000, sortOrder: 2, image: '/images/products/1.jpg',  description: 'Съёмный столик на центральной опоре.' },
      { id: 'ext_paddle', name: 'Весло (лиственница)', price: 3000, sortOrder: 3, image: '/images/products/3.jpg',  description: 'Деревянное весло для перемешивания воды.' }
    ]
  }
];

const PRODUCTS = [
  {
    id: 1, categoryId: 'tub', name: 'Чан "Компакт" (D170)', price: 100000,
    description: 'Идеальное решение для небольших участков и уютных вечеров в кругу семьи. Быстро нагревается и экономит место.',
    image: '/images/products/11.jpg',
    isFeatured: true, isActive: true,
    features: JSON.stringify(['Быстрый нагрев', 'Экономия дров', 'Лёгкая установка']),
    specs: JSON.stringify([
      { label: 'Вместимость',    value: '2–4 человека'  },
      { label: 'Диаметр чаши',  value: '1700 мм'        },
      { label: 'Глубина чаши',  value: '900 мм'         },
      { label: 'Толщина стали', value: '2 / 3 мм'       },
      { label: 'Время нагрева', value: '1.5 – 2 часа'   }
    ]),
    defaultConfig: JSON.stringify({ tub_size: 'size_d170', tub_material: 'mat_430', tub_heating: 'heat_stat' })
  },
  {
    id: 2, categoryId: 'tub', name: 'Чан "Семейный" (D205)', price: 110000,
    description: 'Самый популярный выбор. Обеспечивает комфортное размещение до 6 человек. Оптимальное соотношение цены и пространства для загородного дома.',
    image: '/images/products/5.jpg',
    isFeatured: true, isActive: true,
    features: JSON.stringify(['Оптимальный размер', 'Глубокая посадка', 'Классический дизайн']),
    specs: JSON.stringify([
      { label: 'Вместимость',    value: '4–6 человек'  },
      { label: 'Диаметр чаши',  value: '2050 мм'       },
      { label: 'Глубина чаши',  value: '1000 мм'       },
      { label: 'Толщина стали', value: '2 / 3 мм'      },
      { label: 'Время нагрева', value: '2 – 2.5 часа'  }
    ]),
    defaultConfig: JSON.stringify({ tub_size: 'size_d205', tub_material: 'mat_430', tub_heating: 'heat_stat' })
  },
  {
    id: 3, categoryId: 'tub', name: 'Чан "Для компании" (D230)', price: 132000,
    description: 'Просторный чан для больших компаний. Глубокая чаша и широкие сиденья для максимального релакса и долгих разговоров под открытым небом.',
    image: '/images/products/6.jpg',
    isFeatured: false, isActive: true,
    features: JSON.stringify(['Большой объём', 'Усиленный каркас', 'Люкс-комфорт']),
    specs: JSON.stringify([
      { label: 'Вместимость',    value: '6–9 человек'  },
      { label: 'Диаметр чаши',  value: '2300 мм'       },
      { label: 'Глубина чаши',  value: '1100 мм'       },
      { label: 'Толщина стали', value: '3 мм'           },
      { label: 'Время нагрева', value: '2.5 – 3 часа'  }
    ]),
    defaultConfig: JSON.stringify({ tub_size: 'size_d230', tub_material: 'mat_430', tub_heating: 'heat_stat' })
  },
  {
    id: 4, categoryId: 'tub', name: 'Чан "Банкетный" (D240)', price: 162000,
    description: 'Флагманская модель для тех, кто не привык к компромиссам. Максимальный объём для коммерческого использования (турбазы, отели) или больших торжеств.',
    image: '/images/products/7.jpg',
    isFeatured: false, isActive: true,
    features: JSON.stringify(['Максимальная чаша', 'Коммерческая надёжность', 'Статус']),
    specs: JSON.stringify([
      { label: 'Вместимость',    value: '9–12 человек'  },
      { label: 'Диаметр чаши',  value: '2400 мм'        },
      { label: 'Глубина чаши',  value: '1200 мм'        },
      { label: 'Толщина стали', value: '3 / 4 мм'       },
      { label: 'Время нагрева', value: '3 – 4 часа'     }
    ]),
    defaultConfig: JSON.stringify({ tub_size: 'size_d240', tub_material: 'mat_430', tub_heating: 'heat_stat' })
  }
];

async function seed() {
  try {
    await sequelize.sync({ force: true });

    for (const cat of CATEGORIES) await Category.create(cat);

    for (const group of TUB_GROUPS) {
      const { options, ...groupData } = group;
      await ConfigGroup.create(groupData);
      for (const opt of options) await ConfigOption.create({ ...opt, groupId: group.id });
    }

    for (const prod of PRODUCTS) await Product.create(prod);

    console.log(`✅ Категорий: ${CATEGORIES.length}`);
    console.log(`✅ Групп конфигуратора: ${TUB_GROUPS.length}`);
    console.log(`✅ Товаров: ${PRODUCTS.length}`);
    console.log('🎉 База данных полностью восстановлена!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка:', err);
    process.exit(1);
  }
}

seed();