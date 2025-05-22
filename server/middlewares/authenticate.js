import asyncHandler from "./asyncHandler.js";
import createError from "../utils/error.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import User from "../models/User.js";

const isAuthenticated = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(createError("Authentication required.", 401));
    }

    await jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return tryRefreshToken(req, res, next);
        }

        return next(createError("Invalid token.", 401));
      }

      const user = await User.findById(decoded._id);

      if (!user) {
        return next(createError("User no longer exists.", 401));
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error(error);
    next(createError("Authentication failed.", 500));
  }
});

async function tryRefreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(createError("Authentication required.", 401));
    }

    await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY,
      async (err, decoded) => {
        if (err) {
          return next(createError("Invalid refresh token.", 401));
        }

        const user = await findVerifiedUserById(decoded._id);

        if (!user || user.refreshToken !== refreshToken) {
          return next(createError("Invalid refresh token", 401));
        }

        const payload = {
          _id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified,
          role: user.role,
        };

        const newToken = await generateAccessToken(
          payload,
          process.env.SECRET_KEY
        );
        const newRefreshToken = await generateRefreshToken(
          payload,
          process.env.SECRET_KEY
        );

        user.refreshToken = newRefreshToken;
        await user.save({ validateModifiedOnly: true });

        res.cookie("token", newToken, {
          httpOnly: true,
          secure: false,
          maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: false,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        req.user = user;
        next();
      }
    );
  } catch (error) {
    console.error(error);
    next(createError("Authentication failed.", 500));
  }
}

export default isAuthenticated;
