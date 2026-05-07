const { Review } = require('../src/models');
const sequelize = require('../src/config/database');

async function syncReviews() {
    try {
        await sequelize.authenticate();
        console.log('🔄 Пересоздаю таблицу отзывов...');
        await Review.sync({ force: true });
        console.log('✅ Таблица отзывов успешно пересоздана.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

syncReviews();
