const sequelize = require('./config');
const Page = require('./models/Page');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully.');

    // Create default homepage
    await Page.create({
      slug: 'home',
      title: 'Welcome to our Website',
      content: '<h1>Welcome</h1><p>This is your homepage. Click edit to modify this content.</p>'
    });
    console.log('Default homepage created successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrate(); 