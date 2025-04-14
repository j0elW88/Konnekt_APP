const mongoose = require("mongoose");

const CheckInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
  timestamp: { type: Date, default: Date.now },
});

CheckInSchema.index({ user: 1, event: 1 }, { unique: true }); // prevent duplicate check-ins

module.exports = mongoose.model("CheckIn", CheckInSchema);
