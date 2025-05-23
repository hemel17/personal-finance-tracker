import express from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createBudget,
  getBudgets,
  getBudgetByCategory,
  updateBudget,
  deleteBudget,
} from "../controllers/budget.js";

const router = express.Router();

// Create or update budget
router.post("/add", authenticate, createBudget);

// Get all budgets for a month
router.get("/all", authenticate, getBudgets);

// Get budget by category and month
router.get("/:category", authenticate, getBudgetByCategory);

// Update budget
router.patch("/:category", authenticate, updateBudget);

// Delete budget
router.delete("/:category", authenticate, deleteBudget);

export default router;
