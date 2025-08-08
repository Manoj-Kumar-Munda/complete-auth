import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import User from "../models/User.model";
import { generateRandomString } from "../utils/helpers";
import { sendVerificationEmail } from "../services/mail.service";

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

export { registerUser };
