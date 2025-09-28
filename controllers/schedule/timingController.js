// controllers/timingController.js
// const Timing = require("../models/timingModel");
const Timing = require("../../models/schedule/timingModel");

// Create Timing
const createTiming = async (req, res) => {
  try {
    const { branch, timeSlot } = req.body;

    console.log('Creating timing:', { branch, timeSlot });

    if (!branch || !timeSlot) {
      return res.status(400).json({ message: "Branch and time slot are required" });
    }

    const newTiming = await Timing.create({ branch, timeSlot });
    console.log('Timing created successfully:', newTiming);
    res.status(201).json({ message: "Timing created successfully", timing: newTiming });
  } catch (error) {
    console.error('Error creating timing:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Timings
const getTimings = async (req, res) => {
  try {
    console.log('Fetching timings...');
    const timings = await Timing.find().populate("branch", "branchName");
    console.log('Found timings:', timings.length);
    res.status(200).json(timings);
  } catch (error) {
    console.error('Error fetching timings:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Single Timing
const getTimingById = async (req, res) => {
  try {
    const timing = await Timing.findById(req.params.id).populate("branch", "branchName");

    if (!timing) return res.status(404).json({ message: "Timing not found" });
    res.status(200).json(timing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Timing
const updateTiming = async (req, res) => {
  try {
    const updated = await Timing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("branch", "branchName");

    if (!updated) return res.status(404).json({ message: "Timing not found" });
    res.status(200).json({ message: "Timing updated", timing: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Timing
const deleteTiming = async (req, res) => {
  try {
    const deleted = await Timing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Timing not found" });
    res.status(200).json({ message: "Timing deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTiming,
  getTimings,
  getTimingById,
  updateTiming,
  deleteTiming,
};
