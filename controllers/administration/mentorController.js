// controllers/mentorController.js
const { Mentor } = require("../../models/administration/mentorModel");
const { generatePasswordHash } = require("../../utils/bcrypt");

// -------------------- CREATE Mentor --------------------
const addMentor = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      mentorPhoneNumber,
      mentorWhatsAppNumber,
      mentorPermanentAddress,
      district,
      state,
      photo,
      department,
      branch,
      yearsOfExperience,
      dateOfJoining,
      employmentStatus,
      resignationDate,
      resume,
      remarks,
      role,
      officialEmail,
      password
    } = req.body;

    // Validate required fields according to schema
    if (!fullName || !dateOfBirth || !gender || !email || !mentorPhoneNumber || 
        !department || !dateOfJoining || !employmentStatus || !officialEmail || !password) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Validate branch if provided (should be ObjectId or empty)
    if (branch && branch.trim() === '') {
      branch = null; // Set to null if empty string
    }

    // Validate gender enum
    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Gender must be Male, Female, or Other" });
    }

    // Validate employment status enum
    if (!["Active", "Inactive"].includes(employmentStatus)) {
      return res.status(400).json({ message: "Employment status must be Active or Inactive" });
    }

    // Validate role enum if provided
    if (role && !["Mentor", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be Mentor or Admin" });
    }

    // Check duplicate email
    const existingEmail = await Mentor.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Mentor with this email already exists" });
    }

    // Check duplicate official email
    const existingOfficialEmail = await Mentor.findOne({ officialEmail });
    if (existingOfficialEmail) {
      return res.status(400).json({ message: "Mentor with this official email already exists" });
    }

    // Hash password
    const hashedPassword = await generatePasswordHash(password);

    // Create mentor
    const newMentor = await Mentor.create({
      fullName,
      dateOfBirth,
      gender,
      email,
      mentorPhoneNumber,
      mentorWhatsAppNumber,
      mentorPermanentAddress,
      district,
      state,
      photo,
      department,
      branch,
      yearsOfExperience: yearsOfExperience || 0,
      dateOfJoining,
      employmentStatus,
      resignationDate,
      resume,
      remarks,
      role: role || "Mentor",
      officialEmail,
      password: hashedPassword,
      isActive: true
    });

    // Populate branch field for response
    const populatedMentor = await Mentor.findById(newMentor._id)
      .populate('branch', 'branchName');

    res.status(201).json({ 
      message: "Mentor created successfully", 
      data: populatedMentor 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error creating mentor" });
  }
};

// -------------------- READ All Mentors --------------------
const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find()
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    res.status(200).json({ 
      message: "Mentors fetched successfully", 
      data: mentors 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching mentors" });
  }
};

// -------------------- READ Single Mentor --------------------
const getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate('branch', 'branchName');
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json({ 
      message: "Mentor fetched successfully", 
      data: mentor 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching mentor" });
  }
};

// -------------------- UPDATE Mentor --------------------
const updateMentor = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      mentorPhoneNumber,
      mentorWhatsAppNumber,
      mentorPermanentAddress,
      district,
      state,
      photo,
      department,
      branch,
      yearsOfExperience,
      dateOfJoining,
      employmentStatus,
      resignationDate,
      resume,
      remarks,
      role,
      officialEmail,
      password,
      isActive
    } = req.body;

    // Validate gender enum if provided
    if (gender && !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Gender must be Male, Female, or Other" });
    }

    // Validate employment status enum if provided
    if (employmentStatus && !["Active", "Inactive"].includes(employmentStatus)) {
      return res.status(400).json({ message: "Employment status must be Active or Inactive" });
    }

    // Validate role enum if provided
    if (role && !["Mentor", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be Mentor or Admin" });
    }

    // Check for duplicate email if email is being updated
    if (email) {
      const existingEmail = await Mentor.findOne({ email, _id: { $ne: req.params.id } });
      if (existingEmail) {
        return res.status(400).json({ message: "Mentor with this email already exists" });
      }
    }

    // Check for duplicate official email if officialEmail is being updated
    if (officialEmail) {
      const existingOfficialEmail = await Mentor.findOne({ officialEmail, _id: { $ne: req.params.id } });
      if (existingOfficialEmail) {
        return res.status(400).json({ message: "Mentor with this official email already exists" });
      }
    }

    // Validate branch if provided (should be ObjectId or empty)
    if (branch && branch.trim() === '') {
      branch = null; // Set to null if empty string
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
      mentorPhoneNumber,
      mentorWhatsAppNumber,
      mentorPermanentAddress,
      district,
      state,
      photo,
      department,
      branch,
      yearsOfExperience,
      dateOfJoining,
      employmentStatus,
      resignationDate,
      resume,
      remarks,
      role,
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

    const mentor = await Mentor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('branch', 'branchName');

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json({ 
      message: "Mentor updated successfully", 
      data: mentor 
    });
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
    res.status(200).json({ 
      message: "Mentor deleted successfully",
      data: { deletedMentor: mentor }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error deleting mentor" });
  }
};

// -------------------- SEARCH Mentors --------------------
const searchMentors = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchTerm = q.trim();
    
    // Create search regex for case-insensitive search
    const searchRegex = new RegExp(searchTerm, 'i');
    
    // Search in multiple fields
    const mentors = await Mentor.find({
      $or: [
        { fullName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { officialEmail: { $regex: searchRegex } },
        { mentorPhoneNumber: { $regex: searchRegex } },
        { department: { $regex: searchRegex } },
        { employmentStatus: { $regex: searchRegex } }
      ]
    })
      .populate('branch', 'branchName')
      .limit(20); // Limit results to 20 for performance

    res.status(200).json({ 
      message: `Found ${mentors.length} mentor(s) matching "${searchTerm}"`,
      data: mentors 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error searching mentors" });
  }
};

// -------------------- GET MENTORS BY EMPLOYMENT STATUS --------------------
const getMentorsByStatus = async (req, res) => {
  try {
    const { status } = req.params; // 'Active' or 'Inactive'
    
    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ message: "Status must be Active or Inactive" });
    }
    
    const mentors = await Mentor.find({ employmentStatus: status })
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: `Mentors with status '${status}' fetched successfully`, 
      data: mentors 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching mentors by status" });
  }
};

// -------------------- GET MENTORS BY BRANCH --------------------
const getMentorsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const mentors = await Mentor.find({ branch: branchId })
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: "Mentors by branch fetched successfully", 
      data: mentors 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching mentors by branch" });
  }
};

// -------------------- GET MENTORS BY DEPARTMENT --------------------
const getMentorsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    const mentors = await Mentor.find({ department })
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: `Mentors in department '${department}' fetched successfully`, 
      data: mentors 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching mentors by department" });
  }
};

// -------------------- TOGGLE MENTOR STATUS --------------------
const toggleMentorStatus = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });
    
    mentor.isActive = !mentor.isActive;
    await mentor.save();
    
    const updatedMentor = await Mentor.findById(mentor._id)
      .populate('branch', 'branchName');
    
    res.status(200).json({ 
      message: `Mentor ${updatedMentor.isActive ? 'activated' : 'deactivated'} successfully`, 
      data: updatedMentor 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error toggling mentor status" });
  }
};

// -------------------- GET MENTORS BY ROLE --------------------
const getMentorsByRole = async (req, res) => {
  try {
    const { role } = req.params; // 'Mentor' or 'Admin'
    
    if (!["Mentor", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be Mentor or Admin" });
    }
    
    const mentors = await Mentor.find({ role })
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: `Mentors with role '${role}' fetched successfully`, 
      data: mentors 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching mentors by role" });
  }
};

module.exports = {
  addMentor,
  getMentors,
  getMentorById,
  updateMentor,
  deleteMentor,
  searchMentors,
  getMentorsByStatus,
  getMentorsByBranch,
  getMentorsByDepartment,
  toggleMentorStatus,
  getMentorsByRole,
};
