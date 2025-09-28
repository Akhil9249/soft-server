// controllers/mentorController.js
const { Mentor } = require("../../models/administration/mentorModel");

// -------------------- CREATE Mentor --------------------
const addMentor = async (req, res) => {
  try {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).json({ message: "Mentor created successfully", mentor });
  } catch (error) {
    res.status(400).json({ message: error.message || "Error creating mentor" });
  }
};

// -------------------- READ All Mentors --------------------
const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching mentors" });
  }
};

// -------------------- READ Single Mentor --------------------
const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching mentor" });
  }
};

// -------------------- UPDATE Mentor --------------------
const updateMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json({ message: "Mentor updated successfully", mentor });
  } catch (error) {
    res.status(400).json({ message: error.message || "Error updating mentor" });
  }
};

// -------------------- DELETE Mentor --------------------
const deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json({ message: "Mentor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error deleting mentor" });
  }
};

module.exports = {
  addMentor,
  getMentors,
  getMentorById,
  updateMentor,
  deleteMentor,
};
