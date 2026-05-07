# 🏰 Royal Comfort — Full-Stack Platform

> Премиальный интернет-магазин и CMS для производителя банных чанов, беседок и уличных объектов отдыха. Построен на **React + Node.js + SQLite + Telegram Bot**.

[![Node](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

---

## 📌 О проекте

**Royal Comfort** — это полноценный производственный веб-сайт с системой управления контентом через Telegram-бота. Платформа позволяет:

- Клиентам — просматривать каталог товаров, конфигурировать изделия, оставлять заявки и отзывы, отслеживать статус заказа
- Менеджерам — управлять всем контентом (товары, категории, промо, отзывы, заказы) через Telegram без доступа к коду

---

## 🗂️ Структура проекта

```
royal-comfort-fullstack/
├── royal-comfort-client/        # React фронтенд (Vite + TailwindCSS)
│   ├── public/
│   │   ├── images/              # Локальные фото товаров
│   │   └── videos/              # Фоновое видео hero-секции
│   └── src/
│       ├── components/
│       │   ├── catalog/         # CategoryCard, ProductCard, SidebarFilters, ReviewsSection
│       │   ├── layout/          # Header, Footer, NavBar
│       │   └── modals/          # ConfiguratorModal, ProductDetailsModal,
│       │                        #   ReviewModal, ContactModal, CustomProjectModal
│       ├── context/
│       │   └── ConfiguratorContext.jsx   # Глобальный стейт: каталог, конфигуратор, заказы
│       └── pages/
│           ├── Home.jsx         # Главная (Hero, CategoryCarousel, Features, CTA)
│           ├── Catalog.jsx      # Страница каталога с фильтрами и сеткой категорий
│           └── Tracking.jsx     # Отслеживание заказа по номеру
│
└── royal-comfort-server/        # Node.js / Express бэкенд
    ├── scripts/
    │   ├── seed.js              # Заполнение БД: категории, товары, конфигуратор
    │   └── cleanup.js           # Очистка устаревших данных
    ├── src/
    │   ├── models/              # Sequelize модели (SQLite)
    │   │   ├── Category.js      # Категории (isActive — управляется через бота)
    │   │   ├── Product.js       # Товары с характеристиками
    │   │   ├── ConfigGroup.js   # Группы конфигуратора
    │   │   ├── ConfigOption.js  # Опции конфигуратора с ценами
    │   │   ├── Order.js         # Заказы и заявки (type: order/consultation/custom_project)
    │   │   ├── Review.js        # Отзывы клиентов
    │   │   └── Promo.js         # Промо-коды
    │   ├── controllers/
    │   │   ├── catalogController.js   # CRUD каталога
    │   │   └── ordersController.js    # Обработка заказов и заявок
    │   ├── routes/
    │   │   └── api.js           # REST API: /catalog, /orders, /reviews, /promos
    │   └── services/
    │       └── bot/             # Telegram Bot (Telegraf)
    │           ├── index.js     # Инициализация бота
    │           ├── handlers/    # admin, catalog, orders, reviews, promos
    │           ├── scenes/      # addProduct, addOption, addReview, addPromo
    │           ├── keyboards/   # Inline и reply клавиатуры
    │           └── utils/       # Форматирование, константы
    └── server.js                # Точка входа Express
```

---

## ✨ Ключевые функции

### Клиентская часть (Frontend)

| Раздел | Описание |
|--------|----------|
| **Главная страница** | Hero с видеофоном, карусель категорий, преимущества бренда, CTA секция |
| **Каталог** | Сетка категорий → список товаров → детальная карточка товара |
| **Логика категорий** | `isActive: true` → каталог товаров; `isActive: false` → модал консультации |
| **Конфигуратор** | Пошаговый выбор опций (размер, материал, нагрев, доп.), расчёт стоимости в реальном времени |
| **Индивидуальный проект** | Отдельный модал с формой: имя, телефон, описание, время звонка, фото-референсы |
| **Консультация** | Для неактивных категорий — модал с полем вопроса и записью на звонок |
| **Отзывы** | Секция отзывов с фильтрацией по категории, форма добавления |
| **Отслеживание заказа** | Страница `/tracking` — ввод номера → статус и детали |
| **Фильтры** | Поиск, фильтр по категории (заблокированные показаны с 🔒 и бейджем «Скоро»), диапазон цен |

### Серверная часть (Backend)

| Модуль | Описание |
|--------|----------|
| **REST API** | CRUD для категорий, товаров, конфигуратора, заказов, отзывов |
| **Telegram Bot CMS** | Полное управление контентом без деплоя — добавление товаров, опций, промокодов |
| **Управление категориями** | Бот активирует/деактивирует категории → моментально отражается на сайте |
| **Обработка заявок** | Типы: `order`, `consultation`, `custom_project`, `preorder` |
| **Система отзывов** | Добавление через бота с привязкой к категории и фото |
| **Промо-коды** | Создание и применение скидок через бота |
| **Резервные копии** | Автоматическое сохранение БД |

---

## 🏗️ Технический стек

| Слой | Технологии |
|------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion, Swiper |
| Backend | Node.js, Express.js, Sequelize ORM |
| База данных | SQLite (через better-sqlite3) |
| Telegram Bot | Telegraf.js (сцены, inline-клавиатуры) |
| Фото и медиа | Локальные файлы + Unsplash CDN |

---

## 🚀 Запуск проекта

### 1. Клонирование и установка зависимостей

```bash
git clone https://github.com/Makstein666/Royal_Comfort.git
cd Royal_Comfort

# Установка зависимостей сервера
cd royal-comfort-server
npm install

# Установка зависимостей клиента
cd ../royal-comfort-client
npm install
```

### 2. Настройка окружения

Создайте файл `royal-comfort-server/.env`:

```env
PORT=5000
TELEGRAM_BOT_TOKEN=ваш_токен_бота
ADMIN_CHAT_ID=ваш_chat_id
```

### 3. Инициализация базы данных

```bash
cd royal-comfort-server
node scripts/seed.js
```

### 4. Запуск

```bash
# В одном терминале — бэкенд
cd royal-comfort-server
npm start

# В другом терминале — фронтенд
cd royal-comfort-client
npm run dev
```

Сайт доступен на: **http://localhost:5173**  
API доступен на: **http://localhost:5000**

---

## 🤖 Telegram Bot — Команды

| Команда | Действие |
|---------|---------|
| `/start` | Главное меню бота |
| 📦 Товары | Добавить / редактировать / удалить товары |
| 🗂️ Категории | Активировать / деактивировать категории |
| ⚙️ Конфигуратор | Управление группами и опциями конфигуратора |
| 📋 Заказы | Просмотр и управление заявками |
| ⭐ Отзывы | Добавление отзывов от имени клиентов |
| 🎫 Промо | Создание и управление промо-кодами |
| 👥 Администраторы | Добавление новых менеджеров |

---

## 📐 Логика доступа к категориям

```
Клик на категорию в каталоге / на главной
          │
          ├── isActive: true  → Переход в каталог товаров
          │
          └── isActive: false → Модал консультации
                                «Задайте вопрос или опишите проект»
                                Отправляется как type: 'consultation'
```

**Активация категории через бота:**  
`Категории → [Название] → Включить` → `isActive: true` → категория сразу открывается на сайте.

---

## 📁 API Endpoints

```
GET    /api/catalog/categories          — Все категории
GET    /api/catalog/categories/:id      — Данные категории + конфигуратор
PUT    /api/catalog/categories/:id      — Обновить категорию (isActive и др.)
GET    /api/catalog/products            — Все товары
GET    /api/catalog/products/:id        — Товар + характеристики
POST   /api/catalog/products            — Создать товар
POST   /api/orders                      — Создать заявку/заказ
GET    /api/orders/:id                  — Статус заказа (для Tracking)
GET    /api/reviews                     — Отзывы (фильтр по categoryId)
POST   /api/reviews                     — Добавить отзыв
GET    /api/promos/:code                — Проверить промо-код
```

---

## 📸 Скриншоты

> Главная страница, каталог с фильтрами, конфигуратор, модал консультации, Telegram-бот.

---

## 👨‍💻 Автор

**Royal Comfort Platform**  
Разработано как дипломный проект — полноценный production-ready сайт для реального производителя.

---

*Лицензия: MIT*
