import app from "./app";
import dotenv from "dotenv";
import connectDB from "./db";

dotenv.config();
const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    console.log("Database connection established.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
