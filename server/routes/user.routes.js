const express = require("express");
const router = express.Router();
const { z } = require("zod");
const auth = require("../middleware/auth.middleware");
const User = require("../models/user.model");

// Validation schema
const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().min(6).optional(),
    newPassword: z.string().min(6).optional(),
  })
  .refine((data) => {
    if (data.newPassword && !data.currentPassword) {
      throw new Error("Current password is required to set new password");
    }
    return true;
  });

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Update user profile
router.patch("/profile", auth, async (req, res) => {
  try {
    const updates = updateProfileSchema.parse(req.body);
    const user = req.user;

    // Handle password change
    if (updates.newPassword) {
      const isValidPassword = await user.comparePassword(
        updates.currentPassword
      );
      if (!isValidPassword) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
      user.password = updates.newPassword;
    }

    // Handle email change
    if (updates.email && updates.email !== user.email) {
      const emailExists = await User.findOne({ email: updates.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = updates.email;
      user.isEmailVerified = false;
      // TODO: Send verification email for new email address
    }

    // Update name
    if (updates.name) {
      user.name = updates.name;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
