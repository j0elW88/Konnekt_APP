const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],
});

module.exports = mongoose.model("User", UserSchema);
