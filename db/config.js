require('dotenv').config();
const { Sequelize } = require('sequelize');

// Use Railway's injected DATABASE_URL
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