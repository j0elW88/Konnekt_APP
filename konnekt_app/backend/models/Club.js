const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema({
  isPublic: {
    type: Boolean,
    default: false,
  },
  name: { type: String, required: true },
  color: { type: String, default: "#A1B5D8" },
  description: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  useLocationTracking: { type: Boolean, default: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  joinLocked: { type: Boolean, default: false },
  joinPassword: { type: String },
  createdAt: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pending: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinCode: {
    type: String,
    default: () => Math.random().toString(36).substr(2, 6).toUpperCase(),
  },
  checkInCoords: {
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
  },
});

module.exports = mongoose.model("Club", ClubSchema);
