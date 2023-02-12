const {
  postLoginUser,
  refreshToken,
  deleteUser,
} = require("../controller/userController");
const { verify } = require("../helper");

const userRouter = require("express").Router();

//Login
userRouter.route("/login").post(postLoginUser);

//Refresh Token
userRouter.route("/refresh").post(refreshToken);

userRouter.use(verify);
userRouter.route("/users/:userId").delete(deleteUser);

module.exports = userRouter;
