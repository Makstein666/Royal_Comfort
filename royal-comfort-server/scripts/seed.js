/**
 * Скрипт заполнения БД начальными данными каталога.
 * Запуск: node scripts/seed.js
 * Безопасен для повторного запуска (upsert).
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('../src/config/database');
const { Category, ConfigGroup, ConfigOption } = require('../src/models');

const CATEGORIES = [
  {
    id: 'tub', name: 'Банные чаны', sortOrder: 1, isActive: true,
    basePrice: 95000, discountPercent: 0,
    description: 'Флагманское направление. Собственное производство из кедра и нержавеющей стали.',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=800'
  },
  {
    id: 'kupel', name: 'Купели', sortOrder: 2, isActive: false,
    basePrice: 45000, discountPercent: 0,
    description: 'Деревянные и стальные купели для закаливания и релаксации.',
    image: 'https://images.unsplash.com/photo-1595346515610-6b9e49a7b0b4?q=80&w=800'
  },
  {
    id: 'kamin', name: 'Камины', sortOrder: 3, isActive: false,
    basePrice: 120000, discountPercent: 0,
    description: 'Дровяные и газовые камины для дома и беседок.',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800'
  },
  {
    id: 'gazebo', name: 'Беседки', sortOrder: 4, isActive: false,
    basePrice: 150000, discountPercent: 0,
    description: 'Беседки и гриль-зоны под ваш ландшафт.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800'
  },
  {
    id: 'teplitsa', name: 'Теплицы', sortOrder: 5, isActive: false,
    basePrice: 35000, discountPercent: 0,
    description: 'Стальные и поликарбонатные теплицы различных размеров.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800'
  },
  {
    id: 'sauna', name: 'Бани', sortOrder: 6, isActive: false,
    basePrice: 350000, discountPercent: 0,
    description: 'Бревенчатые и каркасные бани под ключ.',
    image: 'https://images.unsplash.com/photo-1595345763945-3f33878e474d?q=80&w=800'
  },
  {
    id: 'pool', name: 'Бассейны', sortOrder: 7, isActive: false,
    basePrice: 500000, discountPercent: 0,
    description: 'Каркасные, вкопанные и композитные бассейны.',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=800'
  },
  {
    id: 'mangal', name: 'Мангалы', sortOrder: 8, isActive: false,
    basePrice: 15000, discountPercent: 0,
    description: 'Стационарные и переносные мангалы из металла и кирпича.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800'
  },
  {
    id: 'kacheli', name: 'Качели', sortOrder: 9, isActive: false,
    basePrice: 25000, discountPercent: 0,
    description: 'Садовые качели и качели-диваны для отдыха на даче.',
    image: 'https://images.unsplash.com/photo-1503525148566-ef5c2b9c93bd?q=80&w=800'
  },
  {
    id: 'custom', name: 'Индивидуальный проект', sortOrder: 10, isActive: true,
    basePrice: 0, discountPercent: 0,
    description: 'Не нашли подходящего? Опишите свой проект — мы воплотим любую идею.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800'
  }
];

const TUB_GROUPS = [
  {
    id: 'tub_size', categoryId: 'tub', title: 'Размер чаши', sortOrder: 1,
    options: [
      { id: 'tub_size_small',  name: 'Малый (2-4 чел)',   price: 0,      sortOrder: 1 },
      { id: 'tub_size_medium', name: 'Средний (4-6 чел)', price: 35000,  sortOrder: 2 },
      { id: 'tub_size_large',  name: 'Большой (6-8 чел)', price: 65000,  sortOrder: 3 },
      { id: 'tub_size_giant',  name: 'Гигант (10+ чел)',  price: 120000, sortOrder: 4 },
    ]
  },
  {
    id: 'tub_material', categoryId: 'tub', title: 'Материал чаши', sortOrder: 2,
    options: [
      { id: 'tub_material_food_steel',    name: 'Сталь AISI 304 (Пищевая)', price: 0,     sortOrder: 1 },
      { id: 'tub_material_premium_steel', name: 'Сталь AISI 316 (Премиум)', price: 45000, sortOrder: 2 },
    ]
  },
  {
    id: 'tub_wood', categoryId: 'tub', title: 'Отделка деревом', sortOrder: 3,
    options: [
      { id: 'tub_wood_larch', name: 'Лиственница',    price: 0,     sortOrder: 1 },
      { id: 'tub_wood_cedar', name: 'Алтайский кедр', price: 25000, sortOrder: 2 },
      { id: 'tub_wood_oak',   name: 'Мореный дуб',    price: 55000, sortOrder: 3 },
    ]
  },
  {
    id: 'tub_stove', categoryId: 'tub', title: 'Печь', sortOrder: 4,
    options: [
      { id: 'tub_stove_simple',     name: 'Простая (внешняя)',                    price: 0,     sortOrder: 1 },
      { id: 'tub_stove_integrated', name: 'Интегрированная (с водяной рубашкой)', price: 45000, sortOrder: 2 },
    ]
  }
];

async function seed() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ БД синхронизирована');

    for (const cat of CATEGORIES) {
      await Category.upsert(cat);
    }
    console.log(`✅ Категорий: ${CATEGORIES.length}`);

    for (const group of TUB_GROUPS) {
      const { options, ...groupData } = group;
      await ConfigGroup.upsert(groupData);
      for (const opt of options) {
        await ConfigOption.upsert({ ...opt, groupId: group.id });
      }
    }
    console.log(`✅ Групп конфигуратора: ${TUB_GROUPS.length}`);
    console.log('🎉 Seed завершён!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка seed:', err);
    process.exit(1);
  }
}

seed();