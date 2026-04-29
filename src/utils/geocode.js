/**
 * utils/geocode.js
 *
 * Converts lat/lng → human-readable address using Nominatim (free, no key).
 * Used so the Node layer can pass address strings to the Python AI services
 * when the frontend sends raw coordinates.
 */

import axios from "axios";

const NOMINATIM = "https://nominatim.openstreetmap.org";

/**
 * Reverse geocode a coordinate pair to an address string.
 * Falls back to a "lat,lng Karachi" string if the request fails.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>} human-readable address
 */
async function reverseGeocode(lat, lng) {
  try {
    const { data } = await axios.get(`${NOMINATIM}/reverse`, {
      params  : { lat, lon: lng, format: "json" },
      headers : { "User-Agent": "raahsawari-node-backend" },
      timeout : 5_000
    });

    if (data && data.display_name) {
      return data.display_name;
    }
  } catch (_err) {
    // Non-fatal — fall through to default
  }

  // Fallback: "24.795, 67.065 Karachi" works fine with Nominatim forward search
  return `${lat},${lng} Karachi`;
}

/**
 * Forward geocode an address string to lat/lng.
 *
 * @param {string} address
 * @returns {Promise<{lat: number, lng: number}|null>}
 */
async function forwardGeocode(address) {
  try {
    const { data } = await axios.get(`${NOMINATIM}/search`, {
      params  : { q: address + ", Karachi, Pakistan", format: "json", limit: 1 },
      headers : { "User-Agent": "raahsawari-node-backend" },
      timeout : 5_000
    });

    if (data && data.length > 0) {
      return {
        lat : parseFloat(data[0].lat),
        lng : parseFloat(data[0].lon)
      };
    }
  } catch (_err) {
    // Non-fatal
  }

  return null;
}

export { reverseGeocode, forwardGeocode };
