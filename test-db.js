const sequelize = require('./config/db');

sequelize.authenticate()
  .then(() => console.log('✅ Database connection works!'))
  .catch(err => console.error('❌ Database connection failed:', err));
