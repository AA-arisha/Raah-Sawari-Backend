import prisma from "../utils/db.js";

export const toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    // validation
    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "isAvailable must be true or false",
      });
    }

    // find driver
    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    // update availability
    const updatedDriver = await prisma.driver.update({
      where: {
        userId: req.user.id,
      },
      data: {
        isAvailable,
      },
    });

    return res.status(200).json({
      message: `Driver is now ${
        isAvailable ? "available" : "offline"
      }`,
      driver: updatedDriver,
    });
  } catch (error) {
    console.error("Toggle availability error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};