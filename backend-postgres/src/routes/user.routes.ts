import express from "express";
import { registerUser } from "../controllers/user.controllers";

const router = express.Router();

// Import user controller functions
router.route("/register").post(registerUser);

export default router;
