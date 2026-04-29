/**
 * services/etaService.js
 *
 * Orchestrates everything needed to produce an ETA result:
 * 1. Converts lat/lng → address (via Nominatim)
 * 2. Calls Python ETAapp.py  (predictETA)
 * 3. Returns structured data to the controller
 */

import { reverseGeocode }  from "../utils/geocode.js";
import { predictETA }      from "../utils/aiClient.js";
import { haversineKm }     from "../utils/haversine.js";
import { createError }     from "../middleware/errorHandler.js";

/**
 * Get ETA estimates for all vehicle types.
 *
 * @param {{ lat: number, lng: number }} pickup
 * @param {{ lat: number, lng: number }} drop
 * @returns {Promise<object>}
 */
async function getETA(pickup, drop) {
  

  // Step 3: Call Python ETA AI
  const aiResponse = await predictETA(pickup, drop);

  if (aiResponse.status !== "success") {
    throw createError(502, aiResponse.message || "ETA AI returned an error");
  }
    const distanceKm = aiResponse.distance_km;

  // Step 4: Shape response
  return {
    distance_km : aiResponse.distance_km ?? distanceKm,
    rides       : aiResponse.rides,          // [{ vehicle, total_time_min }, ...]
    pickup_address : pickup,
    drop_address   : drop
  };
}

export { getETA };
