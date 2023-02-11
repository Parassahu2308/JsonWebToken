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
      password: user.password,
      accessToken: accessToken,
    });
  } else {
    res.status(400).json({
      msg: "User & Password incorrect",
    });
  }
});

app.listen(5000, () => {
  console.log("Backend server is running!");
});
