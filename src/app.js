import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import locationRoutes from "./routes/location.routes.js";
import rideRoutes from "./routes/rideRoutes.js";
import MeRoute from "./routes/Me.routes.js"
import driverRoutes from "./routes/driver.routes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/ride", rideRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/me", MeRoute);
app.use("/api/driver", driverRoutes);
// Global error handler middleware (must be last)
app.use(errorHandler);
export default app;