import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import User from "../models/User.model";
import { generateRandomString } from "../utils/helpers";
import { sendVerificationEmail } from "../services/mail.service";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        throw new ApiError(400, "All fields are required");
      }

      //check if user already exists - check both email and username
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        throw new ApiError(400, "User already exists");
      }

      //create new user
      const newUser = await User.create({
        name: username,
        email,
        password,
      });

      if (!newUser) {
        throw new ApiError(500, "User registration failed");
      }

      //generate verification token
      const verificationToken = generateRandomString();

      newUser.verificationToken = verificationToken;
      await newUser.save();

      // Send verification email using service
      await sendVerificationEmail(email, verificationToken);

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { username, email },
            "User registered successfully"
          )
        );
    } catch (error) {
      next(error || new ApiError(500, "Internal Server Error"));
    }
  }
);

const verifyUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req?.params?.token;
      console.log(token);

      if (!token) {
        throw new ApiError(400, "Invalid token");
      }

      // Find user by verification token
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Verify user
      user.isVerified = true;
      user.verificationToken = "";
      await user.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { userId: user._id },
            "User verified successfully"
          )
        );
    } catch (error) {
      next(error || new ApiError(500, "Internal Server Error"));
    }
  }
);

const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmailOrUsername, password } = req.body;

      if (!userEmailOrUsername || !password) {
        throw new ApiError(400, "All fields are required");
      }

      // Check if user exists
      const user = await User.findOne({
        $or: [
          { email: userEmailOrUsername },
          { username: userEmailOrUsername },
        ],
      });
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password!);
      if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
      }

      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        {
          expiresIn: "1d",
        }
      );

      const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        {
          expiresIn: "30d",
        }
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, { userId: user._id }, "Login successful"));
    } catch (error) {
      next(error || new ApiError(500, "Internal Server Error"));
    }
  }
);

const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {      
      const userId = req.user?.userId;

      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const user = await User.findById(userId).select("-password");
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, user, "User retrieved successfully"));
    } catch (error) {
      next(error || new ApiError(500, "Internal Server Error"));
    }
  }
);

export { registerUser, verifyUser, login, getCurrentUser };
