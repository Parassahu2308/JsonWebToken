const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());
const { JWT_KEY } = require("./secret");

const users = [
  {
    id: 1,
    username: "Paras",
    password: "paras2308",
    isAdmin: true,
  },
  {
    id: 2,
    username: "Soni",
    password: "soni2308",
    isAdmin: false,
  },
  {
    id: 3,
    username: "Kush",
    password: "kush2308",
    isAdmin: false,
  },
  {
    id: 4,
    username: "Aman",
    password: "aman2308",
    isAdmin: false,
  },
  {
    id: 5,
    username: "Deepak",
    password: "deepak2308",
    isAdmin: false,
  },
];

//Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    //Generate access token
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      JWT_KEY
    );
    res.json({
      user: user.username,
      isAdmin: user.isAdmin,
      accessToken: accessToken,
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
  // console.log(req.user.id, req.params.userId, req.user.isAdmin);
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

app.listen(5000, () => {
  console.log("Backend server is running!");
});
