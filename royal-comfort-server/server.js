/**
 * Main application entry point.
 * Initializes the Express web server, connects to the SQLite database,
 * and launches the Telegram bot for administrative notifications.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database'); 
const apiRoutes = require('./src/routes/api');
const { launchBot } = require('./src/services/telegramBot');

const app = express();

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());

// --- Routes Setup ---
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

/**
 * Initializes the application:
 * 1. Synchronizes the database models (SQLite).
 * 2. Starts the Express web server.
 * 3. Launches the Telegram bot service.
 */
async function startApplication() {
  try {
    // 1. Sync Database
    await sequelize.sync({ alter: true });
    console.log('✅ База данных синхронизирована (SQLite)');
    
    // 2. Start Web Server
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
    });

    // 3. Start Telegram Bot
    console.log('⏳ Запускаем Telegram бота...');
    launchBot(); 
  } catch (err) {
    console.error('❌ Ошибка инициализации приложения:', err);
  }
}

startApplication();