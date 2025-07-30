
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nobean', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});


module.exports = sequelize