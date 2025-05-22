import { Router } from "express";
const router = Router();
import authenticate from "../middlewares/authenticate.js";
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/auth.js";

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.post("/logout", authenticate, logout);

export default router;
