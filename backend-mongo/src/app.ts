import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8000",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);
app.use("/", (req, res) => {
  res.send("Welcome to the backend-mongo application!");
});

export default app;
