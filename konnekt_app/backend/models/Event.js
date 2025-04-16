const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  location: { type: String },
  clubId: { type: String, required: true },
  rsvps: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPrivate: { type: Boolean, default: false }, 
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: { type: Date },
  isManuallyDeleted: { type: Boolean, default: false }

  
});


module.exports = mongoose.model("Event", EventSchema);
