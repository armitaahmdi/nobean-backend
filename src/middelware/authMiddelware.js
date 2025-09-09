const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "توکن یافت نشد" });

  try {
    const decoded = jwt.verify(token,process.env.JWT_PASSWORD);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "توکن نامعتبر است" });
  }
};
