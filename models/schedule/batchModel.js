// models/batchModel.js
const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true, trim: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  status: { type: String, enum: ["Active", "Inactive", "Closed"], default: "Active" },
  totalInterns: { type: Number, default: 0 },
  interns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Intern" }],
  isActive: { 
    type: Boolean, 
    default: true 
  },

}, { timestamps: true });

// Update totalCourses automatically
batchSchema.pre("save", function (next) {
  this.totalInterns = this.interns.length;
  next();
});

module.exports = mongoose.model("Batch", batchSchema);
