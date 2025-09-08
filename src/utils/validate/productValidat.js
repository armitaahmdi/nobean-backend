const { body, validationResult } = require("express-validator");

exports.validateProduct = [
  // نام محصول
  body("name")
    .trim()
    .notEmpty()
    .withMessage("نام محصول الزامی است")
    .isLength({ max: 100 })
    .withMessage("نام محصول باید کمتر از 100 کاراکتر باشد"),

  // قیمت محصول
  body("price")
    .notEmpty()
    .withMessage("قیمت محصول الزامی است")
    .isFloat({ min: 0 })
    .withMessage("قیمت باید عددی بزرگتر یا مساوی صفر باشد"),

  // تعداد موجودی
  body("count")
    .optional()
    .isInt({ min: 0 })
    .withMessage("تعداد محصول باید عدد صحیح بزرگتر یا مساوی صفر باشد"),

  // توضیحات محصول
  body("description")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("توضیحات نمی‌تواند بیشتر از 5000 کاراکتر باشد"),

  // آدرس تصویر
  body("imageUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("آدرس تصویر معتبر نیست"),

  // تخفیف
  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("تخفیف باید عددی بزرگتر یا مساوی صفر باشد"),

  // تاریخ ایجاد (اختیاری، نباید در آینده باشد)
  body("createdAt")
    .optional()
    .isISO8601()
    .withMessage("تاریخ ایجاد نامعتبر است")
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error("تاریخ ایجاد نمی‌تواند در آینده باشد");
      }
      return true;
    }),

  // تاریخ بروزرسانی (اختیاری، نباید در آینده باشد)
  body("updatedAt")
    .optional()
    .isISO8601()
    .withMessage("تاریخ بروزرسانی نامعتبر است")
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error("تاریخ بروزرسانی نمی‌تواند در آینده باشد");
      }
      return true;
    }),

  // middleware نهایی برای بررسی خطاها
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
