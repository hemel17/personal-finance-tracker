import { Router } from "express";
const router = Router();
import mongoose from "mongoose";
import authRouter from "./auth.js";

router.use("/api/auth", authRouter);

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
