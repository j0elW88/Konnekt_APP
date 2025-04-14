const express = require("express");
const router = express.Router();
const CheckIn = require("../models/CheckIn");
const Event = require("../models/Event");
const Club = require("../models/Club");
const User = require("../models/User");

// Check-in a user to an event
router.post("/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const { userId, lat, lon } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const club = await Club.findById(event.clubId);
    if (!club) return res.status(404).json({ error: "Club not found" });

    const alreadyCheckedIn = await CheckIn.findOne({ userId, eventId });
    if (alreadyCheckedIn) return res.status(400).json({ error: "Already checked in" });

    if (club.useLocationTracking && club.checkInCoords?.lat && club.checkInCoords?.lon) {
      const distance = Math.sqrt(
        Math.pow(club.checkInCoords.lat - lat, 2) +
        Math.pow(club.checkInCoords.lon - lon, 2)
      );
      const radius = 0.01; // Approx ~1km or adjust
      if (distance > radius) {
        return res.status(403).json({ error: "User not within check-in radius" });
      }
    }

    const checkIn = new CheckIn({
      userId,
      eventId,
      clubId: event.clubId,
    });

    await checkIn.save();
    res.json({ message: "Checked in successfully!" });
  } catch (err) {
    console.error("❌ Check-in failed:", err);
    res.status(500).json({ error: "Check-in server error" });
  }
});

// Get check-in history for a user in a club
router.get("/:clubId/:userId", async (req, res) => {
  const { clubId, userId } = req.params;
  try {
    const records = await CheckIn.find({ clubId, userId }).populate("eventId", "title date");
    res.json(records);
  } catch (err) {
    console.error("❌ Error fetching check-ins:", err);
    res.status(500).json({ error: "Failed to fetch check-in history" });
  }
});

// check-in club
router.get('/club/:clubId', async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ clubId: req.params.clubId })
      .populate('userId', 'full_name username')
      .populate('eventId', 'title date');

    res.json(checkIns);
  } catch (err) {
    console.error("Error fetching check-ins:", err);
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});


module.exports = router;
