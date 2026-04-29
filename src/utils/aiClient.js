/**
 * utils/aiClient.js
 *
 * Thin Axios wrapper that talks to the Python AI microservices.
 * All HTTP calls to Flask go through here so retry/timeout logic
 * lives in one place.
 */

import axios from "axios";

const TIMEOUT = parseInt(process.env.AI_TIMEOUT_MS, 10) || 10_000;

/**
 * Generic POST helper.
 *
 * @param {string} baseUrl  - e.g. process.env.ETA_SERVICE_URL
 * @param {string} path     - e.g. "/predict-eta"
 * @param {object} payload  - JSON body
 * @returns {Promise<object>} parsed response data
 */
async function aiPost(baseUrl, path, payload) {
  const url = `${baseUrl}${path}`;

  try {
    const response = await axios.post(url, payload, {
      timeout : TIMEOUT,
      headers : { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (err) {
    // Surface a clean message to the caller
    if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
      const error        = new Error(`AI service unavailable: ${url}`);
      error.statusCode   = 503;
      throw error;
    }

    if (err.response) {
      const error        = new Error(
        err.response.data?.message || `AI service error (${err.response.status})`
      );
      error.statusCode   = err.response.status;
      throw error;
    }

    throw err;
  }
}

// ── Specific service helpers ──────────────────────────────────────────────────

async function predictETA(pickup, drop) {
  return aiPost(
    process.env.ETA_SERVICE_URL || "http://localhost:3000",
    "/predict-eta",
    { pickup, drop }  // { lat, lng } objects
  );
}

async function predictFare(pickup, destination, vehicleType, durationMin) {
  return aiPost(
    process.env.FARE_SERVICE_URL || "http://localhost:3001",
    "/predict-fare",
    {
      pickup,
      destination,
      vehicle_type : vehicleType,
      duration_min : durationMin
    }
  );
}

/**
 * Calls Python riskapp.py → POST /predict-risk
 * @param {object} driverData - driver stats payload
 */
async function predictDriverRisk(driverData) {
  return aiPost(
    process.env.RISK_SERVICE_URL || "http://localhost:3002",
    "/predict-risk",
    driverData
  );
}

export { predictETA, predictFare, predictDriverRisk };
