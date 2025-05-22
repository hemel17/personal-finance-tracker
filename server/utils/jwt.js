import jwt from "jsonwebtoken";

const generateAccessToken = (payload, secretKey) => {
  return jwt.sign(payload, secretKey, { expiresIn: "1d" });
};

const generateRefreshToken = (payload, secretKey) => {
  return jwt.sign(payload, secretKey, { expiresIn: "7d" });
};

export { generateAccessToken, generateRefreshToken };
