const db = require('./src/model');
const sequelize = require('./config/db');

async function testMigration() {
  try {
    console.log('🧪 شروع تست مهاجرت...');
    
    // تست اتصال
    await sequelize.authenticate();
    console.log('✅ اتصال به MySQL برقرار شد');
    
    // تست تعداد رکوردها در جداول اصلی
    const userCount = await db.User.count();
    const examCount = await db.Exam.count();
    const questionCount = await db.Question.count();
    const productCount = await db.Product.count();
    
    console.log('📊 آمار داده‌ها:');
    console.log(`👥 کاربران: ${userCount}`);
    console.log(`📝 آزمون‌ها: ${examCount}`);
    console.log(`❓ سوالات: ${questionCount}`);
    console.log(`🛍️ محصولات: ${productCount}`);
    
    // تست روابط
    console.log('\n🔗 تست روابط...');
    
    // تست رابطه کاربر و آزمون
    const userWithTests = await db.User.findOne({
      include: [{
        model: db.UserTest,
        as: 'UserTests',
        include: [{
          model: db.Exam,
          as: 'Exam'
        }]
      }]
    });
    
    if (userWithTests) {
      console.log('✅ رابطه کاربر-آزمون کار می‌کند');
    }
    
    // تست رابطه آزمون و سوالات
    const examWithQuestions = await db.Exam.findOne({
      include: [{
        model: db.Question,
        include: [{
          model: db.Item,
          as: 'Items'
        }]
      }]
    });
    
    if (examWithQuestions) {
      console.log('✅ رابطه آزمون-سوالات کار می‌کند');
    }
    
    // تست عملیات CRUD
    console.log('\n🔧 تست عملیات CRUD...');
    
    // تست ایجاد
    const testUser = await db.User.create({
      firstName: 'Test',
      lastName: 'User',
      phone: '09123456789',
      role: 'student'
    });
    console.log('✅ عملیات ایجاد کار می‌کند');
    
    // تست خواندن
    const foundUser = await db.User.findByPk(testUser.id);
    console.log('✅ عملیات خواندن کار می‌کند');
    
    // تست به‌روزرسانی
    await testUser.update({ firstName: 'Updated' });
    console.log('✅ عملیات به‌روزرسانی کار می‌کند');
    
    // تست حذف
    await testUser.destroy();
    console.log('✅ عملیات حذف کار می‌کند');
    
    console.log('\n🎉 همه تست‌ها با موفقیت انجام شد!');
    console.log('✅ مهاجرت به MySQL کامل و موفقیت‌آمیز است');
    
  } catch (error) {
    console.error('❌ خطا در تست مهاجرت:', error);
  } finally {
    await sequelize.close();
  }
}

// اجرای تست
testMigration();
