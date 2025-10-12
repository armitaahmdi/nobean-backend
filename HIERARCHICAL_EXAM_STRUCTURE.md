# ساختار سلسله‌مراتبی آزمون‌ها

## تغییرات اعمال شده

سیستم آزمون‌ها به ساختار سلسله‌مراتبی تبدیل شده است که شامل موارد زیر می‌باشد:

### ساختار جدید:
1. **آزمون (Exam)** - ریشه اصلی
2. **حیطه (Domain)** - زیرمجموعه آزمون
3. **مولفه (Component)** - زیرمجموعه حیطه
4. **سوال (Question)** - متعلق به مولفه

### جداول جدید:

#### جدول `domains` (حیطه‌ها):
- `id` - شناسه یکتا
- `examId` - شناسه آزمون مربوطه
- `name` - نام حیطه
- `description` - توضیحات حیطه
- `order` - ترتیب نمایش

#### جدول `components` (مولفه‌ها):
- `id` - شناسه یکتا
- `domainId` - شناسه حیطه مربوطه
- `name` - نام مولفه
- `description` - توضیحات مولفه
- `order` - ترتیب نمایش

#### تغییرات جدول `questions`:
- اضافه شدن `componentId` - شناسه مولفه مربوطه
- اضافه شدن `questionNumber` - شماره سوال در آزمون
- حذف فیلد `component` (رشته)

## API های جدید

### مدیریت حیطه‌ها:

#### ایجاد حیطه:
```
POST /api/tests/domains
{
  "examId": 1,
  "name": "حیطه شناختی",
  "description": "سوالات مربوط به مهارت‌های شناختی",
  "order": 0
}
```

#### دریافت حیطه‌های یک آزمون:
```
GET /api/tests/exams/:examId/domains
```

#### به‌روزرسانی حیطه:
```
PUT /api/tests/domains/:id
{
  "name": "حیطه شناختی جدید",
  "description": "توضیحات جدید",
  "order": 1
}
```

#### حذف حیطه:
```
DELETE /api/tests/domains/:id
```

### مدیریت مولفه‌ها:

#### ایجاد مولفه:
```
POST /api/tests/components
{
  "domainId": 1,
  "name": "حافظه",
  "description": "سوالات مربوط به حافظه",
  "order": 0
}
```

#### دریافت مولفه‌های یک حیطه:
```
GET /api/tests/domains/:domainId/components
```

#### به‌روزرسانی مولفه:
```
PUT /api/tests/components/:id
{
  "name": "حافظه کوتاه مدت",
  "description": "توضیحات جدید",
  "order": 1
}
```

#### حذف مولفه:
```
DELETE /api/tests/components/:id
```

### تغییرات API سوالات:

#### ایجاد سوال جدید:
```
POST /api/tests/:id/questions
{
  "title": "متن سوال",
  "items": ["گزینه 1", "گزینه 2", "گزینه 3"],
  "weights": [1, 2, 3],
  "componentId": 1,
  "questionNumber": 1
}
```

#### به‌روزرسانی سوال:
```
PUT /api/tests/:id/questions/:questionId
{
  "title": "متن سوال جدید",
  "items": ["گزینه جدید 1", "گزینه جدید 2"],
  "weights": [2, 3],
  "componentId": 2,
  "questionNumber": 2
}
```

## نحوه اجرای تغییرات

### مرحله 1: اجرای SQL
```bash
mysql -u username -p database_name < setup-hierarchical-structure.sql
```

### مرحله 2: اجرای Migration
```bash
node migrate-exam-structure.js
```

### مرحله 3: تست API ها
از API های جدید برای ایجاد حیطه‌ها و مولفه‌ها استفاده کنید.

## مثال استفاده

### ایجاد یک آزمون کامل:

1. **ایجاد آزمون:**
```javascript
POST /api/tests
{
  "title": "آزمون هوش کودکان",
  "time": 60,
  "mainDescription": "آزمون جامع هوش",
  "ShortDescription": "سنجش هوش",
  "target_audience": "ویژه فرزندان",
  "price": 0
}
```

2. **ایجاد حیطه:**
```javascript
POST /api/tests/domains
{
  "examId": 1,
  "name": "هوش کلامی",
  "order": 0
}
```

3. **ایجاد مولفه:**
```javascript
POST /api/tests/components
{
  "domainId": 1,
  "name": "درک کلامی",
  "order": 0
}
```

4. **ایجاد سوال:**
```javascript
POST /api/tests/1/questions
{
  "title": "کدام کلمه با بقیه متفاوت است؟",
  "items": ["سیب", "موز", "ماشین", "پرتقال"],
  "weights": [1, 1, 3, 1],
  "componentId": 1,
  "questionNumber": 1
}
```

## مزایای ساختار جدید

1. **سازماندهی بهتر:** سوالات به صورت سلسله‌مراتبی سازماندهی می‌شوند
2. **انعطاف‌پذیری:** امکان اضافه کردن حیطه‌ها و مولفه‌های جدید
3. **گزارش‌گیری بهتر:** امکان تحلیل نتایج بر اساس حیطه‌ها و مولفه‌ها
4. **مدیریت آسان‌تر:** امکان مدیریت جداگانه هر بخش
5. **مقیاس‌پذیری:** امکان اضافه کردن سطوح بیشتر در آینده
