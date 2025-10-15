const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  taskType: {
    type: String,
    required: true,
    enum: ["Weekly Task", "Daily Task"],
    trim: true
  },
  assignedMentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  attachments: {
    type: String, // File path or URL
    default: null
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  achievedMarks: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Cancelled"],
    default: "Pending"
  },
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
  module: {
    type: String,
    required: true,
    trim: true
  },
  // batch: {
  //   type: String,
  //   required: true,
  //   trim: true
  // },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
