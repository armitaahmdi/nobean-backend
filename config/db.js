require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_NAME, // SQLite database file path
  logging: false, // Disable logging for cleaner output
  define: {
    freezeTableName: true,
    underscored: false
  },
  dialectOptions: {
    // SQLite specific options
  }
});

module.exports = sequelize;