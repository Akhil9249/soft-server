// controllers/attendance/internsAttendanceController.js
const InternsAttendance = require("../../models/attendance/internsAttendanceModel");
const { Staff } = require("../../models/administration/staffModel");
const { User } = require("../../models/userModel");
const Intern = require("../../models/administration/internModel");
const Batch = require("../../models/schedule/batchModel");
const WeeklySchedule = require("../../models/schedule/weeklyScheduleModel");
const { createDailyAttendanceRecords, updateInternAttendance, getAttendanceSummary } = require("../../services/attendanceCronService");

// -------------------- HELPER FUNCTION: Get Mentor's Interns from WeeklySchedule --------------------
const getMentorInternsFromWeeklySchedule = async (mentorId) => {
  try {
    // Get mentor's weekly schedule
    const weeklySchedule = await WeeklySchedule.findOne({ mentor: mentorId })
      .populate({
        path: 'schedule.sub_details.batch',
        populate: {
          path: 'interns',
          model: 'Intern'
        }
      });

    if (!weeklySchedule) {
      return { interns: [], message: "No weekly schedule found for this mentor" };
    }

    // Extract all unique interns from all batches in the schedule
    const allInterns = [];
    const internIds = new Set(); // To avoid duplicates

    weeklySchedule.schedule.forEach(timeSlot => {
      timeSlot.sub_details.forEach(subDetail => {
        if (subDetail.batch && subDetail.batch.length > 0) {
          subDetail.batch.forEach(batch => {
            if (batch.interns && batch.interns.length > 0) {
              batch.interns.forEach(intern => {
                if (!internIds.has(intern._id.toString())) {
                  internIds.add(intern._id.toString());
                  allInterns.push(intern);
                }
              });
            }
          });
        }
      });
    });

    return { 
      interns: allInterns, 
      message: `Found ${allInterns.length} interns assigned to this mentor through weekly schedule` 
    };
  } catch (error) {
    console.error("Error getting mentor interns from weekly schedule:", error);
    return { interns: [], message: "Error retrieving mentor's interns" };
  }
};

// -------------------- HELPER FUNCTION: Check Mentor Permissions --------------------
const checkMentorPermissions = async (mentorId, internId) => {
  try {
    // Get mentor details
    let mentor = null
    mentor = await Staff.findById(mentorId);
    if (!mentor) {
      mentor = await User.findById(mentorId);
    }
    if (!mentor) {
      return { allowed: false, reason: "Mentor not found" };
    }

    // If mentor is Admin or Super Admin, allow access to all interns
    if (mentor.role === 'Admin' || mentor.role === 'Super Admin') {
      return { allowed: true };
    }

    // For mentors, check if the intern is in their weekly schedule
    const mentorInterns = await getMentorInternsFromWeeklySchedule(mentorId);
    const internIds = mentorInterns.interns.map(intern => intern._id.toString());
    
    const hasAccess = internIds.includes(internId.toString());
    
    return { 
      allowed: hasAccess, 
      reason: hasAccess ? "Access granted" : "Intern not in mentor's weekly schedule" 
    };
  } catch (error) {
    console.error("Error checking mentor permissions:", error);
    return { allowed: false, reason: "Error checking permissions" };
  }
};

// -------------------- CREATE Interns Attendance --------------------
const addInternsAttendance = async (req, res) => {
  try {
    const {
      intern,
      date,
      status,
      checkInTime,
      checkOutTime,
      totalHours,
      remarks,
      markedBy
    } = req.body;

    // Validate required fields
    if (!intern || !date || !status || !markedBy) {
      return res.status(400).json({ 
        message: "Intern, date, status, and markedBy are required" 
      });
    }

    // Check mentor permissions
    const permissionCheck = await checkMentorPermissions(markedBy, intern);
    if (!permissionCheck.allowed) {
      return res.status(403).json({ 
        message: `Access denied: ${permissionCheck.reason}` 
      });
    }

    // Validate status (Boolean: true for present, false for absent)
    if (typeof status !== 'boolean') {
      return res.status(400).json({ 
        message: "Status must be a boolean value (true for present, false for absent)" 
      });
    }

    // Check if intern exists
    const internExists = await Intern.findById(intern);
    if (!internExists) {
      return res.status(404).json({ message: "Intern not found" });
    }

    // Check if markedBy exists
    const markedByExists = await Staff.findById(markedBy);
    if (!markedByExists) {
      return res.status(404).json({ message: "Marked by user not found" });
    }

    // Format date to "YYYY-MM-DD" string format
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log("Input date:", date);
    console.log("Formatted date:", formattedDate);
    console.log("Type of formatted date:", typeof formattedDate);
    
    // Check for duplicate attendance on the same date
    const existingAttendance = await InternsAttendance.findOne({
      intern: intern,
      date: formattedDate
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        message: "Attendance already marked for this intern on this date" 
      });
    }

    const newAttendance = await InternsAttendance.create({
      intern,
      date: formattedDate,  // Store as "2025-10-09" string format
      status,
      checkInTime,
      checkOutTime,
      totalHours,
      remarks,
      markedBy
    });

    // Populate the response with intern and markedBy details
    const populatedAttendance = await InternsAttendance.findById(newAttendance._id)
      .populate('intern', 'fullName email')
      .populate('markedBy', 'fullName email');

    res.status(201).json({ 
      message: "Interns attendance created successfully", 
      data: populatedAttendance 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error creating interns attendance" });
  }
};

// -------------------- GET All Interns Attendance --------------------
const getInternsAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, intern, date, status } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.userId;

    // Build filter object
    const filter = { isActive: true };
    if (intern) filter.intern = intern;
    if (date) {
      // Format date to "YYYY-MM-DD" string format for comparison
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      filter.date = `${year}-${month}-${day}`;
    }
    if (status) filter.status = status;

    // Check user role and apply appropriate filtering
    const user = await Staff.findById(userId);
    if (user && user.role === 'Mentor') {
      // For mentors, get all interns from mentor's weekly schedule
      const mentorInterns = await getMentorInternsFromWeeklySchedule(userId);
      const allowedInternIds = mentorInterns.interns.map(intern => intern._id);
      
      if (allowedInternIds.length === 0) {
        return res.status(200).json({
          message: "No interns found in your weekly schedule",
          data: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalRecords: 0,
            hasNext: false,
            hasPrev: false
          }
        });
      }
      
      filter.intern = { $in: allowedInternIds };
    }
    // For Super Admin and Admin, no additional filtering is applied - they can see all interns

    const attendance = await InternsAttendance.find(filter)
      .populate('intern', 'fullName email role')
      .populate('markedBy', 'fullName email')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InternsAttendance.countDocuments(filter);

    res.status(200).json({
      message: "Interns attendance retrieved successfully",
      data: attendance,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error retrieving interns attendance" });
  }
};

// -------------------- GET Single Interns Attendance --------------------
const getInternsAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const attendance = await InternsAttendance.findById(id)
      .populate('intern', 'fullName email role')
      .populate('markedBy', 'fullName email');

    if (!attendance) {
      return res.status(404).json({ message: "Interns attendance not found" });
    }

    // Check mentor permissions
    const permissionCheck = await checkMentorPermissions(userId, attendance.intern._id);
    if (!permissionCheck.allowed) {
      return res.status(403).json({ 
        message: `Access denied: ${permissionCheck.reason}` 
      });
    }

    res.status(200).json({ 
      message: "Interns attendance retrieved successfully", 
      data: attendance 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error retrieving interns attendance" });
  }
};

// -------------------- UPDATE Interns Attendance --------------------
const updateInternsAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      checkInTime,
      checkOutTime,
      totalHours,
      remarks
    } = req.body;
    const userId = req.userId;

    // Validate status (Boolean: true for present, false for absent)
    if (status !== undefined && typeof status !== 'boolean') {
      return res.status(400).json({ 
        message: "Status must be a boolean value (true for present, false for absent)" 
      });
    }

    // First get the attendance record to check the intern
    const existingAttendance = await InternsAttendance.findById(id);
    if (!existingAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Check user role and permissions
    let user = null;
    user = await Staff.findById(userId);
    if (!user) {
      user = await User.findById(userId);
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Super Admin and Admin can update any attendance record
    if (user.role === 'Super Admin' || user.role === 'Admin') {
      // Allow update for all interns
    } else if (user.role === 'Mentor') {
      // For mentors, check if they have permission for this intern
      const permissionCheck = await checkMentorPermissions(userId, existingAttendance.intern);
      if (!permissionCheck.allowed) {
        return res.status(403).json({ 
          message: `Access denied: ${permissionCheck.reason}` 
        });
      }
    } else {
      return res.status(403).json({ 
        message: "Access denied: Only Super Admin, Admin, or assigned Mentors can update attendance records" 
      });
    }

    const attendance = await InternsAttendance.findByIdAndUpdate(
      id,
      {
        status,
        checkInTime,
        checkOutTime,
        totalHours,
        remarks
      },
      { new: true, runValidators: true }
    )
      .populate('intern', 'fullName email role')
      .populate('markedBy', 'fullName email');

    if (!attendance) {
      return res.status(404).json({ message: "Interns attendance not found" });
    }

    res.status(200).json({ 
      message: "Interns attendance updated successfully", 
      data: attendance 
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Error updating interns attendance" });
  }
};

// -------------------- DELETE Interns Attendance --------------------
const deleteInternsAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // First get the attendance record to check the intern
    const existingAttendance = await InternsAttendance.findById(id);
    if (!existingAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Check user role and permissions
    let user = null;
    user = await Staff.findById(userId);
    if (!user) {
      user = await User.findById(userId);
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Super Admin and Admin can delete any attendance record
    if (user.role === 'Super Admin' || user.role === 'Admin') {
      // Allow delete for all interns
    } else if (user.role === 'Mentor') {
      // For mentors, check if they have permission for this intern
      const permissionCheck = await checkMentorPermissions(userId, existingAttendance.intern);
      if (!permissionCheck.allowed) {
        return res.status(403).json({ 
          message: `Access denied: ${permissionCheck.reason}` 
        });
      }
    } else {
      return res.status(403).json({ 
        message: "Access denied: Only Super Admin, Admin, or assigned Mentors can delete attendance records" 
      });
    }

    const attendance = await InternsAttendance.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    res.status(200).json({ 
      message: "Interns attendance deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error deleting interns attendance" });
  }
};

// -------------------- GET Interns Attendance by Date Range --------------------
const getInternsAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, intern } = req.query;
    const userId = req.userId;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required" 
      });
    }

    // Format dates to "YYYY-MM-DD" string format for comparison
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    const startYear = startDateObj.getFullYear();
    const startMonth = String(startDateObj.getMonth() + 1).padStart(2, '0');
    const startDay = String(startDateObj.getDate()).padStart(2, '0');
    const formattedStartDate = `${startYear}-${startMonth}-${startDay}`;
    
    const endYear = endDateObj.getFullYear();
    const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDateObj.getDate()).padStart(2, '0');
    const formattedEndDate = `${endYear}-${endMonth}-${endDay}`;
    
    const filter = {
      isActive: true,
      date: {
        $gte: formattedStartDate,
        $lte: formattedEndDate
      }
    };

    if (intern) filter.intern = intern;

    // Check user role and apply appropriate filtering
    const user = await Staff.findById(userId);
    if (user && user.role === 'Mentor') {
      // For mentors, get all interns from mentor's weekly schedule
      const mentorInterns = await getMentorInternsFromWeeklySchedule(userId);
      const allowedInternIds = mentorInterns.interns.map(intern => intern._id);
      
      if (allowedInternIds.length === 0) {
        return res.status(200).json({
          message: "No interns found in your weekly schedule",
          data: []
        });
      }
      
      filter.intern = { $in: allowedInternIds };
    }
    // For Super Admin and Admin, no additional filtering is applied - they can see all interns

    const attendance = await InternsAttendance.find(filter)
      .populate('intern', 'fullName email role')
      .populate('markedBy', 'fullName email')
      .sort({ date: -1 });

    res.status(200).json({
      message: "Interns attendance retrieved successfully",
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error retrieving interns attendance" });
  }
};

// -------------------- GET Interns Attendance Summary --------------------
const getInternsAttendanceSummary = async (req, res) => {
  try {
    const { intern, startDate, endDate } = req.query;
    const userId = req.userId;

    const filter = { isActive: true };
    if (intern) filter.intern = intern;
    if (startDate && endDate) {
      // Format dates to "YYYY-MM-DD" string format for comparison
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      const startYear = startDateObj.getFullYear();
      const startMonth = String(startDateObj.getMonth() + 1).padStart(2, '0');
      const startDay = String(startDateObj.getDate()).padStart(2, '0');
      const formattedStartDate = `${startYear}-${startMonth}-${startDay}`;
      
      const endYear = endDateObj.getFullYear();
      const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
      const endDay = String(endDateObj.getDate()).padStart(2, '0');
      const formattedEndDate = `${endYear}-${endMonth}-${endDay}`;
      
      filter.date = {
        $gte: formattedStartDate,
        $lte: formattedEndDate
      };
    }

    // Check user role and apply appropriate filtering
    const user = await Staff.findById(userId);
    if (user && user.role === 'Mentor') {
      // For mentors, get all interns from mentor's weekly schedule
      const mentorInterns = await getMentorInternsFromWeeklySchedule(userId);
      const allowedInternIds = mentorInterns.interns.map(intern => intern._id);
      
      if (allowedInternIds.length === 0) {
        return res.status(200).json({
          message: "No interns found in your weekly schedule",
          data: {
            summary: [],
            totalRecords: 0
          }
        });
      }
      
      filter.intern = { $in: allowedInternIds };
    }
    // For Super Admin and Admin, no additional filtering is applied - they can see all interns

    const summary = await InternsAttendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$status", true] }, "Present", "Absent"] },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRecords = await InternsAttendance.countDocuments(filter);

    res.status(200).json({
      message: "Interns attendance summary retrieved successfully",
      data: {
        summary,
        totalRecords
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error retrieving interns attendance summary" });
  }
};

// -------------------- CREATE DAILY ATTENDANCE FOR ALL ONGOING INTERNS --------------------
const createDailyAttendanceForAllInterns = async (req, res) => {
  try {
    const userId = req.userId;
    let user = null;
    user = await Staff.findById(userId)
    if (!user) {
      user = await User.findById(userId)
    }
    // const user = await Staff.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }
    
    // Super Admin and Admin can create attendance for all interns
    if (user.role === 'Super Admin' || user.role === 'Admin') {
      await createDailyAttendanceRecords();
      res.status(200).json({ 
        message: "Daily attendance records created successfully for all ongoing interns" 
      });
    } else if (user.role === 'Mentor') {
      // For mentors, create attendance only for their weekly schedule interns
      const mentorInterns = await getMentorInternsFromWeeklySchedule(userId);
      const allowedInternIds = mentorInterns.interns.map(intern => intern._id);
      
      if (allowedInternIds.length === 0) {
        return res.status(200).json({ 
          message: "No interns found in your weekly schedule" 
        });
      }
      
      // Create attendance records for mentor's weekly schedule interns only
      await createDailyAttendanceRecords(allowedInternIds);
      res.status(200).json({ 
        message: `Daily attendance records created successfully for ${allowedInternIds.length} interns in your weekly schedule` 
      });
    } else {
      res.status(403).json({ 
        message: "Access denied: Only Super Admin, Admin, or assigned Mentors can create daily attendance records" 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: error.message || "Error creating daily attendance records" 
    });
  }
};

// -------------------- UPDATE SINGLE INTERN ATTENDANCE --------------------
const updateSingleInternAttendance = async (req, res) => {
  try {
    const { internId, date, status, remarks } = req.body;
    console.log("req.body",req.body);
    const markedBy = req.userId;

    if (!internId || !date || typeof status !== 'boolean' || !markedBy) {
      return res.status(400).json({ 
        message: "InternId, date, status (boolean), and markedBy are required" 
      });
    }

    // Check mentor permissions
    const permissionCheck = await checkMentorPermissions(markedBy, internId);
    if (!permissionCheck.allowed) {
      return res.status(403).json({ 
        message: `Access denied: ${permissionCheck.reason}` 
      });
    }

    // Format date to "YYYY-MM-DD" string format
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const attendance = await updateInternAttendance(internId, formattedDate, status, markedBy, remarks);
    
    const populatedAttendance = await InternsAttendance.findById(attendance._id)
      .populate('intern', 'fullName email')
      .populate('markedBy', 'fullName email');

    res.status(200).json({ 
      message: "Intern attendance updated successfully", 
      data: populatedAttendance 
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || "Error updating intern attendance" 
    });
  }
};

// -------------------- GET ATTENDANCE SUMMARY --------------------
const getAttendanceSummaryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required" 
      });
    }

    // Format dates to "YYYY-MM-DD" string format
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    const startYear = startDateObj.getFullYear();
    const startMonth = String(startDateObj.getMonth() + 1).padStart(2, '0');
    const startDay = String(startDateObj.getDate()).padStart(2, '0');
    const formattedStartDate = `${startYear}-${startMonth}-${startDay}`;
    
    const endYear = endDateObj.getFullYear();
    const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDateObj.getDate()).padStart(2, '0');
    const formattedEndDate = `${endYear}-${endMonth}-${endDay}`;
    
    // Check user role and apply appropriate filtering
    const user = await Staff.findById(userId);
    let allowedInternIds = null;
    
    if (user && user.role === 'Mentor') {
      // For mentors, get all interns from mentor's weekly schedule
      const mentorInterns = await getMentorInternsFromWeeklySchedule(userId);
      allowedInternIds = mentorInterns.interns.map(intern => intern._id);
      
      if (allowedInternIds.length === 0) {
        return res.status(200).json({
          message: "No interns found in your weekly schedule",
          data: {
            summary: [],
            totalRecords: 0
          }
        });
      }
    }
    // For Super Admin and Admin, allowedInternIds remains null - they can see all interns
    
    const summary = await getAttendanceSummary(formattedStartDate, formattedEndDate, allowedInternIds);
    
    res.status(200).json({
      message: "Attendance summary retrieved successfully",
      data: summary
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || "Error retrieving attendance summary" 
    });
  }
};

// -------------------- GET MENTOR'S INTERNS FROM WEEKLY SCHEDULE --------------------
const getMentorInterns = async (req, res) => {
  try {
    const userId = req.userId;
    const { mentorId } = req.params;

    // Check if user is requesting their own interns or is admin
    const user = await Staff.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Allow mentors to get their own interns, or admins to get any mentor's interns
    const targetMentorId = mentorId || userId;
    
    if (user.role !== 'Admin' && user.role !== 'Super Admin' && targetMentorId !== userId) {
      return res.status(403).json({ 
        message: "Access denied: You can only view your own assigned interns" 
      });
    }

    // Get mentor's interns from weekly schedule
    const result = await getMentorInternsFromWeeklySchedule(targetMentorId);
    
    // Get mentor details
    const mentor = await Staff.findById(targetMentorId).select('fullName email role');
    
    res.status(200).json({
      message: "Mentor's interns retrieved successfully",
      data: {
        mentor: mentor,
        interns: result.interns,
        totalCount: result.interns.length,
        message: result.message
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || "Error retrieving mentor's interns" 
    });
  }
};

// -------------------- GET INTERNS BY ATTENDANCE DATE --------------------
const getInternsByAttendanceDate = async (req, res) => {
  try {
    const { date, branchId, days, courseId, timingId } = req.query;
    const userId = req.userId;

    console.log("req.query", req.query);
    if (!date) {
      return res.status(400).json({ 
        message: "Date parameter is required" 
      });
    }

    console.log("date", date, "branchId", branchId, "days", days, "courseId", courseId, "timingId", timingId);
    
    // Format date to "YYYY-MM-DD" string format for comparison
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    console.log("formattedDate", formattedDate);
    
    // Build query for attendance records
    const query = { 
      date: formattedDate,
      isActive: true 
    };

    // Check user role and apply appropriate filtering
    const user = await Staff.findById(userId);
    if (user && user.role === 'Mentor') {
      // For mentors, get all interns from mentor's weekly schedule
      const mentorInterns = await getMentorInternsFromWeeklySchedule(userId);
      const allowedInternIds = mentorInterns.interns.map(intern => intern._id);
      
      if (allowedInternIds.length === 0) {
        return res.status(200).json({
          message: "No interns found in your weekly schedule",
          data: [],
          totalCount: 0
        });
      }
      
      query.intern = { $in: allowedInternIds };
    }
    // For Super Admin and Admin, no additional filtering is applied - they can see all interns
    
    // Get attendance records for the specified date
    let attendanceRecords = await InternsAttendance.find(query)
    .populate({
      path: 'intern',
      select: 'fullName email role courseStatus branch course',
      populate: [
        {
          path: 'branch',
          select: 'branchName'
        },
        {
          path: 'course',
          select: 'courseName category',
          populate: {
            path: 'category',
            select: 'categoryName'
          }
        }
      ]
    })
    .sort({ createdAt: -1 });

    // Apply filters
    let filteredRecords = attendanceRecords;

    // Filter by branch if branchId is provided
    if (branchId) {
      filteredRecords = filteredRecords.filter(record => 
        record.intern.branch && record.intern.branch._id.toString() === branchId
      );
      console.log(`Filtered ${filteredRecords.length} records for branch ${branchId}`);
    }

    // Filter by course if courseId is provided
    if (courseId) {
      filteredRecords = filteredRecords.filter(record => 
        record.intern.course && 
        record.intern.course._id.toString() === courseId
      );
      console.log(`Filtered ${filteredRecords.length} records for course ${courseId}`);
    }

    // Filter by days (MWF/TTS) if days is provided
    if (days) {
      console.log(`Filtering by days: ${days}`);
      
      // Get all weekly schedules that have the specified days
      const weeklySchedules = await WeeklySchedule.find({
        'schedule.sub_details.days': days
      }).populate({
        path: 'schedule.sub_details.batch',
        populate: {
          path: 'interns',
          model: 'Intern'
        }
      });

      if (weeklySchedules && weeklySchedules.length > 0) {
        // Extract all unique interns from all batches in the schedules with the specified days
        const daysInternIds = new Set();
        
        weeklySchedules.forEach(weeklySchedule => {
          weeklySchedule.schedule.forEach(timeSlot => {
            timeSlot.sub_details.forEach(subDetail => {
              // Check if this subDetail has the specified days
              if (subDetail.days === days && subDetail.batch && subDetail.batch.length > 0) {
                subDetail.batch.forEach(batch => {
                  if (batch.interns && batch.interns.length > 0) {
                    batch.interns.forEach(intern => {
                      daysInternIds.add(intern._id.toString());
                    });
                  }
                });
              }
            });
          });
        });

        // Filter attendance records by days-based intern IDs
        if (daysInternIds.size > 0) {
          const daysIdsArray = Array.from(daysInternIds);
          filteredRecords = filteredRecords.filter(record => 
            daysIdsArray.includes(record.intern._id.toString())
          );
          console.log(`Filtered ${filteredRecords.length} records for days ${days}`);
        } else {
          console.log(`No interns found for days ${days}`);
          filteredRecords = []; // No records match the days filter
        }
      } else {
        console.log(`No weekly schedule found for days ${days}`);
        filteredRecords = []; // No records match the days filter
      }
    }

    // Filter by timing if timingId is provided
    if (timingId) {
      console.log(`Filtering by timing: ${timingId}`);
      
      // Get all weekly schedules that have the specified timing
      const weeklySchedules = await WeeklySchedule.find({
        'schedule.time': timingId
      }).populate({
        path: 'schedule.sub_details.batch',
        populate: {
          path: 'interns',
          model: 'Intern'
        }
      });

      if (weeklySchedules && weeklySchedules.length > 0) {
        // Extract all unique interns from all batches in the schedules with the specified timing
        const timingInternIds = new Set();
        
        weeklySchedules.forEach(weeklySchedule => {
          weeklySchedule.schedule.forEach(timeSlot => {
            // Check if this timeSlot has the specified timing
            if (timeSlot.time && timeSlot.time.toString() === timingId) {
              timeSlot.sub_details.forEach(subDetail => {
                if (subDetail.batch && subDetail.batch.length > 0) {
                  subDetail.batch.forEach(batch => {
                    if (batch.interns && batch.interns.length > 0) {
                      batch.interns.forEach(intern => {
                        timingInternIds.add(intern._id.toString());
                      });
                    }
                  });
                }
              });
            }
          });
        });

        // Filter attendance records by timing-based intern IDs
        if (timingInternIds.size > 0) {
          const timingIdsArray = Array.from(timingInternIds);
          filteredRecords = filteredRecords.filter(record => 
            timingIdsArray.includes(record.intern._id.toString())
          );
          console.log(`Filtered ${filteredRecords.length} records for timing ${timingId}`);
        } else {
          console.log(`No interns found for timing ${timingId}`);
          filteredRecords = []; // No records match the timing filter
        }
      } else {
        console.log(`No weekly schedule found for timing ${timingId}`);
        filteredRecords = []; // No records match the timing filter
      }
    }

    console.log("filteredRecords===", filteredRecords.length);

    // Extract unique interns from filtered attendance records
    const internsWithAttendance = filteredRecords.map(record => ({
      _id: record.intern._id,
      fullName: record.intern.fullName,
      email: record.intern.email,
      role: record.intern.role,
      courseStatus: record.intern.courseStatus,
      branchId: record.intern.branch?._id,
      branchName: record.intern.branch?.branchName,
      courseId: record.intern.course?._id,
      courseName: record.intern.course?.courseName,
      categoryId: record.intern.course?.category?._id,
      categoryName: record.intern.course?.category?.categoryName,
      attendanceStatus: record.status,
      attendanceId: record._id,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      totalHours: record.totalHours,
      remarks: record.remarks,
      markedBy: record.markedBy
    }));

    res.status(200).json({
      message: "Interns with attendance retrieved successfully",
      data: internsWithAttendance,
      totalCount: internsWithAttendance.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message || "Error retrieving interns by attendance date" 
    });
  }
};

module.exports = {
  addInternsAttendance,
  getInternsAttendance,
  getInternsAttendanceById,
  updateInternsAttendance,
  deleteInternsAttendance,
  getInternsAttendanceByDateRange,
  getInternsAttendanceSummary,
  createDailyAttendanceForAllInterns,
  updateSingleInternAttendance,
  getAttendanceSummaryReport,
  getInternsByAttendanceDate,
  getMentorInterns
};
