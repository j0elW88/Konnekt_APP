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

    if (!club || !userId) return res.status(400).json({ error: 'Club or userId missing' });

    if (!club.pending.includes(userId)) {
      return res.status(400).json({ error: 'User not pending' });
    }

    club.pending = club.pending.filter(id => id.toString() !== userId);
    club.members.push(userId);

    await club.save();
    await User.findByIdAndUpdate(userId, {
      $addToSet: { clubs: club._id }
    });

    res.json({ message: 'User approved' });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Approval failed' });
  }
});

// Reject user 
router.patch('/:id/reject/:userId', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    const userId = req.params.userId;

    if (!club || !userId) return res.status(400).json({ error: 'Club or userId missing' });

    if (!club.pending.includes(userId)) {
      return res.status(400).json({ error: 'User not in pending list' });
    }

    club.pending = club.pending.filter(id => id.toString() !== userId);
    await club.save();

    res.json({ message: 'User rejected' });
  } catch (err) {
    console.error('Rejection error:', err);
    res.status(500).json({ error: 'Rejection failed' });
  }
});

// Get full club with populated pending
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('owner admins members pending', 'username full_name');

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    res.json(club);
  } catch (err) {
    console.error('Error fetching club:', err);
    res.status(500).json({ error: 'Failed to fetch club data' });
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
    const { id: clubId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const club = await Club.findById(clubId);
    const user = await User.findById(userId);

    if (!club || !user) {
      return res.status(404).json({ error: 'Club or user not found' });
    }

    const isOwner = club.owner.toString() === userId;
    const isOnlyMember = club.members.length === 1;

    // If owner and only member — delete club
    if (isOwner && isOnlyMember) {
      await club.deleteOne();
      await User.findByIdAndUpdate(userId, { $pull: { clubs: club._id } });

      return res.json({
        message: 'Owner deleted the club (only member)',
        deleted: true
      });
    }

    // If user is not a member, reject
    if (!club.members.map(m => m.toString()).includes(userId)) {
      return res.status(400).json({ error: 'User is not a member of this club' });
    }

    // Remove from members/admins/pending if they exist
    club.members = club.members.filter(id => id.toString() !== userId);
    club.admins = (club.admins || []).filter(id => id.toString() !== userId);
    club.pending = (club.pending || []).filter(id => id.toString() !== userId);

    await club.save();

    // Remove club from user doc
    await User.findByIdAndUpdate(userId, { $pull: { clubs: club._id } });

    res.json({ message: 'Left club successfully', deleted: false });
  } catch (err) {
    console.error("❌ Leave club error:", err);
    res.status(500).json({ error: 'Server error leaving club' });
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

// Join club by join code
router.post('/join-code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { userId } = req.body;

    const club = await Club.findOne({ joinCode: code });
    const user = await User.findById(userId);

    if (!club || !user) {
      return res.status(404).json({ error: 'Club or user not found' });
    }

    if (club.members.includes(userId)) {
      return res.status(400).json({ error: 'Already a member' });
    }

    if (club.pending.includes(userId)) {
      return res.status(400).json({ error: 'Request already pending' });
    }

    if (club.isPublic) {
      club.members.push(userId);
      user.clubs.push(club._id);
      await club.save();
      await user.save();
      return res.json({ message: 'Joined public club' });
    } else {
      club.pending.push(userId);
      await club.save();
      return res.json({ message: 'Join request sent for private club' });
    }

  } catch (err) {
    console.error("Join by code failed:", err);
    res.status(500).json({ error: 'Server error joining club' });
  }
});


//private clubs pending join route
router.post('/:id/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const club = await Club.findById(req.params.id);
    const user = await User.findById(userId);

    if (!club || !user) {
      return res.status(404).json({ error: 'Club or user not found' });
    }

    if (club.members.includes(userId)) {
      return res.status(400).json({ error: 'You are already a member of this club' });
    }

    if (club.isPublic) {
      club.members.push(userId);
      user.clubs.push(club._id);
      await club.save();
      await user.save();
      return res.json({ message: 'Joined public club successfully', club });
    } else {
      if (!club.pending.includes(userId)) {
        club.pending.push(userId);
        await club.save();
        return res.json({ message: 'Join request sent. Awaiting approval.' });
      } else {
        return res.status(400).json({ error: 'Join request already pending' });
      }
    }
  } catch (err) {
    console.error("Join failed:", err);
    res.status(500).json({ error: 'Join failed (server error)' });
  }
});

// Get pending users (for AdminDropdownPanel)
router.get('/:id/pending', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('pending', 'username full_name');
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json(club.pending);
  } catch (err) {
    console.error("Fetch pending failed:", err);
    res.status(500).json({ error: 'Could not fetch pending users' });
  }
});


//reset join code
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

//get single club by ID
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

//set check-in coordinates (admins and owners only)
router.patch('/:id/location', async (req, res) => {
  try {
    const { userId, lat, lon } = req.body;
    const club = await Club.findById(req.params.id);

    if (!club) return res.status(404).json({ error: 'Club not found' });

    const isAdmin = club.admins.map(id => id.toString()).includes(userId.toString());
    const isOwner = club.owner.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to set location' });
    }

    club.checkInCoords = { lat, lon };
    await club.save();

    res.json({ message: 'Location updated', checkInCoords: club.checkInCoords });
  } catch (err) {
    console.error("Failed to update club location:", err);
    res.status(500).json({ error: 'Server error updating location' });
  }
});

// Kick a member
router.patch('/:id/kick/:userId', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    const userId = req.params.userId;

    if (!club) return res.status(404).json({ error: 'Club not found' });

    club.members = club.members.filter(id => id.toString() !== userId);
    club.admins = club.admins.filter(id => id.toString() !== userId);
    club.pending = club.pending.filter(id => id.toString() !== userId);

    await club.save();
    await User.findByIdAndUpdate(userId, { $pull: { clubs: club._id } });

    res.json({ message: 'User kicked' });
  } catch (err) {
    console.error('Kick failed:', err);
    res.status(500).json({ error: 'Kick failed' });
  }
});



module.exports = router;
