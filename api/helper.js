const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("./secret");

module.exports.verify = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader;
    jwt.verify(token, JWT_KEY, (err, user) => {
      if (err) {
        res.status(403).json({
          msg: "Token is not valid!",
        });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({
      msg: "You are not authenticated!",
    });
  }
};
