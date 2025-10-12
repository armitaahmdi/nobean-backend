const sequelize = require('./config/db');
const { QueryTypes } = require('sequelize');

async function runMigration() {
  try {
    console.log('🔄 شروع مایگریشن افزودن components به exams و component به questions...');

    await sequelize.authenticate();
    console.log('✅ اتصال به دیتابیس برقرار شد');

    // Add components column to exams if not exists
    const hasComponents = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'exams' 
        AND COLUMN_NAME = 'components'
    `, { type: QueryTypes.SELECT });

    if (hasComponents.length === 0) {
      console.log('➕ در حال افزودن ستون components به جدول exams...');
      await sequelize.query(`
        ALTER TABLE exams 
        ADD COLUMN components JSON NULL COMMENT 'لیست مولفه‌های آزمون (آرایه‌ای از رشته‌ها)'
      `);
      console.log('✅ ستون components اضافه شد');
    } else {
      console.log('⚠️ ستون components قبلاً وجود دارد');
    }

    // Add component column to questions if not exists
    // Check if questions table exists first
    const hasQuestionsTable = await sequelize.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'questions'
    `, { type: QueryTypes.SELECT });

    if (hasQuestionsTable.length === 0) {
      console.log("⚠️ جدول questions یافت نشد. از همگام‌سازی مدل‌ها یا مایگریشن ایجاد جدول سوال اطمینان حاصل کنید. مرحله افزودن ستون component رد شد.");
    } else {
      const hasQuestionComponent = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'questions' 
          AND COLUMN_NAME = 'component'
      `, { type: QueryTypes.SELECT });

      if (hasQuestionComponent.length === 0) {
        console.log('➕ در حال افزودن ستون component به جدول questions...');
        await sequelize.query(`
          ALTER TABLE questions 
          ADD COLUMN component VARCHAR(255) NULL COMMENT 'نام مولفه‌ای که سوال به آن تعلق دارد'
        `);
        console.log('✅ ستون component اضافه شد');
      } else {
        console.log('⚠️ ستون component قبلاً وجود دارد');
      }
    }

    console.log('🎉 Migration با موفقیت انجام شد!');
  } catch (error) {
    console.error('❌ خطا در migration:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();


