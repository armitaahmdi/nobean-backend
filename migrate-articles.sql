-- Migration Script for Articles Table
-- این اسکریپت برای به‌روزرسانی جدول articles در سرور production استفاده می‌شود

-- بررسی وجود جدول articles
SELECT 'Checking if articles table exists...' as status;

-- اگر جدول وجود ندارد، آن را ایجاد کن
CREATE TABLE IF NOT EXISTS `articles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `excerpt_description` text,
  `excerpt` text,
  `description` text,
  `author` varchar(255) DEFAULT 'نوین کد',
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `image` varchar(500),
  `readingTime` bigint(20) DEFAULT 5,
  `category` varchar(100) DEFAULT 'عمومی',
  `tags` json,
  `contentSections` json,
  `faqs` json,
  `reviews` json,
  `status` enum('draft', 'published', 'archived') DEFAULT 'draft',
  `views` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`createdAt`),
  KEY `idx_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- اضافه کردن فیلدهای جدید (اگر وجود ندارند)
ALTER TABLE `articles` 
ADD COLUMN IF NOT EXISTS `excerpt` text AFTER `excerpt_description`,
ADD COLUMN IF NOT EXISTS `status` enum('draft', 'published', 'archived') DEFAULT 'draft' AFTER `reviews`,
ADD COLUMN IF NOT EXISTS `views` int(11) DEFAULT 0 AFTER `status`;

-- تغییر نام فیلد faq به faqs (اگر وجود دارد)
-- ابتدا بررسی کن که آیا فیلد faq وجود دارد
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'articles' 
  AND COLUMN_NAME = 'faq'
);

-- اگر فیلد faq وجود دارد، آن را به faqs تغییر نام بده
SET @sql = IF(@column_exists > 0, 
  'ALTER TABLE `articles` CHANGE COLUMN `faq` `faqs` json AFTER `contentSections`',
  'SELECT "Column faq does not exist, skipping rename" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ایجاد ایندکس‌ها (اگر وجود ندارند)
CREATE INDEX IF NOT EXISTS `idx_articles_category` ON `articles` (`category`);
CREATE INDEX IF NOT EXISTS `idx_articles_status` ON `articles` (`status`);
CREATE INDEX IF NOT EXISTS `idx_articles_created_at` ON `articles` (`createdAt`);
CREATE INDEX IF NOT EXISTS `idx_articles_title` ON `articles` (`title`);

-- بررسی ساختار نهایی جدول
SELECT 'Final table structure:' as status;
DESCRIBE `articles`;

-- نمایش تعداد رکوردها
SELECT COUNT(*) as total_articles FROM `articles`;

-- نمایش نمونه داده‌ها
SELECT id, title, status, views, createdAt FROM `articles` LIMIT 5;

SELECT 'Migration completed successfully!' as status;
