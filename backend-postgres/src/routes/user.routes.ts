import express from "express";
import { registerUser, verifyUser } from "../controllers/user.controllers";

const router = express.Router();

// Import user controller functions
router.route("/register").post(registerUser);
router.route("/verify/:token").get(verifyUser);

export default router;
