const sequelize = require('./config/db');
const { QueryTypes } = require('sequelize');

async function checkExamStatus() {
  try {
    console.log('🔍 بررسی وضعیت آزمون‌ها...');
    
    // تست اتصال
    await sequelize.authenticate();
    console.log('✅ اتصال به دیتابیس برقرار شد');
    
    // نمایش آمار وضعیت آزمون‌ها
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
    
    // نمایش جزئیات آزمون‌ها
    const exams = await sequelize.query(`
      SELECT 
        id,
        title,
        status,
        question_count,
        participants
      FROM exams 
      ORDER BY id
      LIMIT 10
    `, { type: QueryTypes.SELECT });
    
    console.log('\n📋 نمونه آزمون‌ها:');
    if (exams && exams.length > 0) {
      exams.forEach(exam => {
        const statusText = exam.status === 'active' ? 'فعال' : 
                          exam.status === 'draft' ? 'پیش‌نویس' : 'غیرفعال';
        console.log(`   ID: ${exam.id} | ${exam.title} | ${statusText} | سوالات: ${exam.question_count} | شرکت‌کنندگان: ${exam.participants}`);
      });
    } else {
      console.log('   هیچ آزمونی یافت نشد');
    }
    
  } catch (error) {
    console.error('❌ خطا در بررسی:', error);
  } finally {
    await sequelize.close();
  }
}

// اجرای بررسی
checkExamStatus();
