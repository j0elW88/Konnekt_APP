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

// Join a public club
router.post('/:id/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const club = await Club.findById(req.params.id);
    const user = await User.findById(userId);

    if (!club || !user) {
      return res.status(404).json({ error: 'Club or user not found' });
    }

    if (!club.members.includes(userId)) {
      club.members.push(userId);
    }
    if (!user.clubs.includes(club._id)) {
      user.clubs.push(club._id);
    }

    await club.save();
    await user.save();

    res.json({ message: 'Joined club successfully', club });
  } catch (err) {
    console.error("Join failed:", err);
    res.status(500).json({ error: 'Join failed (server error)' });
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

// Update club
router.patch('/:id', async (req, res) => {
  try {
    const { updates } = req.body;
    const club = await Club.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Get members/admins/owner
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

// Promote to admin
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

// Demote admin
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

// Delete club (owner only)
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
    const user = await User.findById(userId);

    if (!club || !user) {
      return res.status(404).json({ error: 'Club or user not found' });
    }

    const isOwner = club.owner.toString() === userId;
    const isOnlyMember = club.members.length === 1;

    if (isOwner && isOnlyMember) {
      await club.deleteOne();
      await User.findByIdAndUpdate(userId, { $pull: { clubs: club._id } });
      return res.json({ message: 'Club deleted by owner (only member)', deleted: true });
    }

    // Remove user from all arrays
    club.members = club.members.filter(id => id.toString() !== userId);
    club.admins = club.admins.filter(id => id.toString() !== userId);
    club.pending = club.pending.filter(id => id.toString() !== userId);
    await club.save();

    // Remove club from user
    user.clubs = user.clubs.filter(id => id.toString() !== club._id.toString());
    await user.save();

    res.json({ message: 'Left club successfully', deleted: false });
  } catch (err) {
    console.error('Leave club error:', err);
    res.status(500).json({ error: 'Failed to leave club' });
  }
});



// Get public clubs
router.get('/public', async (req, res) => {
  try {
    const clubs = await Club.find({ isPublic: true });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public clubs' });
  }
});

// Reset join code
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

// Get single club by ID
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('owner admins members', 'username full_name');
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    res.json(club);
  } catch (err) {
    console.error('Error fetching club:', err);
    res.status(500).json({ error: 'Failed to fetch club data' });
  }
});

module.exports = router;
