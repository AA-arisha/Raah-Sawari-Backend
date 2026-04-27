import { registerUser, loginUser } from "../services/auth.service.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res, next) => {
  // Validate request body
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const user = await registerUser(value);
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

export const login = asyncHandler(async (req, res, next) => {
  // Validate request body
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const data = await loginUser(value);
  res.json({
    success: true,
    message: "Login successful",
    data,
  });
});