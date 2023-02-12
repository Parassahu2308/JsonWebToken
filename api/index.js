const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const { JWT_KEY } = require("./secret");
const { users } = require("./model/users");

let refreshTokens = [];

app.post("/api/refresh", (req, res) => {
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
});

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_KEY, {
    expiresIn: "10s",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, JWT_KEY);
};

//Login
app.post("/api/login", (req, res) => {
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
});

//Authentication
const verify = (req, res, next) => {
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

//Delete
app.delete("/api/users/:userId", verify, (req, res) => {
  if (req.user.id == req.params.userId || req.user.isAdmin) {
    res.status(200).json({
      msg: "User has been deleted",
    });
  } else {
    res.status(403).json({
      msg: "You are not allowed to delete this user!",
    });
  }
});

//logout
app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  return res.status(200).json("You Logout Successfully");
});

app.listen(5000, () => {
  console.log("Backend server is running!");
});
