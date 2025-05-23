import { Router } from "express";
const router = Router();
import authenticate from "../middlewares/authenticate.js";
import { getProfile, updateProfile } from "../controllers/user.js";

// User profile routes
router.get("/profile", authenticate, getProfile);
router.patch("/update", authenticate, updateProfile);

export default router;
