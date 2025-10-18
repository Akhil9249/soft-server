// models/moduleModel.js
const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    attachments: { type: String, required: true },
    audience: {
        type: String,
        enum: ["All interns", "By batches", "By courses", "Individual interns"],
        default: "All interns",
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
    isActive: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model("Material", materialSchema);
