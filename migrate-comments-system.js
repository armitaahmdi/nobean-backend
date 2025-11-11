const sequelize = require('./config/db');
const { QueryTypes } = require('sequelize');

async function migrateCommentsSystem() {
  try {
    console.log('🔄 شروع migration سیستم کامنت‌ها...');
    
    // تست اتصال
    await sequelize.authenticate();
    console.log('✅ اتصال به دیتابیس برقرار شد');
    
    // 1. بررسی و اضافه کردن فیلد status به جدول comments
    console.log('\n📝 بررسی فیلد status در جدول comments...');
    const statusCheck = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'comments' 
      AND COLUMN_NAME = 'status'
    `, { type: QueryTypes.SELECT });
    
    if (statusCheck.length === 0) {
      console.log('   ➕ اضافه کردن فیلد status...');
      await sequelize.query(`
        ALTER TABLE comments 
        ADD COLUMN status ENUM('pending', 'approved', 'rejected') 
        NOT NULL DEFAULT 'pending' 
        COMMENT 'Comment status for moderation'
      `);
      console.log('   ✅ فیلد status اضافه شد');
      
      // به‌روزرسانی کامنت‌های موجود به وضعیت approved
      const [updateResults] = await sequelize.query(`
        UPDATE comments 
        SET status = 'approved' 
        WHERE status = 'pending'
      `);
      console.log(`   ✅ ${updateResults.affectedRows || 0} کامنت به وضعیت approved تغییر یافت`);
    } else {
      console.log('   ✓ فیلد status قبلاً وجود دارد');
    }
    
    // 2. بررسی و ایجاد جدول comment_reactions
    console.log('\n📝 بررسی جدول comment_reactions...');
    const reactionsTableCheck = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'comment_reactions'
    `, { type: QueryTypes.SELECT });
    
    if (reactionsTableCheck.length === 0) {
      console.log('   ➕ ایجاد جدول comment_reactions...');
      await sequelize.query(`
        CREATE TABLE comment_reactions (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          comment_id BIGINT NOT NULL,
          user_id BIGINT NOT NULL,
          reaction ENUM('like', 'dislike') NOT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_comment (comment_id, user_id),
          KEY idx_comment_id (comment_id),
          KEY idx_user_id (user_id),
          CONSTRAINT fk_reaction_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
          CONSTRAINT fk_reaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('   ✅ جدول comment_reactions ایجاد شد');
    } else {
      console.log('   ✓ جدول comment_reactions قبلاً وجود دارد');
    }
    
    // 3. بررسی و ایجاد جدول comment_reports
    console.log('\n📝 بررسی جدول comment_reports...');
    const reportsTableCheck = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'comment_reports'
    `, { type: QueryTypes.SELECT });
    
    if (reportsTableCheck.length === 0) {
      console.log('   ➕ ایجاد جدول comment_reports...');
      await sequelize.query(`
        CREATE TABLE comment_reports (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          comment_id BIGINT NOT NULL,
          user_id BIGINT NOT NULL,
          reason VARCHAR(255) NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_comment_id (comment_id),
          KEY idx_user_id (user_id),
          CONSTRAINT fk_report_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
          CONSTRAINT fk_report_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('   ✅ جدول comment_reports ایجاد شد');
    } else {
      console.log('   ✓ جدول comment_reports قبلاً وجود دارد');
    }
    
    // 4. بررسی و ایجاد جدول notifications
    console.log('\n📝 بررسی جدول notifications...');
    const notificationsTableCheck = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'notifications'
    `, { type: QueryTypes.SELECT });
    
    if (notificationsTableCheck.length === 0) {
      console.log('   ➕ ایجاد جدول notifications...');
      await sequelize.query(`
        CREATE TABLE notifications (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          type ENUM('comment_pending', 'comment_approved', 'comment_rejected') NOT NULL DEFAULT 'comment_pending',
          comment_id BIGINT NOT NULL,
          user_id BIGINT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          entity_type VARCHAR(50) NULL,
          entity_id BIGINT NULL,
          createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY idx_comment_id (comment_id),
          KEY idx_user_id (user_id),
          KEY idx_is_read (is_read),
          KEY idx_created_at (createdAt),
          CONSTRAINT fk_notification_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
          CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('   ✅ جدول notifications ایجاد شد');
    } else {
      console.log('   ✓ جدول notifications قبلاً وجود دارد');
    }
    
    // 5. بررسی indexes و foreign keys در جدول comments
    console.log('\n📝 بررسی indexes در جدول comments...');
    const commentsIndexes = await sequelize.query(`
      SELECT INDEX_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'comments'
      AND INDEX_NAME != 'PRIMARY'
    `, { type: QueryTypes.SELECT });
    
    const hasSectionIndex = commentsIndexes.some(idx => 
      idx.INDEX_NAME.includes('section') || 
      (idx.COLUMN_NAME === 'section_type' || idx.COLUMN_NAME === 'section_id')
    );
    
    if (!hasSectionIndex) {
      console.log('   ➕ اضافه کردن index برای section_type و section_id...');
      await sequelize.query(`
        CREATE INDEX idx_section ON comments(section_type, section_id)
      `);
      console.log('   ✅ index اضافه شد');
    } else {
      console.log('   ✓ index های section قبلاً وجود دارند');
    }
    
    // نمایش آمار نهایی
    console.log('\n📊 آمار نهایی:');
    
    const [commentsStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM comments
    `, { type: QueryTypes.SELECT });
    
    console.log(`   📝 کامنت‌ها:`);
    console.log(`      کل: ${commentsStats?.total || 0}`);
    console.log(`      در انتظار تایید: ${commentsStats?.pending || 0}`);
    console.log(`      تایید شده: ${commentsStats?.approved || 0}`);
    console.log(`      رد شده: ${commentsStats?.rejected || 0}`);
    
    const [reactionsCount] = await sequelize.query(`
      SELECT COUNT(*) as total FROM comment_reactions
    `, { type: QueryTypes.SELECT });
    console.log(`   👍 واکنش‌ها (لایک/دیسلایک): ${reactionsCount?.total || 0}`);
    
    const [reportsCount] = await sequelize.query(`
      SELECT COUNT(*) as total FROM comment_reports
    `, { type: QueryTypes.SELECT });
    console.log(`   🚩 گزارش‌ها: ${reportsCount?.total || 0}`);
    
    const [notificationsCount] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread
      FROM notifications
    `, { type: QueryTypes.SELECT });
    console.log(`   🔔 نوتیفیکیشن‌ها:`);
    console.log(`      کل: ${notificationsCount?.total || 0}`);
    console.log(`      خوانده نشده: ${notificationsCount?.unread || 0}`);
    
    console.log('\n🎉 Migration با موفقیت انجام شد!');
    
  } catch (error) {
    console.error('❌ خطا در migration:', error);
    console.error('   جزئیات:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// اجرای migration
if (require.main === module) {
  migrateCommentsSystem();
}

module.exports = migrateCommentsSystem;

