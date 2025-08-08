import { Router } from "express";
import { registerUser, verifyUser } from "../controllers/user.controller";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/verify/:token").get(verifyUser);

export default userRouter;
