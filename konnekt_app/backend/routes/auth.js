const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  const { email, password, username, full_name } = req.body;
  console.log("Sign-up attempt:", email, username);

  try {
    // Check if email OR username already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const conflict = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ msg: `${conflict} already in use!` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, username, full_name, password: hashedPassword });
    await user.save();

    console.log("User created:", user.email, user.username);
    res.status(201).json({
      msg: "User created successfully",
      user: {
        email: user.email,
        username: user.username,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});


// SIGNIN ROUTE (email OR username)
router.post("/signin", async (req, res) => {
  const { identifier, password } = req.body;
  console.log("Sign-in attempt:", identifier);

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    res.json({
      msg: "Login successful",
      user: {
        email: user.email,
        username: user.username,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error("Signin error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/editprofile", async (req, res) => {
  const { email, username, full_name } = req.body;
  console.log("Edit profile attempt:", email, username);

  try {
    const existingUser = await User.findOne({
      email: { $ne: email },
      username: username,
    });

    if (existingUser) {
      return res.status(400).json({ msg: `Username already in use!` });
    }

    const result = await User.updateOne(
      { email: email },
      { $set: { username: username, full_name: full_name }}
    );

    if (result.modifiedCount > 0) {
      const updatedUser = await User.findOne({ email: email });
      
      return res.status(200).json({
        msg: "Profile updated successfully",
        user: {
          email: updatedUser.email,
          username: updatedUser.username,
          full_name: updatedUser.full_name,
        },
      });
    } else {
      return res.status(404).json({ msg: 'User not found or no changes made' });
    }
  } catch (err) {
    console.error("Profile update error:", err.message);
    return res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;