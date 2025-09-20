// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) return res.status(401).json({ message: "توکن یافت نشد" });

//   try {
//     const decoded = jwt.verify(token,process.env.JWT_PASSWORD);
//     console.log("Decoded token:", decoded);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "توکن نامعتبر است" });
//   }
// };

const jwt = require("jsonwebtoken");
const db = require("./../model/index");
const User = db.User;

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "توکن یافت نشد" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_PASSWORD);
    console.log("Decoded token:", decoded);

    // Get user from database to include phone
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "کاربر یافت نشد" });
    }

    req.user = {
      id: user.id,
      phone: user.phone,
      role: user.role
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(403).json({ message: "توکن نامعتبر است" });
  }
};
