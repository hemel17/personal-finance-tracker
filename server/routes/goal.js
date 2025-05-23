import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} from "../controllers/goal.js";

const router = express.Router();

router.use(auth);

router.post("/", createGoal);
router.get("/", getGoals);
router.get("/:goalId", getGoalById);
router.patch("/:goalId", updateGoal);
router.delete("/:goalId", deleteGoal);

export default router;
