// models/batchModel.js
const mongoose = require("mongoose");

const weeklySchedulelSchema = new mongoose.Schema({

            mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
            schedule: [
                {
                    time: { type: mongoose.Schema.Types.ObjectId, ref: "Timing" },
                    sub_details: [{
                        days: { type: String, enum: ["MWF", "TTS"], required: true },
                        subject: { type: String },
                        batch: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }]
                    }]
                }
            ]


}, { timestamps: true });

module.exports = mongoose.model("WeeklySchedule", weeklySchedulelSchema);
