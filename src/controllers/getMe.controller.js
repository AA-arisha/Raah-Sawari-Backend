import prisma from "../utils/db.js";

export const getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      driver: {
        select: {
          id: true,
          userId: true,
          vehicleType: true,
          isAvailable: true,
          currentRideId: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.role === "DRIVER") {
    return res.json(user);
  }

  const { driver, ...rider } = user;
  return res.json(rider);
};