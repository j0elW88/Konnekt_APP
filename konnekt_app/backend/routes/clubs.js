const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const User = require('../models/User');

// create club
router.post('/create', async (req, res) => {
  try {
    const { name, color, description, imageUrl, useLocationTracking, owner, isPublic } = req.body;

    const club = new Club({
      name,
      color,
      description,
      imageUrl,
      useLocationTracking,
      isPublic,
      owner,
      members: [owner],
      admins: [owner],
    });
    

    await club.save();

    // Update the user's club list
    await User.findByIdAndUpdate(owner, { $push: { clubs: club._id } });


    res.status(201).json(club); 
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

// IMPORTANT USER MANIPULATION FUNCTIONS

// GET MEMBERS OF CLUB
router.get('/:id/members', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('members admins owner', 'username full_name');
    res.json({
      members: club.members,
      admins: club.admins,
      owner: club.owner
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get club members' });
  }
});

// PROMOTE TO ADMIN
router.patch('/:id/promote/:userId', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club.admins.includes(req.params.userId)) {
      club.admins.push(req.params.userId);
      await club.save();
    }
    res.json({ msg: 'User promoted to admin' });
  } catch (err) {
    res.status(500).json({ error: 'Promotion failed' });
  }
});

// DEMOTE ADMIN
router.patch('/:id/demote/:userId', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    club.admins = club.admins.filter(id => id.toString() !== req.params.userId);
    await club.save();
    res.json({ msg: 'User demoted from admin' });
  } catch (err) {
    res.status(500).json({ error: 'Demotion failed' });
  }
});

// DELETE CLUB (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (club.owner.toString() !== req.body.userId) {
      return res.status(403).json({ msg: 'Only the owner can delete this club' });
    }

    await club.deleteOne();
    res.json({ msg: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete club' });
  }
});

// LEAVE CLUB
router.patch('/:id/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    // Remove from members/admins/pending
    club.members = club.members.filter(id => id.toString() !== userId);
    club.admins = club.admins.filter(id => id.toString() !== userId);
    club.pending = club.pending.filter(id => id.toString() !== userId);

    await club.save();

    // Also remove club from user's record
    await User.findByIdAndUpdate(userId, {
      $pull: { clubs: club._id }
    });

    res.json({ message: 'Left club successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to leave club' });
  }
});

// GET PUBLIC CLUBS
router.get('/public', async (req, res) => {
  try {
    const clubs = await Club.find({ isPublic: true });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public clubs' });
  }
});

// JOIN CODE GENERATOR
router.patch('/:id/join-code/reset', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    const { userId } = req.body;

    if (!club.admins.includes(userId)) {
      return res.status(403).json({ error: 'Only admins can reset join code' });
    }

    club.joinCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    await club.save();

    res.json({ joinCode: club.joinCode });
  } catch (err) {
    console.error("Error resetting join code:", err);
    res.status(500).json({ error: "Failed to reset join code" });
  }
});

module.exports = router;
