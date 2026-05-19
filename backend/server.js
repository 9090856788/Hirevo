import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import dbConnect from "./db/dbConnect.js";
import authRouter from "./routes/authRoutes.js";

const PORT = process.env.PORT || 3000;
const app = express();

// DB
dbConnect();
// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} ):`);
});
