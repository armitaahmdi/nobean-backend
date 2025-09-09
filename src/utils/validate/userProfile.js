const  {body , validationResult} = require ("express-validator")
const db = require("../../model/index")
const user  =db.User

exports.validatComplitProfile = [
     body("firstName")
        .trim()
        .notEmpty().withMessage(" وجود نام الزامی است ")
        .isLength({max:20 }).withMessage("نام باید کمتر از 20 کارکتر داشته باشد ")
        .matches (/^[a-zA-Zآ-ی\s]+$/).withMessage("نام فقط باید شامل حروف باشد "),

      
     body("lastName")
        .trim()
        .notEmpty().withMessage(" وجود نام خانوادگی الزامی است ")
        .isLength({max:20 }).withMessage("نام باید کمتر از 20 کارکتر داشته باشد ")
        .matches (/^[a-zA-Zآ-ی\s]+$/).withMessage("نام خانوادگی فقط باید شامل حروف باشد "),


     body("userName")
        .trim()
        .notEmpty().withMessage("نام کاربری الزامی است")
        .isLength({ min: 4, max: 16 }).withMessage("نام کاربری باید بین ۴ تا ۱۶ کاراکتر باشد")
        .custom(async (valiu) => {
        const User = await user.findOne({
         where: {
           userName: valiu
  }
});
console.log(User);

            if (User){
                 throw new Error("این نام کاربری قبلاً استفاده شده است");
            }
        }),


     body("email")
        .trim()
        .isEmail().withMessage("ساختار ایمیل معتبر نیست"),


     body("age")
        .trim()
        .notEmpty().withMessage("سن الزامی است")
        .isInt({ min: 1, max: 120 }).withMessage("سن باید بین 1 تا 120 باشد"),

      (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // بدون خطا برو سراغ کنترلر
  },
]






exports.validateEditProfile = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage("نام باید کمتر از 20 کارکتر داشته باشد ")
    .matches(/^[a-zA-Zآ-ی\s]+$/).withMessage("نام فقط باید شامل حروف باشد "),

  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage("نام خانوادگی باید کمتر از 20 کارکتر داشته باشد ")
    .matches(/^[a-zA-Zآ-ی\s]+$/).withMessage("نام خانوادگی فقط باید شامل حروف باشد "),

  body("userName")
    .optional()
    .trim()
    .isLength({ min: 4, max: 16 }).withMessage("نام کاربری باید بین ۴ تا ۱۶ کاراکتر باشد")
    .custom(async (value, { req }) => {
      const existingUser = await user.findOne({ where: { userName: value } });
      if (existingUser && existingUser.id !== req.user.id) {
        throw new Error("این نام کاربری قبلاً استفاده شده است");
      }
      return true;
    }),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("ساختار ایمیل معتبر نیست")
    .custom(async (value, { req }) => {
      const existingEmail = await user.findOne({ where: { email: value } });
      if (existingEmail && existingEmail.id !== req.user.id) {
        throw new Error("این ایمیل قبلاً استفاده شده است");
      }
      return true;
    }),

  body("age")
    .optional()
    .isInt({ min: 1, max: 120 }).withMessage("سن باید بین 1 تا 120 باشد"),

  // آخر برای هندل ارورها
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
