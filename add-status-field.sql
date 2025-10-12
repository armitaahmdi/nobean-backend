-- Migration: اضافه کردن فیلد status به جدول exams
-- تاریخ: $(date)
-- توضیحات: اضافه کردن وضعیت‌بندی به آزمون‌ها (draft, active, inactive)

-- بررسی وجود فیلد status
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'exams' 
AND COLUMN_NAME = 'status';

-- اضافه کردن فیلد status
ALTER TABLE exams 
ADD COLUMN status ENUM('draft', 'active', 'inactive') 
NOT NULL DEFAULT 'draft' 
COMMENT 'Test status: draft, active, inactive';

-- به‌روزرسانی آزمون‌های موجود به وضعیت active (اگر سوال دارند)
UPDATE exams 
SET status = 'active' 
WHERE status = 'draft' 
AND question_count > 0;

-- نمایش آمار نهایی
SELECT 
  status,
  COUNT(*) as count,
  CASE 
    WHEN status = 'active' THEN 'فعال'
    WHEN status = 'draft' THEN 'پیش‌نویس'
    WHEN status = 'inactive' THEN 'غیرفعال'
  END as status_persian
FROM exams 
GROUP BY status
ORDER BY status;
