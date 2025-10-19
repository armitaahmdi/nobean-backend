# راهنمای کامل Deployment و Migration

## 🚀 مراحل Deployment

### 1. آماده‌سازی فایل‌ها

#### فایل‌های جدید برای آپلود:
- `server.js` (تغییرات CORS)
- `src/config/cors.js` (فایل جدید)
- `src/router/articleRouter.js` (فایل جدید)
- `src/controller/articleController.js` (فایل جدید)
- `src/model/articles/articleModel.js` (تغییرات)
- `migrate-articles.js` (اسکریپت مایگریشن)
- `migrate-articles.sql` (اسکریپت SQL)
- `test-cors.sh` (اسکریپت تست)
- `CORS_TROUBLESHOOTING.md` (مستندات)

### 2. آپلود فایل‌ها به سرور

```bash
# آپلود فایل‌های اصلی
scp server.js user@server:/path/to/nobean-back/nobean/
scp src/config/cors.js user@server:/path/to/nobean-back/nobean/src/config/
scp src/router/articleRouter.js user@server:/path/to/nobean-back/nobean/src/router/
scp src/controller/articleController.js user@server:/path/to/nobean-back/nobean/src/controller/
scp src/model/articles/articleModel.js user@server:/path/to/nobean-back/nobean/src/model/articles/

# آپلود اسکریپت‌های مایگریشن
scp migrate-articles.js user@server:/path/to/nobean-back/nobean/
scp migrate-articles.sql user@server:/path/to/nobean-back/nobean/
scp test-cors.sh user@server:/path/to/nobean-back/nobean/
scp CORS_TROUBLESHOOTING.md user@server:/path/to/nobean-back/nobean/

# آپلود package.json (اگر تغییر کرده)
scp package.json user@server:/path/to/nobean-back/nobean/
```

### 3. نصب Dependencies جدید (اگر نیاز باشد)

```bash
# روی سرور
cd /path/to/nobean-back/nobean
npm install
```

### 4. اجرای Migration

#### روش 1: استفاده از اسکریپت Node.js (توصیه می‌شود)
```bash
# روی سرور
cd /path/to/nobean-back/nobean
npm run migrate-articles
```

#### روش 2: استفاده از SQL مستقیم
```bash
# روی سرور
mysql -u root -p nobean_db < migrate-articles.sql
```

### 5. ریستارت سرور

```bash
# اگر از PM2 استفاده می‌کنید
pm2 restart nobean-api

# اگر از systemd استفاده می‌کنید
systemctl restart nobean-api

# اگر از Docker استفاده می‌کنید
docker-compose restart api
```

### 6. تست عملکرد

#### تست CORS:
```bash
# روی سرور
./test-cors.sh
# یا
npm run test-cors
```

#### تست API مقالات:
```bash
# تست دریافت مقالات
curl -X GET "https://api.nobean.ir/api/v1/articles" \
  -H "Origin: https://www.nobean.ir" \
  -H "Accept: application/json"

# تست دریافت مقاله خاص
curl -X GET "https://api.nobean.ir/api/v1/articles/1" \
  -H "Origin: https://www.nobean.ir" \
  -H "Accept: application/json"
```

## 🔍 بررسی‌های پس از Deployment

### 1. بررسی لاگ‌های سرور
```bash
# PM2
pm2 logs nobean-api --lines 50

# systemd
journalctl -u nobean-api -f

# Docker
docker logs nobean-api-container
```

### 2. بررسی وضعیت دیتابیس
```sql
-- اتصال به دیتابیس
mysql -u root -p nobean_db

-- بررسی ساختار جدول
DESCRIBE articles;

-- بررسی تعداد رکوردها
SELECT COUNT(*) FROM articles;

-- بررسی نمونه داده‌ها
SELECT id, title, status, views FROM articles LIMIT 5;
```

### 3. بررسی CORS Headers
```bash
curl -X OPTIONS \
  -H "Origin: https://www.nobean.ir" \
  -H "Access-Control-Request-Method: POST" \
  -v \
  https://api.nobean.ir/api/v1/users/send-otp
```

## 🚨 Troubleshooting

### اگر Migration شکست خورد:

#### 1. بررسی خطاهای دیتابیس:
```bash
# بررسی لاگ‌های MySQL
tail -f /var/log/mysql/error.log

# بررسی وضعیت دیتابیس
mysql -u root -p -e "SHOW PROCESSLIST;"
```

#### 2. Rollback (در صورت نیاز):
```sql
-- حذف فیلدهای اضافه شده (اگر مشکل داشت)
ALTER TABLE articles DROP COLUMN IF EXISTS excerpt;
ALTER TABLE articles DROP COLUMN IF EXISTS status;
ALTER TABLE articles DROP COLUMN IF EXISTS views;

-- تغییر نام faqs به faq (اگر نیاز بود)
ALTER TABLE articles CHANGE COLUMN faqs faq json AFTER contentSections;
```

### اگر CORS مشکل داشت:

#### 1. بررسی تنظیمات:
```bash
# بررسی فایل cors.js
cat src/config/cors.js

# بررسی server.js
grep -n "cors" server.js
```

#### 2. تست تنظیمات:
```bash
# تست preflight
curl -X OPTIONS \
  -H "Origin: https://www.nobean.ir" \
  -v \
  https://api.nobean.ir/api/v1/users/send-otp
```

## 📋 چک‌لیست نهایی

- [ ] همه فایل‌ها آپلود شده‌اند
- [ ] Dependencies نصب شده‌اند
- [ ] Migration اجرا شده است
- [ ] سرور ریستارت شده است
- [ ] CORS تست شده است
- [ ] API مقالات تست شده است
- [ ] لاگ‌های سرور بررسی شده‌اند
- [ ] دیتابیس بررسی شده است
- [ ] سایت در production تست شده است

## 🎯 نتیجه

بعد از انجام این مراحل:
- ✅ مشکل CORS حل می‌شود
- ✅ جدول مقالات به‌روزرسانی می‌شود
- ✅ API مقالات فعال می‌شود
- ✅ پنل ادمین مقالات کار می‌کند
- ✅ پنل کاربر مقالات کار می‌کند

## 📞 پشتیبانی

اگر در هر مرحله مشکلی پیش آمد:
1. لاگ‌های سرور را بررسی کنید
2. نتیجه تست‌ها را ذخیره کنید
3. پیام خطا را کپی کنید
4. با تیم پشتیبانی تماس بگیرید