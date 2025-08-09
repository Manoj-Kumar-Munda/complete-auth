import express, { NextFunction, Response, Request } from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/apiError";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8000",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/users", userRouter);
app.use("/", (req, res) => {
  res.send("Welcome to the backend-mongo application!");
});

app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});

export default app;
