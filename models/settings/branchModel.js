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

}, { timestamps: true });

module.exports = mongoose.model("Branch", branchSchema);
