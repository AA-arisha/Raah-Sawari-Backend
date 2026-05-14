import express from "express";
import { protect } from "../middlewares/protect.js";
import { toggleAvailability } from "../controllers/driver.controller.js";

const router = express.Router();

router.patch("/availability", protect, toggleAvailability);

export default router;