const express = require("express");
const Event = require("../models/Event");
const User = require("../models/User");

const mongoose = require("mongoose");

const router = express.Router();

// Retrieve all events for a club
router.get('/club/:clubId', async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.params.clubId });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Server error fetching events' });
  }
});

// Create Event
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

// RSVP to Event
router.post("/rsvp/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ msg: "Event not found" });

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

// Get RSVP'd events for a user
router.get("/rsvped/:userId", async (req, res) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.userId);

    const events = await Event.find({ rsvps: objectId });

    res.json(events);
  } catch (err) {
    console.error("Fetch RSVP'd Events Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Archive/unarchive event and set `archivedAt`
router.patch('/:id/archive', async (req, res) => {
  try {
    const { isArchived } = req.body;

    const updateFields = { isArchived };
    if (isArchived) {
      updateFields.archivedAt = new Date(); // add this field only if archiving
    } else {
      updateFields.archivedAt = null;
    }

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Archive toggle failed:", err);
    res.status(500).json({ error: "Failed to archive event" });
  }
});

// Mark event as manually deleted, then remove it
router.delete('/:id', async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, {
      isManuallyDeleted: true
    });

    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Server error deleting event" });
  }
});

module.exports = router;
