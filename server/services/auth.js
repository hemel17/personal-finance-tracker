import User from "../models/User.js";
import createError from "../utils/error.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendEmail, emailTemplates } from "../utils/email.js";
import jwt from "jsonwebtoken";

export const register = async (userData) => {
  const { name, email, password } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError("Email already registered", 400);
  }

  const user = new User({
    name,
    email,
    password,
    verified: false,
  });

  await user.save();

  // Generate verification token
  const verificationToken = await generateAccessToken(
    { userId: user._id },
    process.env.SECRET_KEY
  );

  // Send verification email
  await sendEmail({
    to: user.email,
    ...emailTemplates.verifyEmail(verificationToken),
  });

  return {
    message: "Registration successful. Please verify your email.",
  };
};

export const login = async (credentials) => {
  const { email, password } = credentials;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw createError("Invalid credentials", 401);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createError("Invalid credentials", 401);
  }

  if (!user.isEmailVerified) {
    throw createError("Please verify your email first", 401);
  }

  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    role: user.role,
  };

  const accessToken = await generateAccessToken(
    payload,
    process.env.SECRET_KEY
  );
  const refreshToken = await generateRefreshToken(
    payload,
    process.env.SECRET_KEY
  );

  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  return {
    user: payload,
    tokens: { accessToken, refreshToken },
  };
};

export const verifyEmail = async (token) => {
  try {
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw createError("Invalid verification token", 400);
    }

    if (user.verified) {
      throw createError("Email already verified", 400);
    }

    user.isEmailVerified = true;
    await user.save({ validateModifiedOnly: true });

    return { message: "Email verified successfully" };
  } catch (error) {
    throw createError("Invalid or expired verification token", 400);
  }
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError("User not found", 404);
  }

  const resetToken = await generateAccessToken(
    { userId: user._id },
    process.env.SECRET_KEY
  );

  await sendEmail({
    to: user.email,
    ...emailTemplates.resetPassword(resetToken),
  });

  return { message: "Password reset instructions sent to your email" };
};

export const resetPassword = async (token, newPassword) => {
  try {
    const decoded = await jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw createError("Invalid reset token", 400);
    }

    user.password = newPassword;
    await user.save();

    return { message: "Password reset successful" };
  } catch (error) {
    throw createError("Invalid or expired reset token", 400);
  }
};

export const logout = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createError("User not found", 404);
  }

  user.refreshToken = null;
  await user.save({ validateModifiedOnly: true });

  return { message: "Logged out successfully" };
};
