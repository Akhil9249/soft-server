const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  // Basic Details
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  staffPhoneNumber: { type: String, required: true },
  staffWhatsAppNumber: { type: String },
  staffPermanentAddress: { type: String },
  district: { type: String },
  state: { type: String },
  photo: { type: String }, // store photo URL or file path

  // Professional Details
  department: { type: String, required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  // assignedBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }], // For mentors - batches they are assigned to
  yearsOfExperience: { type: Number, min: 0 },
  dateOfJoining: { type: Date, required: true },
  employmentStatus: { type: String, enum: ["Active", "Inactive"], required: true },
  resignationDate: { type: Date }, // only if inactive
  resume: { type: String }, // store resume file URL or path
  remarks: { type: String },
  // role: { type: String, enum: ["Super Admin", "Admin", "Mentor", "Accountant"], default: "Mentor" },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },

  // Login & Access
  officialEmail: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // store hashed password
  isActive: { type: Boolean, default: true }
},
{ timestamps: true }
);

// module.exports = mongoose.model("Staff", staffSchema);
module.exports = {
  Staff: mongoose.model("Staff", staffSchema),
};
