import bcrypt from "bcrypt";
import prisma from "../utils/db.js";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

// REGISTER
export const registerUser = async (data) => {
  const {
    name,
    email,
    password,
    role: rawRole,         // ✅ FIX #1: destructure as rawRole to avoid const reassignment
    vehicleType,
    vehicleModel,
    vehicleNumber,
    vehicleColor,
    cnicFront,             // now a Cloudinary URL string
    license,               // now a Cloudinary URL string
  } = data;

  const role = rawRole?.toUpperCase();  // ✅ FIX #1: assign to new const

  // ✅ FIX #2: role is already uppercased, Joi enum "RIDER"/"DRIVER" will match
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("User already exists", 400);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: role === "RIDER" ? true : false, // driver needs admin approval
    },
  });

  // DRIVER PROFILE
  if (role === "DRIVER") {
    await prisma.driverProfile.create({
      data: {
        userId: user.id,
        vehicleType,
        vehicleModel,
        vehicleNumber,
        vehicleColor,
        cnicFront,   // ✅ FIX #4: Cloudinary URL string
        license,     // ✅ FIX #4: Cloudinary URL string
        // ✅ FIX #3: cnicBack removed entirely
      },
    });
  }

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new AppError("Invalid email or password", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

  if (!user.isVerified) {
    throw new AppError("Account not verified by admin", 403);
  }

  const token = generateToken({ id: user.id, role: user.role });

  return { user, token };
};
