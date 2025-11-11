const jwt = require("jsonwebtoken");
const db = require("./../model/index");
const User = db.User;

// Optional authentication - اگر token وجود داشت، user رو ست می‌کنه، وگرنه req.user = null
module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_PASSWORD);
    console.log("Decoded token (optional):", decoded);

    // Get user from database to include phone
    const user = await User.findByPk(decoded.id);
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = {
      id: user.id,
      phone: user.phone,
      role: user.role
    };

    next();
  } catch (err) {
    console.error("Optional auth middleware error:", err);
    // در صورت خطا، user رو null می‌ذاریم و ادامه می‌دیم
    req.user = null;
    next();
  }
};

