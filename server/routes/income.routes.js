const express = require("express");
const router = express.Router();
const { z } = require("zod");
const auth = require("../middleware/auth.middleware");
const Income = require("../models/income.model");
const { sendEmail, emailTemplates } = require("../utils/email");

// Validation schema
const incomeSchema = z.object({
  amount: z.number().positive(),
  source: z.enum(["Salary", "Freelance", "Investments", "Other"]),
  date: z.string().transform((str) => new Date(str)),
  paymentMethod: z.enum(["Bank", "Cash", "Credit Card"]),
  description: z.string().max(200).optional(),
});

// Create income
router.post("/", auth, async (req, res) => {
  try {
    const incomeData = incomeSchema.parse(req.body);
    const income = new Income({
      ...incomeData,
      user: req.user._id,
    });

    await income.save();

    // Send income notification
    await sendEmail({
      to: req.user.email,
      ...emailTemplates.incomeRecorded(income),
    });

    res.status(201).json(income);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Failed to create income record" });
  }
});

// Get all income records with filters
router.get("/", auth, async (req, res) => {
  try {
    const { month, source, paymentMethod, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };

    // Apply filters
    if (month) {
      const date = new Date(month);
      query.date = {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      };
    }
    if (source) query.source = source;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const skip = (page - 1) * limit;

    const [incomes, total] = await Promise.all([
      Income.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Income.countDocuments(query),
    ]);

    res.json({
      incomes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch income records" });
  }
});

// Get single income record
router.get("/:id", auth, async (req, res) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: "Income record not found" });
    }

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch income record" });
  }
});

// Update income record
router.patch("/:id", auth, async (req, res) => {
  try {
    const updates = incomeSchema.partial().parse(req.body);
    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: "Income record not found" });
    }

    Object.assign(income, updates);
    await income.save();

    res.json(income);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Failed to update income record" });
  }
});

// Delete income record
router.delete("/:id", auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: "Income record not found" });
    }

    res.json({ message: "Income record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete income record" });
  }
});

module.exports = router;
