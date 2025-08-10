const  {body , validationResult} = require ("express-validator")
const db = require("./../../model/index")
const Podcast  =db.Podcast
//speciolly for validat podcast in create podcast api
exports.validatPodcast = [
body('title') 
 .trim()
 .notEmpty().withMessage("وجود نام پادکست الزامی است ")
 .isLength({max:20 }).withMessage("نام باید کمتر از 20 کارکتر داشته باشد ")
 .matches (/^[a-zA-Zآ-ی\s]+$/).withMessage("نام فقط باید شامل حروف باشد "),

 body("excerpt_description")
  .trim()
  .notEmpty().withMessage("لطفا خلاصه توضیحات رو کامل کنید ")
  .isLength({ min: 10 }).withMessage("خلاصه توضیحات باید حداقل ۱۰ کاراکتر باشد")
  .isLength({ max: 1000 }).withMessage("خلاصه توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد"),

  body("description")
   .trim()
  .notEmpty().withMessage("لطفا خلاصه توضیحات رو کامل کنید ")
  .isLength({ min: 10 }).withMessage("خلاصه توضیحات باید حداقل ۱۰ کاراکتر باشد")
  .isLength({ max: 10000 }).withMessage("خلاصه توضیحات نمی‌تواند بیشتر از ۱۰۰۰۰ کاراکتر باشد"),

body("audioUrl")
  .trim()
  .notEmpty().withMessage("لطفا آدرس فایل صوتی را وارد کنید")
  .isURL().withMessage("آدرس فایل صوتی معتبر نیست")
  .matches(/\.(mp3|wav|ogg|m4a|aac|flac)$/i).withMessage("فرمت فایل صوتی باید یکی از mp3, wav, ogg, m4a, aac یا flac باشد"),

body("image")
    .trim()
    .notEmpty().withMessage("لطفا آدرس فایل  را وارد کنید")
    .isURL().withMessage("آدرس تصویر درست نیست"),

body("guest")
    .optional()
    .trim()
 .custom((arr) => arr.every(item => typeof item === 'string')).withMessage('همه مهمان‌ها باید رشته باشند')
  
  ,

 body("tags")
    .optional()
    .trim()
    .custom((value) => {
    if (!Array.isArray(value)) {
      throw new Error("فیلد tags باید آرایه باشد");
    }
    if (!value.every(tag => typeof tag === "string")) {
      throw new Error("تمام عناصر tags باید رشته باشند");
    }
    return true;
  }),
body("duration")
.trim()
.notEmpty().withMessage(" لطفا مدت زمان این پادکست را مشخص کنید")
.isNumeric().withMessage("لطفا  این فیلد را به عدد وارد کنید "),


      (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // بدون خطا برو سراغ کنترلر
  },

]