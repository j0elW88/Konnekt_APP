const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const User = require('../models/User');

// CREATE CLUB
router.post('/create', async (req, res) => {
  try {
    const { name, color, description, imageUrl, useLocationTracking, createdBy } = req.body;

    const club = new Club({
      name,
      color,
      description,
      imageUrl,
      useLocationTracking,
      createdBy,
      members: [createdBy],
      admins: [createdBy],
    });

    await club.save();

    // Update the user's club list
    await User.findByIdAndUpdate(createdBy, { $push: { clubs: club._id } });

    res.status(201).json(club); // ✅ FIXED: return actual club
  } catch (err) {
    console.error('Error creating club:', err);
    res.status(500).json({ error: 'Failed to Create Club (SERVER ERROR)' });
  }
});

// Get clubs a user is in
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('clubs');
    res.json(user.clubs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// Join a club
router.post('/:id/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const club = await Club.findById(req.params.id);

    if (!club) return res.status(404).json({ error: 'Club not found' });

    if (!club.pending.includes(userId)) {
      club.pending.push(userId);
      await club.save();
    }

    res.json({ message: 'Join request sent' });
  } catch (err) {
    res.status(500).json({ error: 'Join failed' });
  }
});

// Approve user
router.patch('/:id/approve/:userId', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    const userId = req.params.userId;

    if (!club.pending.includes(userId)) {
      return res.status(400).json({ error: 'User not pending' });
    }

    club.pending = club.pending.filter(id => id.toString() !== userId);
    club.members.push(userId);

    await club.save();
    await User.findByIdAndUpdate(userId, {
      $push: { clubs: club._id }
    });

    res.json({ message: 'User approved' });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

// Update club info (only admins)
router.patch('/:id', async (req, res) => {
  try {
    const { updates } = req.body;
    const club = await Club.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
