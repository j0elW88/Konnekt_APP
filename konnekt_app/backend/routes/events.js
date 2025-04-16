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

//Archive Event 
router.patch('/:id/archive', async (req, res) => {
  try {
    const { isArchived } = req.body;
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { isArchived },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Archive toggle failed:", err);
    res.status(500).json({ error: "Failed to archive event" });
  }
});

//Deletion of Event
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Server error deleting event" });
  }
});




module.exports = router;