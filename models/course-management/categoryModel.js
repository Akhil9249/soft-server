// models/categoryModel.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, trim: true, unique: true },
  totalCourses: { type: Number, default: 0 },
  branch: { type: String, required: true }, // could be reference to Branch model if needed
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true });

categorySchema.pre("save", function (next) {
  this.totalCourses = this.courses.length;
  next();
});



module.exports = mongoose.model("Category", categorySchema);
