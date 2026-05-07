const { Category, ConfigGroup, ConfigOption, Product } = require('../src/models');
const sequelize = require('../src/config/database');

const VALID_IDS = ['tub', 'kupel', 'kamin', 'gazebo', 'teplitsa', 'sauna', 'pool', 'mangal', 'kacheli', 'custom'];

async function cleanup() {
    try {
        await sequelize.authenticate();
        console.log('🚀 Начинаю очистку базы данных...');

        const categories = await Category.findAll();
        for (const cat of categories) {
            if (!VALID_IDS.includes(cat.id)) {
                console.log(`🗑 Удаляю лишнюю категорию: ${cat.id} (${cat.name})`);
                
                // Удаляем связанные товары, группы и опции (хотя Sequelize должен был сделать это каскадно, если настроено, но сделаем явно для надежности)
                await Product.destroy({ where: { categoryId: cat.id } });
                
                const groups = await ConfigGroup.findAll({ where: { categoryId: cat.id } });
                for (const g of groups) {
                    await ConfigOption.destroy({ where: { groupId: g.id } });
                }
                await ConfigGroup.destroy({ where: { categoryId: cat.id } });
                
                await cat.destroy();
            }
        }

        console.log('✅ Очистка завершена. Осталось категорий:', await Category.count());
        process.exit(0);
    } catch (err) {
        console.error('❌ Ошибка при очистке:', err);
        process.exit(1);
    }
}

cleanup();
