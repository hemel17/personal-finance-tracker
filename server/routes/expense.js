import express from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.js";

const router = express.Router();

// Create new expense
router.post("/add", authenticate, createExpense);

// Get all expenses with optional filters
router.get("/all", authenticate, getExpenses);

// Get specific expense by ID
router.get("/:id", authenticate, getExpenseById);

// Update expense
router.patch("/update/:id", authenticate, updateExpense);

// Delete expense
router.delete("/delete/:id", authenticate, deleteExpense);

export default router;
