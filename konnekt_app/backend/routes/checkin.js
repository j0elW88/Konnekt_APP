const express = require("express");
const router = express.Router();
const CheckIn = require("../models/CheckIn");
const Event = require("../models/Event");
const Club = require("../models/Club");
const User = require("../models/User");
const mongoose = require("mongoose");




// Get summary: total check-ins per user for a club
router.get('/summary/:clubId', async (req, res) => {
  try {
    const clubId = req.params.clubId;
    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return res.status(400).json({ error: "Invalid club ID format" });
    }

    const summary = await CheckIn.aggregate([
      { $match: { club: new mongoose.Types.ObjectId(clubId) } },
      { $group: { _id: "$user", total: { $sum: 1 } } },
      {
        $project: {
          userId: "$_id",
          total: 1,
          _id: 0
        }
      }
    ]);

    res.json(summary);
  } catch (err) {
    console.error("❌ Summary fetch failed:", err);
    res.status(500).json({ error: "Summary aggregation failed" });
  }
});



// check-in club
router.get('/club/:clubId', async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ club: req.params.clubId })
      .populate('user', 'full_name username') 
      .populate('event', 'title date')  

    res.json(checkIns);
  } catch (err) {
    console.error("Error fetching check-ins:", err);
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});



// Get check-in history for a user in a club
router.get("/:clubId/:userId", async (req, res) => {
  const { clubId, userId } = req.params;
  try {
    const records = await CheckIn.find({ club: clubId, user: userId }).populate("event", "title date");
    res.json(records);
  } catch (err) {
    console.error("❌ Error fetching check-ins:", err);
    res.status(500).json({ error: "Failed to fetch check-in history" });
  }
});

// Check-in a user to an event
router.post("/:eventId", async (req, res) => {
  const { eventId: event } = req.params;
  const { userId: user, lat, lon } = req.body;

  try {
    console.log("📥 Check-in attempt:", { eventId, user, lat, lon });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const club = await Club.findById(event.clubId);
    if (!club) return res.status(404).json({ error: "Club not found" });

    const alreadyCheckedIn = await CheckIn.findOne({ user, event: eventId });
    if (alreadyCheckedIn) {
      return res.status(400).json({ error: "Already checked in" });
    }

    if (club.useLocationTracking) {
      if (lat == null || lon == null) {
        return res.status(400).json({ error: "Location required but not provided" });
      }

      const distance = Math.sqrt(
        Math.pow(club.checkInCoords.lat - lat, 2) +
        Math.pow(club.checkInCoords.lon - lon, 2)
      );

      const radius = 0.01;
      if (distance > radius) {
        return res.status(403).json({ error: "User not within check-in radius" });
      }
    }

    const checkIn = new CheckIn({
      user,
      event: eventId,
      club: event.clubId,
    });

    await checkIn.save();
    return res.json({ message: "Checked in successfully!" });

  } catch (err) {
    // Handle duplicate error gracefully
    if (err.code === 11000) {
      return res.status(400).json({ error: "Already checked in (duplicate)" });
    }

    console.error("❌ Check-in server error:", err);
    return res.status(500).json({ error: "Check-in server error" });
  }
});





module.exports = router;
