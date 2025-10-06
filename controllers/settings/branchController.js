// controllers/settings/branchController.js
const Branch = require("../../models/settings/branchModel");

// Create new branch
const createBranch = async (req, res) => {
  try {
    const { branchName, location} = req.body;

    console.log("Creating branch:", { branchName, location });

    if (!branchName || !location) {
      return res.status(400).json({ 
        message: "Branch name and location are required" 
      });
    }

    // Check if branch already exists
    const existingBranch = await Branch.findOne({ branchName });
    if (existingBranch) {
      return res.status(400).json({ 
        message: "Branch with this name already exists" 
      });
    }

    const newBranch = await Branch.create({
      branchName,
      location
    });

    res.status(201).json({ 
      message: "Branch created successfully", 
      data: newBranch 
    });
  } catch (error) {
    console.log("Error creating branch:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all branches
const getBranches = async (req, res) => {
  try {
    console.log("Getting all branches");
    
    const branches = await Branch.find().sort({ createdAt: -1 });
    console.log("Found branches:", branches.length);
    
    res.status(200).json({ message: "Branches retrieved successfully", data: branches });
  } catch (error) {
    console.log("Error getting branches:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single branch
const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.status(200).json({ message: "Branch retrieved successfully", data: branch });
  } catch (error) {
    console.log("Error getting branch:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    const { branchName, location, isActive } = req.body;

    // Check if branch name is being updated and if it already exists
    if (branchName) {
      const existingBranch = await Branch.findOne({ 
        branchName, 
        _id: { $ne: req.params.id } 
      });
      if (existingBranch) {
        return res.status(400).json({ 
          message: "Branch with this name already exists" 
        });
      }
    }

    const updated = await Branch.findByIdAndUpdate(
      req.params.id,
      { branchName, location, isActive },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Branch not found" });
    }
    
    res.status(200).json({ 
      message: "Branch updated successfully", 
      data: updated 
    });
  } catch (error) {
    console.log("Error updating branch:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete branch
const deleteBranch = async (req, res) => {
  try {
    const deleted = await Branch.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.status(200).json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.log("Error deleting branch:", error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle branch status (active/inactive)
const toggleBranchStatus = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    branch.isActive = !branch.isActive;
    await branch.save();

    res.status(200).json({ 
      message: `Branch ${branch.isActive ? 'activated' : 'deactivated'} successfully`, 
      data: branch 
    });
  } catch (error) {
    console.log("Error toggling branch status:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  toggleBranchStatus,
};
