import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import User from "../models/User.model";
import { generateRandomString } from "../utils/helpers";
import { sendEmail } from "../services/mail.service";
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
        username,
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
      const subject = "Verify your email";
      const body = `Please verify your email by clicking on the following link: ${process.env.CORS_ORIGIN}/api/v1/users/verify/${verificationToken}`;
      await sendEmail(email, subject, body);

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
        username: userEmailOrUsername,
      });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      if (!user.isVerified) {
        throw new ApiError(401, "Please verify your email");
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
        process.env.JWT_REFRESH_SECRET!,
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

const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Logout successful"));
    } catch (error) {
      next(new ApiError(500, "Internal Server Error"));
    }
  }
);

const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const resetToken = generateRandomString();
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Send email -> will send a frontend url in future
      const subject = "Password Reset";
      const body = `Click on the following link to reset your password: ${process.env.CORS_ORIGIN}/api/v1/users/reset-password/${resetToken}`;
      await sendEmail(email, subject, body);

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Password reset email sent"));
    } catch (error) {
      next(error || new ApiError(500, "Internal Server Error"));
    }
  }
);

const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req?.params;
      const { newPassword, confirmPassword } = req?.body;

      if (!token) {
        throw new ApiError(400, "Invalid token");
      }
      if (!newPassword || !confirmPassword) {
        throw new ApiError(400, "All fields are required");
      }

      if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match");
      }

      // Find user by token
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new ApiError(404, "Invalid or expired token");
      }

      // Update password and reset fields, then save
      user.password = newPassword;
      user.resetPasswordToken = "";
      user.resetPasswordExpires = new Date(0);
      await user.save();

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Password reset successful"));
    } catch (error) {
      next(error || new ApiError(500, "Internal Server Error"));
    }
  }
);
export {
  registerUser,
  verifyUser,
  login,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
};
