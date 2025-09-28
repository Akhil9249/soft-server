// models/timingModel.js
const mongoose = require("mongoose");

const timingSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  timeSlot: { type: String, required: true, trim: true }, // Example: "08:30 AM - 11:30 AM"
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true });

module.exports = mongoose.model("Timing", timingSchema);
