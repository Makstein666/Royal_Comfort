const { Category, ConfigGroup, ConfigOption, Product, Review } = require('./src/models');
const sequelize = require('./src/config/database');

async function inspect() {
    try {
        await sequelize.authenticate();
        console.log('--- CATEGORIES ---');
        const categories = await Category.findAll();
        categories.forEach(c => console.log(`${c.id}: ${c.name} (isActive: ${c.isActive})`));
        console.log(`Total categories: ${categories.length}`);

        console.log('\n--- CONFIG GROUPS ---');
        const groups = await ConfigGroup.findAll();
        groups.forEach(g => console.log(`${g.id}: ${g.title} (categoryId: ${g.categoryId})`));
        console.log(`Total groups: ${groups.length}`);

        console.log('\n--- CONFIG OPTIONS ---');
        const options = await ConfigOption.findAll();
        options.forEach(o => console.log(`${o.id}: ${o.name} (groupId: ${o.groupId}, price: ${o.price})`));
        console.log(`Total options: ${options.length}`);

        console.log('\n--- REVIEWS ---');
        const reviews = await Review.findAll();
        console.log(`Total reviews: ${reviews.length}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
