// controllers/internController.js
// const Intern = require("../models/internModel");
const Intern = require("../../models/administration/internModel");
const bcrypt = require("bcrypt");
const { generatePasswordHash } = require("../../utils/bcrypt");

// -------------------- CREATE Intern --------------------
const addIntern = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      internPhoneNumber,
      internWhatsAppNumber,
      guardianName,
      fatherName,
      motherName,
      guardianParentPhone,
      internPermanentAddress,
      district,
      state,
      photo,
      course,
      branch,
      courseStartedDate,
      completionDate,
      batch,
      courseStatus,
      remarks,
      internSyllabusStatus,
      placementStatus,
      linkedin,
      portfolio,
      companyName,
      jobRole,
      resume,
      officialEmail,
      password
    } = req.body;

    // Validate required fields according to schema
    if (!fullName || !dateOfBirth || !gender || !email || !internPhoneNumber || !branch || !courseStartedDate || !officialEmail || !password) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Validate gender enum
    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Gender must be Male, Female, or Other" });
    }

    // Check duplicate email
    const existingEmail = await Intern.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Intern with this email already exists" });
    }

    // Check duplicate official email
    const existingOfficialEmail = await Intern.findOne({ officialEmail });
    if (existingOfficialEmail) {
      return res.status(400).json({ message: "Intern with this official email already exists" });
    }

    // Hash password
    const hashedPassword = await generatePasswordHash(password);

    // Create intern
    const newIntern = await Intern.create({
      fullName,
      dateOfBirth,
      gender,
      email,
      internPhoneNumber,
      internWhatsAppNumber,
      guardianName,
      fatherName,
      motherName,
      guardianParentPhone,
      internPermanentAddress,
      district,
      state,
      photo,
      course,
      branch,
      courseStartedDate,
      completionDate,
      batch,
      courseStatus: courseStatus || "Ongoing",
      remarks,
      internSyllabusStatus: internSyllabusStatus || "Not Started",
      placementStatus: placementStatus || "Not Placed",
      linkedin,
      portfolio,
      companyName,
      jobRole,
      resume,
      officialEmail,
      password: hashedPassword,
      isActive: true
    });

    // Populate course field for response
    const populatedIntern = await Intern.findById(newIntern._id).populate('course', 'courseName');

    res.status(201).json({ 
      message: "Intern created successfully", 
      data: populatedIntern 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// -------------------- READ All Interns --------------------
const getInterns = async (req, res) => {
  try {
    const interns = await Intern.find().populate('course', 'courseName');
    res.status(200).json({ 
      message: "Interns fetched successfully", 
      data: interns 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching interns" });
  }
};

// -------------------- READ Single Intern --------------------
const getInternById = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id).populate('course', 'courseName');
    if (!intern) return res.status(404).json({ message: "Intern not found" });
    res.status(200).json({ 
      message: "Intern fetched successfully", 
      data: intern 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching intern" });
  }
};

// -------------------- UPDATE Intern --------------------
const updateIntern = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      internPhoneNumber,
      internWhatsAppNumber,
      guardianName,
      fatherName,
      motherName,
      guardianParentPhone,
      internPermanentAddress,
      district,
      state,
      photo,
      course,
      branch,
      courseStartedDate,
      completionDate,
      batch,
      courseStatus,
      remarks,
      internSyllabusStatus,
      placementStatus,
      linkedin,
      portfolio,
      companyName,
      jobRole,
      resume,
      officialEmail,
      password,
      isActive
    } = req.body;

    // Validate gender enum if provided
    if (gender && !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Gender must be Male, Female, or Other" });
    }

    // Validate courseStatus enum if provided
    if (courseStatus && !["Ongoing", "Completed", "Dropped"].includes(courseStatus)) {
      return res.status(400).json({ message: "Course status must be Ongoing, Completed, or Dropped" });
    }

    // Validate internSyllabusStatus enum if provided
    if (internSyllabusStatus && !["Not Started", "In Progress", "Completed"].includes(internSyllabusStatus)) {
      return res.status(400).json({ message: "Syllabus status must be Not Started, In Progress, or Completed" });
    }

    // Validate placementStatus enum if provided
    if (placementStatus && !["Placed", "Not Placed", "In Progress"].includes(placementStatus)) {
      return res.status(400).json({ message: "Placement status must be Placed, Not Placed, or In Progress" });
    }

    // Check for duplicate email if email is being updated
    if (email) {
      const existingEmail = await Intern.findOne({ email, _id: { $ne: req.params.id } });
      if (existingEmail) {
        return res.status(400).json({ message: "Intern with this email already exists" });
      }
    }

    // Check for duplicate official email if officialEmail is being updated
    if (officialEmail) {
      const existingOfficialEmail = await Intern.findOne({ officialEmail, _id: { $ne: req.params.id } });
      if (existingOfficialEmail) {
        return res.status(400).json({ message: "Intern with this official email already exists" });
      }
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await generatePasswordHash(password);
    }

    // Prepare update object
    const updateData = {
      fullName,
      dateOfBirth,
      gender,
      email,
      internPhoneNumber,
      internWhatsAppNumber,
      guardianName,
      fatherName,
      motherName,
      guardianParentPhone,
      internPermanentAddress,
      district,
      state,
      photo,
      course,
      branch,
      courseStartedDate,
      completionDate,
      batch,
      courseStatus,
      remarks,
      internSyllabusStatus,
      placementStatus,
      linkedin,
      portfolio,
      companyName,
      jobRole,
      resume,
      officialEmail,
      isActive
    };

    // Add hashed password if provided
    if (hashedPassword) {
      updateData.password = hashedPassword;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const intern = await Intern.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('course', 'courseName');

    if (!intern) return res.status(404).json({ message: "Intern not found" });
    res.status(200).json({ 
      message: "Intern updated successfully", 
      data: intern 
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Error updating intern" });
  }
};

// -------------------- DELETE Intern --------------------
const deleteIntern = async (req, res) => {
  try {
    const intern = await Intern.findByIdAndDelete(req.params.id);
    if (!intern) return res.status(404).json({ message: "Intern not found" });
    res.status(200).json({ 
      message: "Intern deleted successfully",
      data: { deletedIntern: intern }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error deleting intern" });
  }
};

// -------------------- SEARCH Interns --------------------
const searchInterns = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchTerm = q.trim();
    
    // Create search regex for case-insensitive search
    const searchRegex = new RegExp(searchTerm, 'i');
    
    // Search in multiple fields
    const interns = await Intern.find({
      $or: [
        { fullName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { officialEmail: { $regex: searchRegex } },
        { internPhoneNumber: { $regex: searchRegex } },
        { branch: { $regex: searchRegex } },
        { batch: { $regex: searchRegex } },
        { companyName: { $regex: searchRegex } },
        { jobRole: { $regex: searchRegex } }
      ]
    }).populate('course', 'courseName').limit(20); // Limit results to 20 for performance

    res.status(200).json({ 
      message: `Found ${interns.length} intern(s) matching "${searchTerm}"`,
      data: interns 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error searching interns" });
  }
};

module.exports = {
  addIntern,
  getInterns,
  getInternById,
  updateIntern,
  deleteIntern,
  searchInterns,
};
