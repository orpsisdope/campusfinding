const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authorization = req.get("authorization") || "";

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Login required."
    });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Login required."
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: "Invalid token."
      });
    }

    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
}

module.exports = authenticate;