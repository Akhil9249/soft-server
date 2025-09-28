// models/settings/branchModel.js
const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  branchName: { 
    type: String, 
    required: true, 
    trim: true, 
    unique: true 
  },
  location: { 
    type: String, 
    required: true, 
    trim: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  totalStudents: { 
    type: Number, 
    default: 0 
  },
  totalCourses: { 
    type: Number, 
    default: 0 
  },
  contactInfo: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true }
  }
}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
