const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: "#A1B5D8" },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  useLocation: { type: Boolean, default: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  joinLocked: { type: Boolean, default: false },
  joinCode: { type: String },
  joinPassword: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Club", ClubSchema);
