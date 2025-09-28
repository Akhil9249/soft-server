// models/notificationModel.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notificationTitle: { type: String, required: true, trim: true },
  notificationContent: { type: String, required: true },
  type: { type: String, required: true, enum: ["general", "exam", "event", "alert"] }, // example types
  branch: { type: String, required: true },
  audience: { type: String, required: true, enum: ["students", "teachers", "staff", "all"] },
  pushNotification: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
