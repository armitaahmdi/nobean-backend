const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_PASSWORD;

// تولید توکن
module.exports.generateToken = (userId) => {
  try {
    
    return jwt.sign({ id: userId }, secretKey, { expiresIn: "7d" });
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
