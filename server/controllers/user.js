import { updateProfileSchema } from "../schemas/user.js";
import { getUserProfile, updateUserProfile } from "../services/user.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validator.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user._id);
  res.json(user);
});

export const updateProfile = [
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const updates = req.validatedData;
    const { message, updatedUser } = await updateUserProfile(
      req.user._id,
      updates
    );

    res.status(200).json({
      message,
      updatedUser,
    });
  }),
];
