import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }
    
    
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { username, email },
          "User registered successfully"
        )
      );
  }
);

export { registerUser };
