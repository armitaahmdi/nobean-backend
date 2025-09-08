const { body, validationResult } = require("express-validator");

// ولیدیشن برای اضافه کردن آیتم به سبد
exports.validateAddToCart = [
  body("productId")
     .trim()
    .notEmpty().withMessage("شناسه محصول الزامی است")
    .isInt({ gt: 0 }).withMessage("شناسه محصول باید عددی مثبت باشد"),
  
  body("quantity")
    .trim()
    .notEmpty().withMessage("تعداد محصول الزامی است")
    .isInt({ gt: 0 }).withMessage("تعداد محصول باید عددی بزرگتر از صفر باشد"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// ولیدیشن برای ویرایش آیتم سبد
exports.validateUpdateCartItem = [
  body("quantity")
     .trim()
    .notEmpty().withMessage("تعداد محصول الزامی است")
    .isInt({ gt: 0 }).withMessage("تعداد محصول باید عددی بزرگتر از صفر باشد"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
