const { users } = require("../model/users");
const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("../secret");

let refreshTokens = [];

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_KEY);
};

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_KEY, {
    expiresIn: "10s",
  });
};

module.exports.postLoginUser = function (req, res) {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    //Generate access token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    res.json({
      user: user.username,
      isAdmin: user.isAdmin,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } else {
    res.status(400).json({
      msg: "User & Password incorrect",
    });
  }
};

module.exports.refreshToken = function (req, res) {
  //taken the refresh token from the user
  const refreshToken = req.body.token;

  //send error if there is no token or its valid
  if (!refreshToken) return res.status(401).json("You are not authenticated");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid");
  }

  //if everything is ok, then create new access token, refresh token and send to the user
  jwt.verify(refreshToken, JWT_KEY, (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefershToken = generateRefreshToken(user);

    refreshTokens.push(newRefershToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefershToken,
      refreshTokens,
    });
  });
};

module.exports.deleteUser = function (req, res) {
  if (req.user.id == req.params.userId || req.user.isAdmin) {
    res.status(200).json({
      msg: "User has been deleted",
    });
  } else {
    res.status(403).json({
      msg: "You are not allowed to delete this user!",
    });
  }
};
