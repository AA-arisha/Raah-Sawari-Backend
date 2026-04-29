/**
 * services/rideService.js
 *
 * The core service for POST /api/ride/estimate.
 *
 * Flow:
 *   1. Resolve lat/lng → address strings (one Nominatim call each)
 *   2. Calculate distance (Haversine)
 *   3. Call ETA AI → get trip times for all vehicles
 *   4. Call Fare AI in parallel for all 3 vehicles
 *   5. Merge into one clean response
 */

import { reverseGeocode }  from "../utils/geocode.js";
import { predictETA, predictFare } from "../utils/aiClient.js";
import { haversineKm }     from "../utils/haversine.js";
import { createError }     from "../middlewares/errorHandler.js";

const VEHICLES = ["bike", "car", "rickshaw"];

// Emojis for UI convenience
const VEHICLE_EMOJI = { bike: "🛵", car: "🚗", rickshaw: "🛺" };

/**
 * Full ride estimate — distance, ETA, and fare for all 3 vehicle types.
 *
 * @param {{ lat: number, lng: number }} pickup
 * @param {{ lat: number, lng: number }} drop
 * @returns {Promise<object>}
 */
async function getRideEstimate(pickup, drop) {
  // ── Step 1: Geocode coordinates → address strings ──────────────────────────
  // const [pickupAddr, dropAddr] = await Promise.all([
  //   reverseGeocode(pickup.lat, pickup.lng),
  //   reverseGeocode(drop.lat,   drop.lng)
  // ]);

  // ── Step 2: Distance ────────────────────────────────────────────────────────

  // ── Step 3: ETA for all vehicles (one call, Python returns all 3) ──────────
  const etaResponse = await predictETA(pickup, drop);

  if (etaResponse.status !== "success") {
    throw createError(502, etaResponse.message || "ETA AI service error");
  }
  const distanceKm = etaResponse.distance_km;
  // Map Python rides array → { vehicle → total_time_min }
  const etaByVehicle = {};
  (etaResponse.rides || []).forEach((ride) => {
    etaByVehicle[ride.vehicle] = ride.total_time_min;
  });

  // ── Step 4: Fare for all 3 vehicles in parallel ────────────────────────────
  const farePromises = VEHICLES.map((v) =>
    predictFare(
      pickup,
      drop,
      v,
      etaByVehicle[v] ?? 15   // fallback 15 min if vehicle not in ETA response
    ).catch((err) => ({
      vehicle          : v,
      _error           : err.message,
      min_fare         : null,
      recommended_fare : null,
      max_fare         : null
    }))
  );

  const fareResults = await Promise.all(farePromises);

  // ── Step 5: Merge ETA + Fare for each vehicle ──────────────────────────────
  const vehicles = VEHICLES.map((v, i) => {
    const matchedFare = fareResults[i] ?? {};
    return {
      vehicle          : v,
      icon             : VEHICLE_EMOJI[v],
      eta_min          : etaByVehicle[v]               ?? null,
      min_fare         : matchedFare.min_fare           ?? null,
      recommended_fare : matchedFare.recommended_fare   ?? null,
      max_fare         : matchedFare.max_fare           ?? null,
    };
  });
  // ── Step 6: Return unified response ────────────────────────────────────────
  return {
    status          : "success",
    distance_km     : etaResponse.distance_km ?? distanceKm,
    pickup_address  : pickup,
    drop_address    : drop,
    vehicles        : vehicles,
    // Quick-access fields for the "recommended" vehicle (car)
    distance        : etaResponse.distance_km ?? distanceKm,
    eta             : etaByVehicle["car"]     ?? null,
    price           : vehicles.find((v) => v.vehicle === "car")?.recommended_fare ?? null,
    breakdown       : _buildBreakdown(vehicles.find((v) => v.vehicle === "car"), distanceKm)
  };
}

/** Internal helper — builds the price breakdown object for the required API shape. */
function _buildBreakdown(carVehicle, distanceKm) {
  if (!carVehicle || carVehicle.recommended_fare == null) return null;

  const recommended = carVehicle.recommended_fare;
  const baseFare    = parseFloat((distanceKm * 25).toFixed(2));   // PKR 25/km for car
  const fuelCost    = parseFloat(((distanceKm / 12) * 380).toFixed(2));
  const timeFare    = parseFloat(((carVehicle.eta_min ?? 15) * 2).toFixed(2));
  const surge       = parseFloat((recommended / Math.max(baseFare + fuelCost, 1)).toFixed(2));

  return {
    baseFare         : baseFare,
    distanceFare     : parseFloat((distanceKm * 25).toFixed(2)),
    timeFare         : timeFare,
    surgeMultiplier  : surge
  };
}

export { getRideEstimate };
