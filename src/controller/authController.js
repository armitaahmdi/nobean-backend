const request = require("request")
const {generateToken} = require("../utils/jwt")
const user = require("./../model/userModel")
const  {validatComplitProfile} = require("./../utils/validat/userProfile")
const db = require('../model/index');
const User = db.User
const axios = require('axios');
const qs = require('qs');
const bcrypt = require("bcrypt");

module.exports.sendOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "شماره موبایل الزامی است" });
  }

  const code = Math.floor(10000 + Math.random() * 90000); // کد تصادفی 5 رقمی

  req.session.otp = code;
  req.session.phone = phone;

  const message = `به نوبین خوش آمدید. کد ورود شما ${code}`;

  try {
    const response = await axios.get('https://panel.isms.ir/sendWS', {
      params: {
        body: message,
        username: process.env.ISMS_USERNAME,
        password: "71f1f1c7cc8016b121bbeca372d6c7d8",
        mobiles: phone, // نه 'mobiles[0]'
      },
    });

    console.log("Username:", process.env.ISMS_USERNAME);
    console.log("Password:","\\;oiege3\\6s874g");
    console.log("OTP sent:", code);
    console.log("SMS API Response:", response.data);

    return res.json({ message: "کد تایید با موفقیت ارسال شد" });
  } catch (error) {
    console.log("SMS API Error:", error.response?.data || error.message);
    return res.status(500).json({ message: "ارسال کد تایید با خطا مواجه شد" });
  }
};

module.exports.verifyOtp=async (req ,res) => {
const { code, phone } = req.body
 
const checkCode = req.session.otp
const checkPhone = req.session.phone



if (!code || !phone){
    return res.status(401).json({message:"لطفا کامل کنید "})
}



if (parseInt(code) !== checkCode || phone !== checkPhone) {
    return res.status(401).json({ message: "کد یا شماره اشتباه است." });
  }

  let userfind =await  User.findOne({phone})

  if(!userfind){

    userfind = await User.create({ phone });
  }

  


const token = generateToken(userfind.id);
return res.json({ success: true, token, message: "OTP verified successfully" });

}

module.exports.compitProfile = async (req , res) => {
const userId = req.user.id    // بعد از این که کار بر داخل سایت ثبت نام کرد با توکنی که میسازی آی دی رو اینجا زخیره میکنی 
console.log(userId);

const {firstName , lastName , userName , password ,copassword, email , age ,isParent,childPhone,isFather} = req.body  
const hashedPassword = await bcrypt.hash(password, 10);
try{ 
if(isParent){

         const UserChilde = await User.findOne({ where: { phone: childPhone } });
    if (!UserChilde){
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
    const { firstName, lastName, userName, email, ega } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({
      firstName,
      lastName,
      userName,
      email,
      ega,
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



