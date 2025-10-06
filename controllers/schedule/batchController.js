// controllers/batchController.js
// const Batch = require("../models/batchModel");
const Batch = require("../../models/schedule/batchModel");
const Branch = require("../../models/settings/branchModel");

// Create Batch
const createBatch = async (req, res) => {
  try {
    const { batchName, branchName, status, interns } = req.body;

    console.log( batchName, branchName, status, interns);
    

    if (!batchName || !branchName) {
      return res.status(400).json({ message: "Batch name and branch are required" });
    }

    const newBatch = await Batch.create({
      batchName,
      branch: branchName, // ObjectId reference
      status: status || "Active",
      totalInterns: interns ? interns.length : 0,
      interns: interns ? interns.map(intern => intern.internId) : []
    });

    res.status(201).json({ message: "Batch created successfully", data: newBatch });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all batches
const getBatches = async (req, res) => {
  try {
    console.log('Fetching batches...');
    const batches = await Batch.find()
      .populate("branch", "branchName")
      .populate("interns", "fullName email course");
    console.log('Found batches:', batches.length);
    res.status(200).json({ message: "Batches retrieved successfully", data: batches });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single batch
const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("branch", "branchName")
      .populate("interns", "fullName email course");
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.status(200).json({ message: "Batch retrieved successfully", data: batch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update batch
const updateBatch = async (req, res) => {
  try {
    const { batchName, branchName, status, interns } = req.body;
    
    const updateData = { 
      batchName, 
      status,
      totalInterns: interns ? interns.length : 0,
      interns: interns ? interns.map(intern => intern.internId) : []
    };
    
    if (branchName) {
      updateData.branch = branchName;
    }

    const updated = await Batch.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
    .populate("branch", "branchName")
    .populate("interns", "fullName email course");

    if (!updated) return res.status(404).json({ message: "Batch not found" });
    res.status(200).json({ message: "Batch updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete batch
const deleteBatch = async (req, res) => {
  try {
    const deleted = await Batch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Batch not found" });
    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Intern to Batch
const addIntern = async (req, res) => {
  try {
    console.log("addIntern");
    
    const { id } = req.params; // batch id
    const { internId } = req.body; // Only need internId

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    // Check if intern is already in the batch
    if (batch.interns.includes(internId)) {
      return res.status(400).json({ message: "Intern is already in this batch" });
    }

    // Add intern ID to the batch
    batch.interns.push(internId);
    batch.totalInterns = batch.interns.length;
    await batch.save();

    // Populate the batch with intern details for response
    const populatedBatch = await Batch.findById(id)
      .populate("branch", "branchName")
      .populate("interns", "fullName email course");

    res.status(201).json({ message: "Intern added successfully", data: populatedBatch });
  } catch (error) {
    console.error("Error adding intern:", error);
    res.status(500).json({ message: error.message });
  }
};

// Remove Intern from Batch
const removeIntern = async (req, res) => {
  try {
    const { id, internId } = req.params;

    const batch = await Batch.findById(id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    batch.interns = batch.interns.filter(intern => intern._id.toString() !== internId);
    batch.totalInterns = batch.interns.length;
    await batch.save();

    res.status(200).json({ message: "Intern removed successfully", data: batch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  addIntern,
  removeIntern,
};
