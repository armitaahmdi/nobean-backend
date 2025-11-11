-- Migration Script برای سیستم کامنت‌ها
-- این فایل برای اجرای دستی migration استفاده می‌شود
-- توصیه می‌شود از migrate-comments-system.js استفاده کنید

-- ============================================
-- 1. اضافه کردن فیلد status به جدول comments
-- ============================================

-- بررسی وجود فیلد status
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'comments' 
AND COLUMN_NAME = 'status';

-- اضافه کردن فیلد status (اگر وجود ندارد)
-- اگر فیلد قبلاً وجود دارد، این دستور خطا می‌دهد که می‌توانید آن را نادیده بگیرید
ALTER TABLE comments 
ADD COLUMN status ENUM('pending', 'approved', 'rejected') 
NOT NULL DEFAULT 'pending' 
COMMENT 'Comment status for moderation';

-- به‌روزرسانی کامنت‌های موجود به وضعیت approved
UPDATE comments 
SET status = 'approved' 
WHERE status = 'pending';

-- ============================================
-- 2. ایجاد جدول comment_reactions
-- ============================================

CREATE TABLE IF NOT EXISTS comment_reactions (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. ایجاد جدول comment_reports
-- ============================================

CREATE TABLE IF NOT EXISTS comment_reports (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. ایجاد جدول notifications
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. اضافه کردن Index برای section_type و section_id
-- ============================================

-- بررسی وجود index
SELECT INDEX_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'comments'
AND INDEX_NAME = 'idx_section';

-- اضافه کردن index (اگر وجود ندارد)
CREATE INDEX idx_section ON comments(section_type, section_id);

-- ============================================
-- بررسی نتایج
-- ============================================

-- بررسی فیلد status
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'comments' 
AND COLUMN_NAME = 'status';

-- بررسی جداول ایجاد شده
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('comment_reactions', 'comment_reports', 'notifications');

-- آمار کامنت‌ها
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM comments;

