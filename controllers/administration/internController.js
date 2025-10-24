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
      careerAdvisor,
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

    // Validate role enum if provided
    if (req.body.role && !["Intern", "Mentor", "Admin"].includes(req.body.role)) {
      return res.status(400).json({ message: "Role must be Intern, Mentor, or Admin" });
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
      careerAdvisor,
      remarks,
      internSyllabusStatus: internSyllabusStatus || "Not Started",
      placementStatus: placementStatus || "Not Placed",
      linkedin,
      portfolio,
      companyName,
      jobRole,
      resume,
      role: req.body.role || "Intern",
      officialEmail,
      password: hashedPassword,
      isActive: true
    });

    // Populate course and branch fields for response
    const populatedIntern = await Intern.findById(newIntern._id)
      .populate('course', 'courseName')
      .populate('branch', 'branchName')
      .populate('careerAdvisor', 'fullName email')
      .select('-password');

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
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    console.log("req.query", req.query);

    // Search parameters
    const search = req.query.search || '';
    const courseStatus = req.query.courseStatus || '';
    const course = req.query.course || '';
    const branch = req.query.branch || '';
    const batch = req.query.batch || '';

    // Build query object
    let query = {};

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { fullName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { internPhoneNumber: { $regex: searchRegex } },
        { batch: { $regex: searchRegex } }
      ];
    }

    // Add filters
    if (courseStatus) {
      query.courseStatus = courseStatus;
    }
    if (course) {
      query.course = course;
    }
    if (branch) {
      query.branch = branch;
    }
    if (batch) {
      query.batch = batch;
    }

    // Get total count for pagination
    const totalCount = await Intern.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated results
    const interns = await Intern.find(query)
      .populate('course', 'courseName')
      .populate('branch', 'branchName')
      .populate('careerAdvisor', 'fullName email')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log("interns", interns.length);

    if(!interns) return res.status(404).json({ message: "No interns found" });

    res.status(200).json({ 
      message: "Interns fetched successfully", 
      data: interns,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching interns" });
  }
};

// -------------------- READ Single Intern --------------------
const getInternById = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id)
      .populate('course', 'courseName')
      .populate('branch', 'branchName')
      .populate('careerAdvisor', 'fullName email')
      .select('-password');
    if (!intern) return res.status(404).json({ message: "Intern not found" });
    res.status(200).json({ 
      message: "Intern fetched successfully", 
      data: intern 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching intern" });
  }
};

// -------------------- READ Single Intern Details --------------------
const getInternDetails = async (req, res) => {
  try {
    const intern = await Intern.findById(req.userId)
      .populate('course', 'courseName')
      .populate('branch', 'branchName')
      .populate('careerAdvisor', 'fullName email')
      .select('-password -_id');
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
      careerAdvisor,
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
      role,
      isActive
    } = req.body;

    // Validate gender enum if provided
    if (gender && !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ message: "Gender must be Male, Female, or Other" });
    }

    // Validate role enum if provided
    if (role && !["Intern", "Mentor", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be Intern, Mentor, or Admin" });
    }

    // Validate courseStatus enum if provided
    if (courseStatus && !["Ongoing", "Completed", "Dropped"].includes(courseStatus)) {
      return res.status(400).json({ message: "Course status must be Ongoing, Completed, or Dropped" });
    }

    // Validate internSyllabusStatus enum if provided
    if (internSyllabusStatus && !["Not Started", "Learning", "mini Project", "Main Project"].includes(internSyllabusStatus)) {
      return res.status(400).json({ message: "Syllabus status must be Not Started, Learning, mini Project, or Main Project" });
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
      careerAdvisor,
      remarks,
      internSyllabusStatus,
      placementStatus,
      linkedin,
      portfolio,
      companyName,
      jobRole,
      resume,
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

    const intern = await Intern.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('course', 'courseName')
      .populate('branch', 'branchName')
      .populate('careerAdvisor', 'fullName email')
      .select('-password');

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
    const intern = await Intern.findByIdAndDelete(req.params.id).select('-password');
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
        { batch: { $regex: searchRegex } },
        { companyName: { $regex: searchRegex } },
        { jobRole: { $regex: searchRegex } }
      ]
    })
      .populate('course', 'courseName')
      .populate('branch', 'branchName')
      .populate('careerAdvisor', 'fullName email')
      .select('-password')
      .limit(20); // Limit results to 20 for performance

    res.status(200).json({ 
      message: `Found ${interns.length} intern(s) matching "${searchTerm}"`,
      data: interns 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error searching interns" });
  }
};

// -------------------- GET INTERNS BY STATUS --------------------
const getInternsByStatus = async (req, res) => {
  try {
    const { status } = req.params; // courseStatus, internSyllabusStatus, or placementStatus
    const { type } = req.query; // 'course', 'syllabus', or 'placement'
    
    let query = {};
    
    switch (type) {
      case 'course':
        query.courseStatus = status;
        break;
      case 'syllabus':
        query.internSyllabusStatus = status;
        break;
      case 'placement':
        query.placementStatus = status;
        break;
      default:
        return res.status(400).json({ message: "Invalid type parameter. Use 'course', 'syllabus', or 'placement'" });
    }
    
    const interns = await Intern.find(query)
      .populate('course', 'courseName')
      .populate('branch', 'branchName')
      .populate('careerAdvisor', 'fullName email')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: `Interns with ${type} status '${status}' fetched successfully`, 
      data: interns 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching interns by status" });
  }
};

// -------------------- GET INTERNS BY BRANCH --------------------
const getInternsByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const interns = await Intern.find({ branch: branchId })
      .populate('course', 'courseName')
      .populate('branch', 'branchName')
      .populate('careerAdvisor', 'fullName email')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: "Interns by branch fetched successfully", 
      data: interns 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching interns by branch" });
  }
};

// -------------------- TOGGLE INTERN STATUS --------------------
const toggleInternStatus = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ message: "Intern not found" });
    
    intern.isActive = !intern.isActive;
    await intern.save();
    
    const updatedIntern = await Intern.findById(intern._id)
      .populate('course', 'courseName')
      .populate('branch', 'branchName')
      .populate('careerAdvisor', 'fullName email')
      .select('-password');
    
    res.status(200).json({ 
      message: `Intern ${updatedIntern.isActive ? 'activated' : 'deactivated'} successfully`, 
      data: updatedIntern 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error toggling intern status" });
  }
};

module.exports = {
  addIntern,
  getInterns,
  getInternById,
  getInternDetails,
  updateIntern,
  deleteIntern,
  searchInterns,
  getInternsByStatus,
  getInternsByBranch,
  toggleInternStatus,
};
