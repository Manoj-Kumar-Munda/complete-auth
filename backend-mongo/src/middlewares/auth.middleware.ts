import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import jwt from "jsonwebtoken";

export const isLoggedIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req?.cookies.accessToken || req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new ApiError(401, "Unauthorized");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = decoded;

      next();
    } catch (error) {
      next(error || new ApiError(500, "Internal Server Error"));
    }
  }
);
