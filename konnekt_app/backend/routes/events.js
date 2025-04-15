const express = require("express");
const Event = require("../models/Event");
const User = require("../models/User");  // for checking if user exists before allowing rsvp

const router = express.Router();

//Retrieve all events
router.get('/club/:clubId', async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.params.clubId });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Server error fetching events' });
  }
});

module.exports = router;

// CREATE EVENT
router.post('/create', async (req, res) => {
  try {
    const { title, description, date, location, clubId, isPrivate } = req.body;

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      clubId,
      isPrivate,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: 'Server error creating event' });
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

// Get all events for a specific club
router.get('/club/:clubId', async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.params.clubId });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

//Archive Event 
router.patch('/:eventId/archive', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.eventId, { status: 'archived' }, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event archived', event });
  } catch (err) {
    console.error("Archive failed:", err);
    res.status(500).json({ error: 'Failed to archive event' });
  }
});

//Delete Event
router.delete('/:eventId', async (req, res) => {
  try {
    await CheckIn.deleteMany({ event: req.params.eventId });
    await Event.findByIdAndDelete(req.params.eventId);
    res.json({ message: 'Event and related check-ins deleted' });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});




module.exports = router;