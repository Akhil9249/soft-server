const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
  // Basic Details
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  mentorPhoneNumber: { type: String, required: true },
  mentorWhatsAppNumber: { type: String },
  mentorPermanentAddress: { type: String },
  district: { type: String },
  state: { type: String },
  photo: { type: String }, // store photo URL or file path

  // Professional Details
  department: { type: String, required: true },
  branch: { type: String, required: true },
  yearsOfExperience: { type: Number, min: 0 },
  dateOfJoining: { type: Date, required: true },
  employmentStatus: { type: String, enum: ["Active", "Inactive"], required: true },
  resignationDate: { type: Date }, // only if inactive
  resume: { type: String }, // store resume file URL or path
  remarks: { type: String },

  // Login & Access
  officialEmail: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // store hashed password
  isActive: { type: Boolean, default: true }
},
{ timestamps: true }
);

// module.exports = mongoose.model("Mentor", mentorSchema);
module.exports = {
  Mentor: mongoose.model("Mentor", mentorSchema),
};
