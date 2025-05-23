import { Router } from "express";
const router = Router();
import mongoose from "mongoose";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import incomeRouter from "./income.js";
import expenseRouter from "./expense.js";

router.use("/api/auth", authRouter);
router.use("/api/user", userRouter);
router.use("/api/income", incomeRouter);
router.use("/api/expense", expenseRouter);

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
  });
});

router.get("/health", (_req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    database: dbStatus,
    timeStamp: new Date().toLocaleString(),
  });
});

export default router;
