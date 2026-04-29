/**
 * utils/haversine.js
 *
 * Haversine formula — returns the road-adjusted distance in km
 * between two lat/lng coordinate pairs.
 *
 * Road multiplier: straight-line × 1.4  (matches your Python ETAapp logic)
 */

const EARTH_RADIUS_KM  = 6371;
const ROAD_MULTIPLIER  = 1.4;   // converts crow-fly → realistic road distance

/**
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in km (rounded to 2 decimal places)
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lng2)) * Math.sin(dLng / 2) ** 2;

  const straightLine = EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
  return parseFloat((straightLine * ROAD_MULTIPLIER).toFixed(2));
}

export { haversineKm };
