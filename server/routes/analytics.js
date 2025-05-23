import express from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  getSpendingTrends,
  getBudgetPerformance,
  getGoalProgress,
  getCategoryDistribution,
} from "../controllers/analytics.js";

const router = express.Router();

// Get spending trends with optional filters and grouping
router.get("/trends", authenticate, getSpendingTrends);

// Get budget performance analysis
router.get("/budget-performance", authenticate, getBudgetPerformance);

// Get financial goals progress
router.get("/goal-progress", authenticate, getGoalProgress);

// Get expense distribution by category
router.get("/category-distribution", authenticate, getCategoryDistribution);

export default router;
