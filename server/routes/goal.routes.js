const express = require("express");
const router = express.Router();
const { z } = require("zod");
const auth = require("../middleware/auth.middleware");
const Goal = require("../models/goal.model");

// Validation schema
const goalSchema = z.object({
  name: z.string().min(2).max(100),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional(),
  startDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  targetDate: z.string().transform((str) => new Date(str)),
  category: z.enum([
    "Vacation",
    "Emergency Fund",
    "Education",
    "Home",
    "Vehicle",
    "Other",
  ]),
});

// Create goal
router.post("/", auth, async (req, res) => {
  try {
    const goalData = goalSchema.parse(req.body);
    const goal = new Goal({
      ...goalData,
      user: req.user._id,
      currentAmount: goalData.currentAmount || 0,
      startDate: goalData.startDate || new Date(),
      status: "In Progress",
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Failed to create goal" });
  }
});

// Get all goals
router.get("/", auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    const goals = await Goal.find(query).sort({ targetDate: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

// Get single goal
router.get("/:id", auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch goal" });
  }
});

// Update goal
router.patch("/:id", auth, async (req, res) => {
  try {
    const updates = goalSchema.partial().parse(req.body);
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Update goal fields
    Object.assign(goal, updates);

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = "Completed";
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Failed to update goal" });
  }
});

// Update goal progress
router.patch("/:id/progress", auth, async (req, res) => {
  try {
    const { currentAmount } = z
      .object({
        currentAmount: z.number().min(0),
      })
      .parse(req.body);

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.currentAmount = currentAmount;

    // Update status based on progress
    if (currentAmount >= goal.targetAmount) {
      goal.status = "Completed";
    } else {
      goal.status = "In Progress";
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Failed to update goal progress" });
  }
});

// Delete goal
router.delete("/:id", auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

module.exports = router;
