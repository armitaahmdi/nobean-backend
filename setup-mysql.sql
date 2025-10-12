-- ایجاد دیتابیس جدید
CREATE DATABASE IF NOT EXISTS nobean_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد کاربر جدید
CREATE USER IF NOT EXISTS 'nobean_user'@'localhost' IDENTIFIED BY 'nobean123';

-- دادن مجوزها
GRANT ALL PRIVILEGES ON nobean_db.* TO 'nobean_user'@'localhost';

-- اعمال تغییرات
FLUSH PRIVILEGES;

-- نمایش دیتابیس‌ها
SHOW DATABASES;

-- نمایش کاربران
SELECT User, Host FROM mysql.user WHERE User = 'nobean_user';
