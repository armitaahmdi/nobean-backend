# API مقالات - بک‌اند

## نصب و راه‌اندازی

### 1. اجرای SQL
```bash
mysql -u username -p database_name < setup-articles.sql
```

### 2. راه‌اندازی سرور
```bash
npm start
# یا
node server.js
```

## API Endpoints

### مسیرهای عمومی

#### دریافت لیست مقالات
```
GET /api/v1/articles
```

**Query Parameters:**
- `page` (اختیاری): شماره صفحه (پیش‌فرض: 1)
- `limit` (اختیاری): تعداد مقالات در هر صفحه (پیش‌فرض: 10)
- `category` (اختیاری): فیلتر بر اساس دسته‌بندی
- `search` (اختیاری): جستجو در عنوان و خلاصه

**Response:**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "عنوان مقاله",
      "excerpt": "خلاصه مقاله",
      "category": "روانشناسی",
      "readingTime": 5,
      "author": "نوین کد",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

#### دریافت مقاله بر اساس ID
```
GET /api/v1/articles/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "عنوان مقاله",
  "excerpt": "خلاصه مقاله",
  "description": "توضیحات کامل",
  "contentSections": [
    {
      "type": "heading",
      "level": 2,
      "text": "عنوان بخش"
    },
    {
      "type": "text",
      "text": "محتوای متن"
    }
  ],
  "faq": [
    {
      "question": "سوال متداول",
      "answer": "پاسخ"
    }
  ],
  "reviews": [
    {
      "name": "نام کاربر",
      "comment": "نظر کاربر",
      "likes": 5,
      "dislikes": 0
    }
  ]
}
```

#### جستجوی مقالات
```
GET /api/v1/articles/search?q=عبارت جستجو
```

### مسیرهای ادمین

#### دریافت لیست مقالات (ادمین)
```
GET /api/v1/admin/articles
```
نیاز به احراز هویت و دسترسی ادمین

#### ایجاد مقاله جدید (ادمین)
```
POST /api/v1/admin/articles
```

**Request Body:**
```json
{
  "title": "عنوان مقاله",
  "excerpt": "خلاصه مقاله",
  "description": "توضیحات کامل",
  "author": "نوین کد",
  "date": "2025-01-01",
  "image": "https://example.com/image.jpg",
  "readingTime": 5,
  "category": "روانشناسی",
  "tags": ["برچسب1", "برچسب2"],
  "contentSections": [
    {
      "type": "heading",
      "level": 2,
      "text": "عنوان بخش"
    },
    {
      "type": "text",
      "text": "محتوای متن"
    },
    {
      "type": "image",
      "src": "https://example.com/image.jpg",
      "alt": "متن جایگزین",
      "caption": "زیرنویس"
    },
    {
      "type": "list",
      "ordered": false,
      "items": ["آیتم 1", "آیتم 2"]
    },
    {
      "type": "blockquote",
      "text": "متن نقل‌قول",
      "author": "نویسنده"
    },
    {
      "type": "video",
      "src": "https://example.com/video.mp4",
      "caption": "زیرنویس ویدیو"
    }
  ],
  "faqs": [
    {
      "question": "سوال متداول",
      "answer": "پاسخ"
    }
  ],
  "reviews": []
}
```

#### ویرایش مقاله (ادمین)
```
PUT /api/v1/admin/articles/:id
```

#### حذف مقاله (ادمین)
```
DELETE /api/v1/admin/articles/:id
```

#### دریافت آمار مقالات (ادمین)
```
GET /api/v1/admin/articles/stats
```

**Response:**
```json
{
  "total": 25,
  "published": 20,
  "draft": 5,
  "categories": [
    {
      "category": "روانشناسی",
      "count": 10
    },
    {
      "category": "تربیت",
      "count": 8
    }
  ]
}
```

#### دریافت مقالات اخیر (ادمین)
```
GET /api/v1/admin/articles/recent?limit=5
```

## ساختار داده‌ها

### انواع محتوا (contentSections)

#### 1. تیتر (heading)
```json
{
  "type": "heading",
  "level": 2,
  "text": "عنوان بخش"
}
```

#### 2. متن (text)
```json
{
  "type": "text",
  "text": "محتوای متن"
}
```

#### 3. تصویر (image)
```json
{
  "type": "image",
  "src": "https://example.com/image.jpg",
  "alt": "متن جایگزین",
  "caption": "زیرنویس تصویر"
}
```

#### 4. لیست (list)
```json
{
  "type": "list",
  "ordered": false,
  "items": ["آیتم 1", "آیتم 2", "آیتم 3"]
}
```

#### 5. نقل‌قول (blockquote)
```json
{
  "type": "blockquote",
  "text": "متن نقل‌قول",
  "author": "نویسنده نقل‌قول"
}
```

#### 6. ویدیو (video)
```json
{
  "type": "video",
  "src": "https://example.com/video.mp4",
  "caption": "زیرنویس ویدیو"
}
```

### ساختار FAQ
```json
[
  {
    "question": "سوال متداول",
    "answer": "پاسخ سوال"
  }
]
```

### ساختار نظرات
```json
[
  {
    "name": "نام کاربر",
    "comment": "نظر کاربر",
    "created_at": "2025-01-01T00:00:00.000Z",
    "likes": 5,
    "dislikes": 0,
    "replies": [
      {
        "name": "نام پاسخ‌دهنده",
        "comment": "پاسخ",
        "created_at": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
]
```

## احراز هویت

تمام مسیرهای ادمین نیاز به:
1. **توکن احراز هویت** در header: `Authorization: Bearer <token>`
2. **دسترسی ادمین** (role: admin یا superadmin)

## خطاها

### کدهای خطا
- `400`: اطلاعات ناقص یا نامعتبر
- `401`: عدم احراز هویت
- `403`: عدم دسترسی ادمین
- `404`: مقاله یافت نشد
- `500`: خطای داخلی سرور

### نمونه پاسخ خطا
```json
{
  "error": "پیام خطا"
}
```

## نکات مهم

1. **اعتبارسنجی**: تمام فیلدهای الزامی باید پر شوند
2. **JSON Fields**: فیلدهای `tags`, `contentSections`, `faq`, `reviews` به صورت JSON ذخیره می‌شوند
3. **تاریخ‌ها**: تمام تاریخ‌ها به صورت UTC ذخیره می‌شوند
4. **ایندکس‌ها**: برای بهبود عملکرد، ایندکس‌هایی روی فیلدهای مهم ایجاد شده
5. **CORS**: سرور برای دامنه‌های مجاز CORS پیکربندی شده

## تست API

### با curl
```bash
# دریافت مقالات
curl -X GET "http://localhost:8888/api/v1/articles"

# ایجاد مقاله (نیاز به توکن)
curl -X POST "http://localhost:8888/api/v1/admin/articles" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"مقاله تست","excerpt":"خلاصه","description":"توضیحات"}'
```

### با Postman
1. Import کردن collection
2. تنظیم متغیر `base_url` به `http://localhost:8888`
3. تنظیم متغیر `auth_token` برای مسیرهای ادمین
