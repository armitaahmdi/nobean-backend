const sequelize = require('./config/db');
const { QueryTypes } = require('sequelize');

async function deployStatusField() {
  try {
    console.log('🚀 شروع Deploy فیلد status به سرور...');
    
    // تست اتصال
    await sequelize.authenticate();
    console.log('✅ اتصال به دیتابیس سرور برقرار شد');
    
    // بررسی محیط
    const environment = process.env.NODE_ENV || 'development';
    console.log(`🌍 محیط: ${environment}`);
    
    if (environment === 'production') {
      console.log('⚠️ هشدار: شما در محیط Production هستید!');
      console.log('📋 لطفاً قبل از ادامه، بک‌آپ از دیتابیس بگیرید');
      
      // در اینجا می‌توانید یک تایید اضافه کنید
      // const readline = require('readline');
      // const rl = readline.createInterface({
      //   input: process.stdin,
      //   output: process.stdout
      // });
      // const answer = await new Promise(resolve => {
      //   rl.question('آیا مطمئن هستید؟ (yes/no): ', resolve);
      // });
      // rl.close();
      // if (answer.toLowerCase() !== 'yes') {
      //   console.log('❌ عملیات لغو شد');
      //   return;
      // }
    }
    
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
      
      // نمایش آمار فعلی
      const stats = await sequelize.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM exams 
        GROUP BY status
      `, { type: QueryTypes.SELECT });
      
      console.log('📊 آمار فعلی وضعیت آزمون‌ها:');
      stats.forEach(stat => {
        const statusText = stat.status === 'active' ? 'فعال' : 
                          stat.status === 'draft' ? 'پیش‌نویس' : 'غیرفعال';
        console.log(`   ${statusText}: ${stat.count} آزمون`);
      });
      
      return;
    }
    
    console.log('🔄 اضافه کردن فیلد status...');
    
    // اضافه کردن فیلد status
    await sequelize.query(`
      ALTER TABLE exams 
      ADD COLUMN status ENUM('draft', 'active', 'inactive') 
      NOT NULL DEFAULT 'draft' 
      COMMENT 'Test status: draft, active, inactive'
    `);
    
    console.log('✅ فیلد status با موفقیت اضافه شد');
    
    // به‌روزرسانی آزمون‌های موجود
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
    
    console.log('📊 آمار نهایی وضعیت آزمون‌ها:');
    stats.forEach(stat => {
      const statusText = stat.status === 'active' ? 'فعال' : 
                        stat.status === 'draft' ? 'پیش‌نویس' : 'غیرفعال';
      console.log(`   ${statusText}: ${stat.count} آزمون`);
    });
    
    console.log('🎉 Deploy با موفقیت انجام شد!');
    console.log('💡 حالا می‌توانید سیستم وضعیت‌بندی را در پنل ادمین استفاده کنید');
    
  } catch (error) {
    console.error('❌ خطا در Deploy:', error);
    console.log('🆘 در صورت بروز مشکل، از بک‌آپ استفاده کنید');
  } finally {
    await sequelize.close();
  }
}

// اجرای Deploy
deployStatusField();
