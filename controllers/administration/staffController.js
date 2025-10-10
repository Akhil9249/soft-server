// controllers/staffController.js
const { Staff } = require("../../models/administration/staffModel");
const WeeklySchedule = require("../../models/schedule/weeklyScheduleModel");
const Timing = require("../../models/schedule/timingModel");
const { generatePasswordHash } = require("../../utils/bcrypt");

// Helper function to create default weekly schedule for a mentor
const createDefaultWeeklySchedule = async (mentorId) => {
  try {
    // Check if weekly schedule already exists for this mentor
    const existingSchedule = await WeeklySchedule.findOne({ mentor: mentorId });
    if (existingSchedule) {
      console.log(`Weekly schedule already exists for mentor ${mentorId}`);
      return existingSchedule;
    }

    // Get default timings (you may need to adjust this based on your timing data)
    // const defaultTimings = await Timing.find({ isActive: true }).limit(3);
    const defaultTimings = await Timing.find().limit(3);
    
    if (defaultTimings.length === 0) {
      console.log('No default timings found, creating weekly schedule without specific timings');
      // Create a weekly schedule with empty schedule array
      const weeklySchedule = await WeeklySchedule.create({
        mentor: mentorId,
        schedule: []
      });
      return weeklySchedule;
    }

    // Create default schedule structure
    const defaultSchedule = defaultTimings.map(timing => ({
      time: timing._id,
      sub_details: [
        {
          days: "MWF",
          subject: "No class assigned",
          batch: []
        },
        {
          days: "TTS", 
          subject: "No class assigned",
          batch: []
        }
      ]
    }));

    const weeklySchedule = await WeeklySchedule.create({
      mentor: mentorId,
      schedule: defaultSchedule
    });

    console.log(`Default weekly schedule created for mentor ${mentorId}`);
    return weeklySchedule;
  } catch (error) {
    console.error('Error creating default weekly schedule:', error);
    throw error;
  }
};

// -------------------- CREATE Staff --------------------
const addStaff = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      staffPhoneNumber,
      staffWhatsAppNumber,
      staffPermanentAddress,
      district,
      state,
      photo,
      department,
      typeOfEmployee,
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
    if (!fullName || !dateOfBirth || !gender || !email || !staffPhoneNumber || 
        !department || !typeOfEmployee || !dateOfJoining || !employmentStatus || !officialEmail || !password) {
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

    // Validate typeOfEmployee enum
    if (!['Mentor', 'Carrer advisor', 'Placement coordinator', 'Front office staff'].includes(typeOfEmployee)) {
      return res.status(400).json({ message: "Type of employee must be Mentor, Carrer advisor, Placement coordinator, or Front office staff" });
    }

    // Validate role enum if provided
    if (role && !["Super Admin", "Admin", "Mentor", "Accountant"].includes(role)) {
      return res.status(400).json({ message: "Role must be Super Admin, Admin, Mentor, or Accountant" });
    }

    // Check duplicate email
    const existingEmail = await Staff.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Staff with this email already exists" });
    }

    // Check duplicate official email
    const existingOfficialEmail = await Staff.findOne({ officialEmail });
    if (existingOfficialEmail) {
      return res.status(400).json({ message: "Staff with this official email already exists" });
    }

    // Hash password
    const hashedPassword = await generatePasswordHash(password);

    // Create staff
    const newStaff = await Staff.create({
      fullName,
      dateOfBirth,
      gender,
      email,
      staffPhoneNumber,
      staffWhatsAppNumber,
      staffPermanentAddress,
      district,
      state,
      photo,
      department,
      typeOfEmployee,
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
    const populatedStaff = await Staff.findById(newStaff._id)
      .populate('branch', 'branchName');

    // Create weekly schedule if the staff member is a mentor
    if (newStaff.role === 'Mentor') {
      try {
        await createDefaultWeeklySchedule(newStaff._id);
        console.log(`Weekly schedule created for new mentor: ${newStaff.fullName}`);
      } catch (scheduleError) {
        console.error('Error creating weekly schedule for mentor:', scheduleError);
        // Don't fail the staff creation if weekly schedule creation fails
      }
    }

    res.status(201).json({ 
      message: "Staff created successfully", 
      data: populatedStaff 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error creating staff" });
  }
};

// -------------------- READ All Staff --------------------
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    res.status(200).json({ 
      message: "Staff fetched successfully", 
      data: staff 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching staff" });
  }
};

// -------------------- READ Single Staff --------------------
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('branch', 'branchName');
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.status(200).json({ 
      message: "Staff fetched successfully", 
      data: staff 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching staff" });
  }
};

// -------------------- UPDATE Staff --------------------
const updateStaff = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      gender,
      email,
      staffPhoneNumber,
      staffWhatsAppNumber,
      staffPermanentAddress,
      district,
      state,
      photo,
      department,
      typeOfEmployee,
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

    // Validate typeOfEmployee enum if provided
    if (typeOfEmployee && !["Mentor", "Carrer advisor", "Placement coordinator", "Front office staff"].includes(typeOfEmployee)) {
      return res.status(400).json({ message: "Type of employee must be Full-time, Part-time, Contract, Intern, or Consultant" });
    }

    // Validate role enum if provided
    if (role && !["Super Admin", "Admin", "Mentor", "Accountant"].includes(role)) {
      return res.status(400).json({ message: "Role must be Super Admin, Admin, Mentor, or Accountant" });
    }

    // Check for duplicate email if email is being updated
    if (email) {
      const existingEmail = await Staff.findOne({ email, _id: { $ne: req.params.id } });
      if (existingEmail) {
        return res.status(400).json({ message: "Staff with this email already exists" });
      }
    }

    // Check for duplicate official email if officialEmail is being updated
    if (officialEmail) {
      const existingOfficialEmail = await Staff.findOne({ officialEmail, _id: { $ne: req.params.id } });
      if (existingOfficialEmail) {
        return res.status(400).json({ message: "Staff with this official email already exists" });
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
      staffPhoneNumber,
      staffWhatsAppNumber,
      staffPermanentAddress,
      district,
      state,
      photo,
      department,
      typeOfEmployee,
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

    const staff = await Staff.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('branch', 'branchName');

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    // Create weekly schedule if the staff member is updated to be a mentor and doesn't have one
    if (staff.role === 'Mentor') {
      try {
        await createDefaultWeeklySchedule(staff._id);
        console.log(`Weekly schedule created/verified for mentor: ${staff.fullName}`);
      } catch (scheduleError) {
        console.error('Error creating weekly schedule for mentor:', scheduleError);
        // Don't fail the staff update if weekly schedule creation fails
      }
    }

    res.status(200).json({ 
      message: "Staff updated successfully", 
      data: staff 
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Error updating staff" });
  }
};

// -------------------- DELETE Staff --------------------
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }
    res.status(200).json({ 
      message: "Staff deleted successfully",
      data: { deletedStaff: staff }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error deleting staff" });
  }
};

// -------------------- SEARCH Staff --------------------
const searchStaff = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchTerm = q.trim();
    
    // Create search regex for case-insensitive search
    const searchRegex = new RegExp(searchTerm, 'i');
    
    // Search in multiple fields
    const staff = await Staff.find({
      $or: [
        { fullName: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { officialEmail: { $regex: searchRegex } },
        { staffPhoneNumber: { $regex: searchRegex } },
        { department: { $regex: searchRegex } },
        { employmentStatus: { $regex: searchRegex } }
      ]
    })
      .populate('branch', 'branchName')
      .limit(20); // Limit results to 20 for performance

    res.status(200).json({ 
      message: `Found ${staff.length} staff member(s) matching "${searchTerm}"`,
      data: staff 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error searching staff" });
  }
};

// -------------------- GET STAFF BY EMPLOYMENT STATUS --------------------
const getStaffByStatus = async (req, res) => {
  try {
    const { status } = req.params; // 'Active' or 'Inactive'
    
    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ message: "Status must be Active or Inactive" });
    }
    
    const staff = await Staff.find({ employmentStatus: status })
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: `Staff with status '${status}' fetched successfully`, 
      data: staff 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching staff by status" });
  }
};

// -------------------- GET STAFF BY BRANCH --------------------
const getStaffByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const staff = await Staff.find({ branch: branchId })
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: "Staff by branch fetched successfully", 
      data: staff 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching staff by branch" });
  }
};

// -------------------- GET STAFF BY DEPARTMENT --------------------
const getStaffByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    const staff = await Staff.find({ department })
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: `Staff in department '${department}' fetched successfully`, 
      data: staff 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching staff by department" });
  }
};

// -------------------- TOGGLE STAFF STATUS --------------------
const toggleStaffStatus = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    
    staff.isActive = !staff.isActive;
    await staff.save();
    
    const updatedStaff = await Staff.findById(staff._id)
      .populate('branch', 'branchName');
    
    res.status(200).json({ 
      message: `Staff ${updatedStaff.isActive ? 'activated' : 'deactivated'} successfully`, 
      data: updatedStaff 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error toggling staff status" });
  }
};

// -------------------- GET STAFF BY ROLE --------------------
const getStaffByRole = async (req, res) => {
  try {
    const { role } = req.params; // 'Mentor' or 'Admin'
    
    if (!["Super Admin", "Admin", "Mentor", "Accountant"].includes(role)) {
      return res.status(400).json({ message: "Role must be Super Admin, Admin, Mentor, or Accountant" });
    }
    
    const staff = await Staff.find({ role })
      .populate('branch', 'branchName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: `Staff with role '${role}' fetched successfully`, 
      data: staff 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error fetching staff by role" });
  }
};

module.exports = {
  addStaff,
  getStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  searchStaff,
  getStaffByStatus,
  getStaffByBranch,
  getStaffByDepartment,
  toggleStaffStatus,
  getStaffByRole,
};
