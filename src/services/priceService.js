/**
 * services/priceService.js
 *
 * Orchestrates fare prediction:
 * 1. Resolves coordinates → addresses
 * 2. Calls Python fareapp.py (predictFare)
 * 3. Returns structured fare data
 */

import { reverseGeocode } from "../utils/geocode.js";
import { predictFare }    from "../utils/aiClient.js";
import { haversineKm }    from "../utils/haversine.js";
import { createError }    from "../middleware/errorHandler.js";

// Vehicle base rates (PKR / km) — mirrors faredataset.py constants
const VEHICLE_BASE_RATE = {
  bike    : 10,
  rickshaw: 15,
  car     : 25
};

// Fuel consumption km/L — mirrors faredataset.py
const FUEL_KM_PER_L = {
  bike    : 35,
  rickshaw: 25,
  car     : 12
};

const PETROL_PRICE_PKR = 380; // current pump price approximation

/**
 * Predict fare for a specific vehicle.
 *
 * @param {{ lat: number, lng: number }} pickup
 * @param {{ lat: number, lng: number }} drop
 * @param {string} vehicleType - "bike" | "car" | "rickshaw"
 * @param {number} durationMin - trip ETA in minutes (from etaService)
 * @returns {Promise<object>}
 */
async function getFare(pickup, drop, vehicleType, durationMin) {
  

  // Step 2: Call Python Fare AI
  const aiResponse = await predictFare(pickup, drop, vehicleType, durationMin);

  // Step 3: Build breakdown from local constants + returned fare
  const distanceKm   = haversineKm(pickup.lat, pickup.lng, drop.lat, drop.lng);
  const baseFare     = parseFloat((distanceKm * VEHICLE_BASE_RATE[vehicleType]).toFixed(2));
  const fuelCost     = parseFloat(((distanceKm / FUEL_KM_PER_L[vehicleType]) * PETROL_PRICE_PKR).toFixed(2));
  const timeFare     = parseFloat((durationMin * 2).toFixed(2));   // PKR 2/minute base
  const recommended  = aiResponse.recommended_fare ?? (baseFare + fuelCost + timeFare);
  const surge        = parseFloat((recommended / (baseFare + fuelCost)).toFixed(2));

  return {
    vehicle           : vehicleType,
    min_fare          : aiResponse.min_fare,
    recommended_fare  : aiResponse.recommended_fare,
    max_fare          : aiResponse.max_fare,
    breakdown: {
      baseFare         : baseFare,
      distanceFare     : parseFloat((distanceKm * VEHICLE_BASE_RATE[vehicleType]).toFixed(2)),
      timeFare         : timeFare,
      fuelCost         : fuelCost,
      surgeMultiplier  : surge
    }
  };
}

export { getFare };
