require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT,
  storage: process.env.DB_NAME, // SQLite database file path
  logging: false // Disable logging for cleaner output
});

module.exports = sequelize;