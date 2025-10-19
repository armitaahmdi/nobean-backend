-- ایجاد جدول مقالات
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

-- اضافه کردن فیلدهای جدید اگر جدول قبلاً وجود داشته باشد
ALTER TABLE `articles` 
ADD COLUMN IF NOT EXISTS `excerpt` text AFTER `excerpt_description`,
ADD COLUMN IF NOT EXISTS `status` enum('draft', 'published', 'archived') DEFAULT 'draft' AFTER `reviews`,
ADD COLUMN IF NOT EXISTS `views` int(11) DEFAULT 0 AFTER `status`;

-- تغییر نام فیلد faq به faqs اگر وجود داشته باشد
ALTER TABLE `articles` 
CHANGE COLUMN `faq` `faqs` json AFTER `contentSections`;

-- ایجاد ایندکس‌ها
CREATE INDEX IF NOT EXISTS `idx_articles_category` ON `articles` (`category`);
CREATE INDEX IF NOT EXISTS `idx_articles_status` ON `articles` (`status`);
CREATE INDEX IF NOT EXISTS `idx_articles_created_at` ON `articles` (`createdAt`);
CREATE INDEX IF NOT EXISTS `idx_articles_title` ON `articles` (`title`);

-- نمونه داده‌های اولیه
INSERT INTO `articles` (
  `title`, 
  `excerpt`, 
  `description`, 
  `author`, 
  `category`, 
  `readingTime`, 
  `tags`, 
  `contentSections`, 
  `faqs`,
  `reviews`,
  `status`
) VALUES 
(
  'چگونه برنامه‌نویس بهتری شویم؟',
  'در این مقاله با روش‌هایی برای بهبود مهارت برنامه‌نویسی آشنا می‌شویم',
  'برنامه‌نویس خوب بودن فقط به میزان زمانی که صرف کدنویسی می‌کنید بستگی ندارد. یکی از مهم‌ترین عوامل، درک عمیق مفاهیم و توانایی حل مسئله است.',
  'نوین کد',
  'مهارت',
  5,
  '["برنامه‌نویسی", "مهارت", "توسعه"]',
  '[
    {
      "type": "heading",
      "level": 2,
      "text": "مقدمه"
    },
    {
      "type": "text",
      "text": "برنامه‌نویس خوب بودن تنها به میزان زمانی که صرف کدنویسی می‌کنید محدود نمی‌شود. عوامل زیادی وجود دارند که کیفیت کار و مهارت شما را تعیین می‌کنند."
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "کدنویسی تمیز و قابل فهم",
        "تسلط بر الگوریتم‌ها و ساختمان داده‌ها",
        "درک عمیق مفاهیم معماری نرم‌افزار"
      ]
    }
  ]',
  '[
    {
      "question": "چگونه می‌توانم برنامه‌نویس بهتری شوم؟",
      "answer": "با تمرین مداوم، مطالعه مستندات و شرکت در پروژه‌های منبع‌باز"
    }
  ]',
  '[
    {
      "name": "علی",
      "comment": "مقاله بسیار مفیدی بود",
      "likes": 5,
      "dislikes": 0
    }
  ]',
  'published'
),
(
  'راهکارهای افزایش تمرکز در کودکان',
  'تمرکز یکی از مهم‌ترین مهارت‌های شناختی است که کودکان باید یاد بگیرند',
  'تمرکز در کودکان یکی از مهم‌ترین مهارت‌های شناختی است که بر موفقیت تحصیلی و اجتماعی آن‌ها تأثیر مستقیم دارد.',
  'نوین کد',
  'تربیت',
  7,
  '["تمرکز", "کودکان", "تربیت"]',
  '[
    {
      "type": "heading",
      "level": 2,
      "text": "مقدمه"
    },
    {
      "type": "text",
      "text": "تمرکز در کودکان یکی از مهم‌ترین مهارت‌های شناختی است که بر موفقیت تحصیلی و اجتماعی آن‌ها تأثیر مستقیم دارد."
    },
    {
      "type": "blockquote",
      "text": "تمرکز مانند عضله است که با تمرین قوی‌تر می‌شود",
      "author": "دکتر روانشناس"
    }
  ]',
  '[
    {
      "question": "چگونه تمرکز کودکان را افزایش دهیم؟",
      "answer": "با ایجاد محیط مناسب و تمرین‌های مخصوص"
    }
  ]',
  '[]',
  'published'
);

-- نمایش ساختار جدول
DESCRIBE `articles`;
