# راهنمای حل مشکل CORS در Nobean API

## 🚨 مشکل
```
Access to fetch at 'https://api.nobean.ir/api/v1/users/send-otp' from origin 'https://www.nobean.ir' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔧 راه‌حل‌های پیاده‌سازی شده

### 1. تنظیمات CORS بهبود یافته
- فایل `src/config/cors.js` ایجاد شد
- لیست origins مجاز به‌روزرسانی شد
- Middleware اضافی برای preflight requests

### 2. تغییرات در server.js
- Import کردن تنظیمات CORS از فایل جداگانه
- اضافه کردن logging برای debugging
- بهبود handling preflight requests

### 3. اسکریپت تست CORS
- فایل `test-cors.sh` برای تست تنظیمات
- قابل اجرا با `./test-cors.sh`

## 🚀 مراحل deployment

### 1. آپلود فایل‌های جدید به سرور
```bash
# آپلود فایل‌های تغییر یافته
scp server.js user@server:/path/to/nobean-back/nobean/
scp src/config/cors.js user@server:/path/to/nobean-back/nobean/src/config/
```

### 2. ریستارت سرور
```bash
# روی سرور
pm2 restart nobean-api
# یا
systemctl restart nobean-api
```

### 3. تست تنظیمات
```bash
# اجرای اسکریپت تست
./test-cors.sh
```

## 🔍 Debugging

### 1. بررسی لاگ‌های سرور
```bash
# بررسی لاگ‌های PM2
pm2 logs nobean-api

# بررسی لاگ‌های systemd
journalctl -u nobean-api -f
```

### 2. تست دستی CORS
```bash
# تست preflight
curl -X OPTIONS \
  -H "Origin: https://www.nobean.ir" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  https://api.nobean.ir/api/v1/users/send-otp
```

### 3. بررسی تنظیمات Nginx (اگر استفاده می‌کنید)
```nginx
# اضافه کردن headers در nginx.conf
add_header 'Access-Control-Allow-Origin' 'https://www.nobean.ir' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;

# Handle preflight requests
if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' 'https://www.nobean.ir';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With';
    add_header 'Access-Control-Max-Age' 86400;
    add_header 'Content-Length' 0;
    add_header 'Content-Type' 'text/plain';
    return 204;
}
```

## 📋 چک‌لیست troubleshooting

- [ ] فایل‌های جدید آپلود شده‌اند
- [ ] سرور ریستارت شده است
- [ ] لاگ‌های سرور بررسی شده‌اند
- [ ] اسکریپت تست اجرا شده است
- [ ] تنظیمات Nginx بررسی شده‌اند (اگر استفاده می‌کنید)
- [ ] Browser cache پاک شده است
- [ ] Network tab در dev tools بررسی شده است

## 🆘 اگر مشکل ادامه داشت

### 1. بررسی Environment Variables
```bash
# بررسی متغیرهای محیطی
echo $NODE_ENV
echo $CORS_ORIGINS
```

### 2. تست با curl
```bash
# تست کامل
curl -X POST \
  -H "Origin: https://www.nobean.ir" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"phone":"09123456789"}' \
  -v \
  https://api.nobean.ir/api/v1/users/send-otp
```

### 3. بررسی تنظیمات Load Balancer
اگر از load balancer استفاده می‌کنید، ممکن است نیاز به تنظیمات اضافی باشد.

## 📞 پشتیبانی
اگر مشکل ادامه داشت، لاگ‌های سرور و نتیجه تست‌ها را ارسال کنید.
