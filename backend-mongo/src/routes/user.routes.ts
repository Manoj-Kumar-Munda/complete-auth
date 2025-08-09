import { Router } from "express";
import {
  login,
  registerUser,
  verifyUser,
} from "../controllers/user.controller";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/verify/:token").get(verifyUser);
userRouter.route("/login").post(login);

export default userRouter;
