// models/notificationModel.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  type: { type: String, required: true, enum: ["Task Notification", "Weekly Schedule", "Common Notification", "Announcement","Reminder"] }, // example types
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  audience: {
    type: String,
    enum: ["All interns", "By batches", "By courses","Individual interns"],
    default: "All interns"  ,
    required: true
  },
  batches: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Batch",
    default: []
  },
  courses: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Course",
    default: []
  },
  interns: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Intern",
    default: []
  },
  individualInterns: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Intern",
    default: []
  },
  pushNotification: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
