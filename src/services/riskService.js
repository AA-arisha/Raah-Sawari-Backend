/**
 * services/riskService.js
 *
 * Calls Python riskapp.py to classify driver risk level.
 * No geocoding needed — this receives driver stats directly.
 */

import { predictDriverRisk } from "../utils/aiClient.js";
import { createError }       from "../middleware/errorHandler.js";

const RISK_LABELS = { 0: "Low Risk", 1: "Medium Risk", 2: "High Risk" };
const RISK_COLORS = { 0: "green",    1: "orange",      2: "red"       };
const RISK_EMOJI  = { 0: "✅",       1: "⚠️",          2: "🚨"        };

/**
 * Analyse a driver's risk profile.
 *
 * @param {object} driverStats
 * @returns {Promise<object>}
 */
async function getDriverRisk(driverStats) {
  const aiResponse = await predictDriverRisk(driverStats);

  if (aiResponse.status !== "success") {
    throw createError(502, aiResponse.error || "Risk AI returned an error");
  }

  const level = aiResponse.risk_level;

  return {
    driver_id   : aiResponse.driver_id,
    risk_level  : level,
    risk_label  : RISK_LABELS[level] ?? "Unknown",
    risk_color  : RISK_COLORS[level] ?? "grey",
    risk_emoji  : RISK_EMOJI[level]  ?? "❓",
    message     : aiResponse.message
  };
}

export { getDriverRisk };
