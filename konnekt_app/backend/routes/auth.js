const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();


router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  console.log("Sign-up attempt:", email);

  try {

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const conflict = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ msg: `${conflict} already in use!` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, name, password: hashedPassword });
    await user.save();

    console.log("User created:", email, name);
    res.status(201).json({ msg: "User created successfully", user: {email: user.email} });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});


router.post("/signin", async (req, res) => {
  const { email, name, password } = req.body; 
  
  console.log("Sign-in attempt:", email, username); //bugtesting

  try {
    const user = await User.findOne({ 
      $or: [{email:emailOrUsername }, { username: emailOrUsername }]
      });

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Incorrect password");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    console.log("Login successful:", email);

    res.json({ msg: "Login successful", user: {email: user.email}, });
  } catch (err) {
    console.error("Sign in error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
