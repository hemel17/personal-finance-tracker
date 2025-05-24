import express from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} from "../controllers/goal.js";

const router = express.Router();

router.use(authenticate);

router.post("/add", createGoal);
router.get("/all", getGoals);
router.get("/:goalId", getGoalById);
router.patch("/update/:goalId", updateGoal);
router.delete("/delete/:goalId", deleteGoal);

export default router;
