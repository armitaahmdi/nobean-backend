# راهنمای Deploy سیستم وضعیت‌بندی آزمون‌ها

## ⚠️ هشدار مهم
**قبل از اجرای هر عملیاتی روی سرور، حتماً بک‌آپ کامل از دیتابیس بگیرید!**

## 🚀 مراحل Deploy

### 1. آماده‌سازی
```bash
# روی سرور
cd /path/to/nobean-back/nobean

# بررسی وضعیت فعلی
npm run check-exam-status
```

### 2. بک‌آپ دیتابیس
```bash
# بک‌آپ کامل
mysqldump -u username -p database_name > backup_before_status_field.sql

# یا بک‌آپ فقط جدول exams
mysqldump -u username -p database_name exams > backup_exams_table.sql
```

### 3. اجرای Migration
```bash
# روش 1: استفاده از Deploy Script (پیشنهادی)
npm run deploy-status-field

# روش 2: اجرای مستقیم SQL
mysql -u username -p database_name < add-status-field.sql

# روش 3: استفاده از Migration اصلی
npm run add-status-field
```

### 4. بررسی نتیجه
```bash
# بررسی وضعیت آزمون‌ها
npm run check-exam-status
```

## 🔧 تنظیمات محیط

### Development (محلی)
```bash
NODE_ENV=development npm run deploy-status-field
```

### Production (سرور)
```bash
NODE_ENV=production npm run deploy-status-field
```

## 📋 چک‌لیست Deploy

- [ ] بک‌آپ دیتابیس گرفته شده
- [ ] کدهای جدید روی سرور آپلود شده
- [ ] Migration اجرا شده
- [ ] وضعیت آزمون‌ها بررسی شده
- [ ] پنل ادمین تست شده
- [ ] فیلتر وضعیت کار می‌کند

## 🆘 بازیابی در صورت مشکل

### بازگردانی از بک‌آپ
```bash
# بازگردانی کامل
mysql -u username -p database_name < backup_before_status_field.sql

# یا فقط جدول exams
mysql -u username -p database_name < backup_exams_table.sql
```

### حذف فیلد status (در صورت نیاز)
```sql
ALTER TABLE exams DROP COLUMN status;
```

## 📞 پشتیبانی
در صورت بروز مشکل، لطفاً:
1. لاگ‌های خطا را ذخیره کنید
2. وضعیت دیتابیس را بررسی کنید
3. از بک‌آپ استفاده کنید
4. با تیم توسعه تماس بگیرید

## ✅ پس از Deploy موفق

1. **پنل ادمین** را باز کنید
2. به **"لیست آزمون‌ها"** بروید
3. **فیلتر وضعیت** را تست کنید
4. **آمار جدید** را بررسی کنید
5. **ایجاد آزمون جدید** را تست کنید
