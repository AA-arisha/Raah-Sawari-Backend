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
    role: rawRole,
    vehicleType,
  } = data;

  const role = (rawRole || "RIDER").toUpperCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("User already exists", 400);

  const hashedPassword = await bcrypt.hash(password, 10);


  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    if (role === "DRIVER") {
      if (!vehicleType) {
        throw new AppError("Vehicle type is required for drivers", 400);
      }

      await tx.driver.create({
        data: {
          userId: createdUser.id,
          vehicleType: vehicleType.toUpperCase(),
        },
      });
    }

    return createdUser;
  });

  return user;
};


// LOGIN
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new AppError("Invalid email or password", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

  const token = generateToken({ id: user.id, role: user.role });


  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};