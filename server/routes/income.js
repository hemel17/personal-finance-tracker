import express from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
} from "../controllers/income.js";

const router = express.Router();

// Create new income
router.post("/add", authenticate, createIncome);

// Get all incomes with optional filters
router.get("/all", authenticate, getIncomes);

// Get specific income by ID
router.get("/:id", authenticate, getIncomeById);

// Update income
router.patch("/update/:id", authenticate, updateIncome);

// Delete income
router.delete("/delete/:id", authenticate, deleteIncome);

export default router;
