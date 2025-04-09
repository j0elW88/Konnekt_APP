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
        _id: user._id,
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

module.exports = router;
