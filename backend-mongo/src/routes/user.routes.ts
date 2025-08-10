import { Router } from "express";
import {
  forgotPassword,
  getCurrentUser,
  login,
  logoutUser,
  registerUser,
  resetPassword,
  verifyUser,
} from "../controllers/user.controller";
import { isLoggedIn } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/verify/:token").get(verifyUser);
userRouter.route("/login").post(login);
userRouter.route("/me").get(isLoggedIn, getCurrentUser);
userRouter.route("/logout").post(isLoggedIn, logoutUser);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/reset-password/:token").post(resetPassword);

export default userRouter;
