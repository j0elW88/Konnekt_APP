const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();


router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  console.log("📨 Sign-up attempt:", email);

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log("⚠️ User already exists");
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword });
    await user.save();

    console.log("User created:", email);
    res.status(201).json({ msg: "User created successfully", user });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});


router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  console.log("📨 Sign-in attempt:", email);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Incorrect password");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log("✅ Login successful:", email);
    res.json({ msg: "Login successful", user });
  } catch (err) {
    console.error("Signin error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
