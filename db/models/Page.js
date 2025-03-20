const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Page = sequelize.define('Page', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  lastModified: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Page; 