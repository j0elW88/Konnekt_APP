const express = require("express");
const Event = require("../models/Event");
const User = require("../models/User");  // for checking if user exists before allowing rsvp

const router = express.Router();

// CREATE EVENT
router.post("/create", async (req, res) => {
  try {
    const { title, description, date, location, clubId } = req.body;
    const newEvent = new Event({ title, description, date, location, clubId });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Create Event Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// RSVP TO EVENT
router.post("/rsvp/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    // Prevent duplicate RSVP
    if (event.rsvps.includes(userId)) {
      return res.status(400).json({ msg: "Already RSVPed" });
    }

    event.rsvps.push(userId);
    await event.save();
    res.json({ msg: "RSVP successful", rsvpCount: event.rsvps.length });
  } catch (err) {
    console.error("RSVP Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET RSVP'D EVENTS FOR USER
router.get("/rsvped/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await Event.find({ rsvps: userId });
    res.json(events);
  } catch (err) {
    console.error("Fetch RSVP'd Events Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;