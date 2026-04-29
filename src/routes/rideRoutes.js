/**
 * routes/rideRoutes.js
 *
 * POST /api/ride/estimate — full ride estimate
 */

import { Router }       from "express";
import { body }         from "express-validator";
import { estimate } from "../controllers/rideController.js";

const router = Router();

const coordSchema = (field) => [
  body(`${field}.lat`)
    .exists().withMessage(`${field}.lat is required`)
    .isFloat({ min: -90,  max: 90  }).withMessage(`${field}.lat must be a valid latitude`),
  body(`${field}.lng`)
    .exists().withMessage(`${field}.lng is required`)
    .isFloat({ min: -180, max: 180 }).withMessage(`${field}.lng must be a valid longitude`)
];

router.post(
  "/estimate",
  [...coordSchema("pickup"), ...coordSchema("drop")],
  estimate
);

export default router;
