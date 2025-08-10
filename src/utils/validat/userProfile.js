const  {body , validationResult} = require ("express-validator")
const db = require("./../../model/index")
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


     body("password")
        .notEmpty().withMessage("رمز عبور الزامی است")
        .isLength({ min: 6 }).withMessage("رمز عبور باید حداقل ۶ کاراکتر باشد"),

     body("copassword")
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("رمز عبور و تکرار آن یکسان نیستند");
          }
          return true;
    }),


      (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // بدون خطا برو سراغ کنترلر
  },
]