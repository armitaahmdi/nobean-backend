const jwt = require("jsonwebtoken");

const secretKey = 'sldkjfsjdsjdfljsdj';

// تولید توکن
module.exports.generateToken = (userId) => {
  try {
    //, { expiresIn: "7d" }
    return jwt.sign({ id: userId }, secretKey);
  } catch (err) {
    console.error("خطا در تولید توکن:", err);
    throw new Error("توکن تولید نشد");
  }
}

// بررسی و اعتبارسنجی توکن
module.exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    console.error("خطا در اعتبارسنجی توکن:", err);
    throw new Error("توکن نامعتبر یا منقضی شده");
  }
}
