import express from "express";
import { protect } from "../middlewares/protect.js";
import { getMe } from "../controllers/getMe.controller.js";


const router = express.Router();

// routes
router.get("/", protect, getMe);

export default router;