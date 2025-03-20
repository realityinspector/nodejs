require('dotenv').config();
const { Sequelize } = require('sequelize');

// Verify that we have the required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false // Disable logging SQL queries
});

module.exports = sequelize; 