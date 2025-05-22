import asyncHandler from "../middlewares/asyncHandler.js";
import { validate } from "../middlewares/validator.js";
import * as authService from "../services/auth.js";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.js";

export const register = [
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.validatedData);
    res.status(201).json(result);
  }),
];

export const login = [
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { user, tokens } = await authService.login(req.validatedData);

    res.cookie("token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ user });
  }),
];

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const result = await authService.verifyEmail(token);
  res.status(200).json(result);
});

export const forgotPassword = [
  validate(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.validatedData.email);
    res.status(200).json(result);
  }),
];

export const resetPassword = [
  validate(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    const result = await authService.resetPassword(
      token,
      req.validatedData.password
    );
    res.status(200).json(result);
  }),
];

export const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.user._id);

  res.clearCookie("token");
  res.clearCookie("refreshToken");

  res.status(200).json(result);
});
