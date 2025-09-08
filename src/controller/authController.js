
const {generateToken} = require("../utils/jwt")
const db = require('../model/index');
const User = db.User
const Otp = db.Otp
const axios = require('axios');
const qs = require('qs');
const bcrypt = require("bcrypt");


module.exports.sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ message: "شماره موبایل الزامی است" });

  const code = Math.floor(10000 + Math.random() * 90000);
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // ۵ دقیقه

  // ذخیره یا آپدیت OTP
  await Otp.upsert({ phone, code, expiresAt });

  const message = `به نوبین خوش آمدید. کد ورود شما ${code}`;

  try {
    await axios.get('https://panel.isms.ir/sendWS', {
      params: {
        body: message,
        username: process.env.ISMS_USERNAME,
        password: process.env.ISMS_PASSWORD,
        mobiles: phone
      },
    });

    return res.json({ message: "کد تایید با موفقیت ارسال شد" });
  } catch (error) {
    console.log("SMS API Error:", error.response?.data || error.message);
    return res.status(500).json({ message: "ارسال کد تایید با خطا مواجه شد" });
  }
};



module.exports.verifyOtp = async (req, res) => {
  try{ 
  const { code, phone } = req.body;

  if (!code || !phone) return res.status(400).json({ message: "لطفا کامل کنید" });

  const otpEntry = await Otp.findOne({ where: { phone } });
  if (!otpEntry) return res.status(401).json({ message: "کد اشتباه است." });
  if (otpEntry.code !== parseInt(code)) return res.status(401).json({ message: "کد اشتباه است." });
  if (otpEntry.expiresAt < new Date()) return res.status(401).json({ message: "کد منقضی شده است." });

  // پاک کردن OTP بعد از وریفای موفق
  await Otp.destroy({ where: { phone } });

  let user = await User.findOne({ where: { phone } });
  if (!user) user = await User.create({ phone });

  const token = generateToken(user.id);
  return res.json({ success: true, token, message: "OTP verified successfully" });
  }catch (error) {
        console.error(error);
        return res.status(500).json({ message: "خطا در سرور" });
    }

};


module.exports.completeProfile = async (req , res) => {
const userId = req.user.id    // بعد از این که کار بر داخل سایت ثبت نام کرد با توکنی که میسازی آی دی رو اینجا زخیره میکنی 
console.log(userId);

const {firstName , lastName , userName , password ,copassword, email , age ,isParent,childPhone,isFather} = req.body  
const hashedPassword = await bcrypt.hash(password, 10);
try{ 
//ایا پسورد برابر نیست با کوپسورد 
if(copassword !== password) return res.status(402).json({message:"copassword not equal"})
if(isParent){

         const UserChild = await User.findOne({ where: { phone: childPhone } });
    if (!UserChild){
        return res.status(404).json({message:"کاربری با این شماره یافت نشد "})
    }
    if(isFather){ 

        const  updated  = await User.update(
            {fatherId:userId},
            {where: {phone : childPhone}}
        )
        if (updated[0] === 0) {
                     return res.status(400).json({ message: "آپدیت انجام نشد" });
                 }
        }else {
                // اگر مادر بود
                const updated = await User.update(
                    { motherId: userId},
                    { where: { phone: childPhone } }
                );

                if (updated[0] === 0) {
                    return res.status(400).json({ message: "آپدیت انجام نشد" });
                }
            }
 }
 

    

   await User.update(
            { firstName, lastName, userName, password: hashedPassword, email, age },
            { where: { id: userId } }
        );

        return res.status(200).json({ message: "پروفایل با موفقیت تکمیل شد" });



}catch (error) {
        console.error(error);
        return res.status(500).json({ message: "خطا در سرور" });
    }
}  


module.exports.editProfile = async (req , res) => {
try {
    const userId = req.user.id; // از authMiddleware میاد
    const { firstName, lastName, userName, email, age } = req.body;

    


    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({
      firstName,
      lastName,
      userName,
      email,
      age,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Edit Profile Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



