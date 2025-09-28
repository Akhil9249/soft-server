// models/moduleModel.js
const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  moduleName: { type: String, required: true, trim: true },
  totalTopics: { type: Number, default: 0 }, // can auto-increment later when topics are added
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  moduleImage: { type: String }, // file/image URL
}, { timestamps: true });

moduleSchema.pre("save", function (next) {
  this.totalTopics = this.topics.length;
  next();
});


module.exports = mongoose.model("Module", moduleSchema);
