/**
 * controllers/rideController.js
 *
 * Handles POST /api/ride/estimate
 * Thin layer — validates, delegates to rideService, returns JSON.
 */

import { getRideEstimate } from "../services/rideService.js";

async function estimate(req, res, next) {
  try {
    const { pickup, drop } = req.body;

    const result = await getRideEstimate(
      { lat: pickup.lat, lng: pickup.lng },
      { lat: drop.lat,   lng: drop.lng   }
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export { estimate };
