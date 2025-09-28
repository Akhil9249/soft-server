// models/courseModel.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true, trim: true },
  duration: { type: String, required: true }, // e.g. "3 Months"
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  courseType: { type: String, required: true }, // e.g. Online, Offline, Hybrid
  courseFee: { type: Number, required: true },
  totalModules: { type: Number, default: 0 },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true });

courseSchema.pre("save", function (next) {
  this.totalModules = this.modules.length;
  next();
});

module.exports = mongoose.model("Course", courseSchema);
