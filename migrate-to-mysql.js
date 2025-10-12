const db = require('./src/model');
const sequelize = require('./config/db');

async function migrateToMySQL() {
  try {
    console.log('🔄 شروع مهاجرت به MySQL...');
    
    // تست اتصال
    await sequelize.authenticate();
    console.log('✅ اتصال به MySQL برقرار شد');
    
    // همگام‌سازی مدل‌ها (ایجاد جداول)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ جداول در MySQL ایجاد/به‌روزرسانی شدند');
    
    console.log('🎉 مهاجرت با موفقیت انجام شد!');
    
  } catch (error) {
    console.error('❌ خطا در مهاجرت:', error);
  } finally {
    await sequelize.close();
  }
}

// اجرای مهاجرت
migrateToMySQL();
