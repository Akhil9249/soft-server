// models/internModel.js
const mongoose = require("mongoose");

const internSchema = new mongoose.Schema({
  // Basic Details
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  internPhoneNumber: { type: String, required: true },
  // admissionNumber: { type: String, required: true },
  admissionNumber: { type: String},
  internWhatsAppNumber: { type: String },
  guardianName: { type: String },
  fatherName: { type: String },
  motherName: { type: String },
  guardianParentPhone: { type: String },
  internPermanentAddress: { type: String },
  district: { type: String },
  state: { type: String },
  photo: { type: String }, // file path or cloud URL

  // Academic Details
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  courseStartedDate: { type: Date, required: true },
  completionDate: { type: Date },
  batch: { type: String },
  courseStatus: { type: String, enum: ["Ongoing", "Completed", "Dropped"], default: "Ongoing" },
  remarks: { type: String },

  // Intern Syllabus
  internSyllabusStatus: { type: String, enum: ["Not Started", "In Progress", "Completed"], default: "Not Started" },

  // Placement Information (Optional)
  placementStatus: { type: String, enum: ["Placed", "Not Placed", "In Progress"], default: "Not Placed" },
  linkedin: { type: String },
  portfolio: { type: String },
  companyName: { type: String },
  jobRole: { type: String },
  resume: { type: String }, // file path or cloud URL
  role: { type: String, enum: ["Intern"], default: "Intern" },

  // Login & Access
  officialEmail: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // will be hashed
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Intern", internSchema);
