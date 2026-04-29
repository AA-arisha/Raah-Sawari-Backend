import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// GET /api/location/search?q=dolmen+mall
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) return res.json([]);

    const url = `https://nominatim.openstreetmap.org/search?format=json
      &q=${encodeURIComponent(q + ", Karachi")}
      &limit=6
      &countrycodes=pk
      &viewbox=66.6,24.6,67.6,25.2
      &bounded=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "raahsawari-app/1.0 (k240603@nu.edu.pk)" // ← required by Nominatim
      }
    });

    const data = await response.json();

    res.json(data.map(item => ({
      name: item.display_name,
      lat:  item.lat,
      lng:  item.lon        // ← lon becomes lng here, consistent with your frontend
    })));

  } catch (err) {
    console.error("Location API error:", err);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

export default router;