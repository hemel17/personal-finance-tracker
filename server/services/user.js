import User from "../models/User.js";
import createError from "../utils/error.js";

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw createError("User not found", 404);
  }
  return user;
};

export const updateUserProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createError("User not found", 404);
  }

  // Handle password change
  if (updates.newPassword) {
    const isValidPassword = await user.comparePassword(updates.currentPassword);
    if (!isValidPassword) {
      throw createError("Current password is incorrect", 400);
    }
    user.password = updates.newPassword;
  }

  // Handle email change
  if (updates.email && updates.email !== user.email) {
    const emailExists = await User.findOne({ email: updates.email });
    if (emailExists) {
      throw createError("Email already in use", 400);
    }
    user.email = updates.email;
  }

  // Update name
  if (updates.name) {
    user.name = updates.name;
  }

  await user.save();

  const updatedUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
  };

  return { message: "Profile updated successfully", updatedUser };
};
