import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import locationRoutes from "./routes/location.routes.js";
import rideRoutes from "./routes/rideRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/ride", rideRoutes);
// Global error handler middleware (must be last)
app.use(errorHandler);
app.use("/api/location", locationRoutes);
export default app;