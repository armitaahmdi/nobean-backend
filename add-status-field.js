const sequelize = require('./config/db');
const { QueryTypes } = require('sequelize');

async function addStatusField() {
  try {
    console.log('🔄 شروع اضافه کردن فیلد status به جدول exams...');
    
    // تست اتصال
    await sequelize.authenticate();
    console.log('✅ اتصال به دیتابیس برقرار شد');
    
    // بررسی وجود فیلد status
    const results = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'exams' 
      AND COLUMN_NAME = 'status'
    `, { type: QueryTypes.SELECT });
    
    if (results.length > 0) {
      console.log('⚠️ فیلد status قبلاً وجود دارد');
      return;
    }
    
    // اضافه کردن فیلد status
    await sequelize.query(`
      ALTER TABLE exams 
      ADD COLUMN status ENUM('draft', 'active', 'inactive') 
      NOT NULL DEFAULT 'draft' 
      COMMENT 'Test status: draft, active, inactive'
    `);
    
    console.log('✅ فیلد status با موفقیت اضافه شد');
    
    // به‌روزرسانی آزمون‌های موجود به وضعیت active
    const [updateResults] = await sequelize.query(`
      UPDATE exams 
      SET status = 'active' 
      WHERE status = 'draft' 
      AND question_count > 0
    `);
    
    console.log(`✅ ${updateResults.affectedRows} آزمون به وضعیت active تغییر یافت`);
    
    // نمایش آمار نهایی
    const stats = await sequelize.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM exams 
      GROUP BY status
    `, { type: QueryTypes.SELECT });
    
    console.log('📊 آمار وضعیت آزمون‌ها:');
    if (stats && stats.length > 0) {
      stats.forEach(stat => {
        const statusText = stat.status === 'active' ? 'فعال' : 
                          stat.status === 'draft' ? 'پیش‌نویس' : 'غیرفعال';
        console.log(`   ${statusText}: ${stat.count} آزمون`);
      });
    } else {
      console.log('   هیچ آزمونی یافت نشد');
    }
    
    console.log('🎉 Migration با موفقیت انجام شد!');
    
  } catch (error) {
    console.error('❌ خطا در migration:', error);
  } finally {
    await sequelize.close();
  }
}

// اجرای migration
addStatusField();
