// controllers/attendance/internsAttendanceController.js
const InternsAttendance = require("../../models/attendance/internsAttendanceModel");
const { Staff } = require("../../models/administration/staffModel");
const Intern = require("../../models/administration/internModel");
const { createDailyAttendanceRecords, updateInternAttendance, getAttendanceSummary } = require("../../services/attendanceCronService");

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

    const attendance = await InternsAttendance.findById(id)
      .populate('intern', 'fullName email role')
      .populate('markedBy', 'fullName email');

    if (!attendance) {
      return res.status(404).json({ message: "Interns attendance not found" });
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

    // Validate status (Boolean: true for present, false for absent)
    if (status !== undefined && typeof status !== 'boolean') {
      return res.status(400).json({ 
        message: "Status must be a boolean value (true for present, false for absent)" 
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

    const attendance = await InternsAttendance.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: "Interns attendance not found" });
    }

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
    await createDailyAttendanceRecords();
    res.status(200).json({ 
      message: "Daily attendance records created successfully for all ongoing interns" 
    });
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
    
    const summary = await getAttendanceSummary(formattedStartDate, formattedEndDate);
    
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

// -------------------- GET INTERNS BY ATTENDANCE DATE --------------------
const getInternsByAttendanceDate = async (req, res) => {
  try {
    const { date, branchId } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        message: "Date parameter is required" 
      });
    }

    console.log("date", date, "branchId", branchId);
    
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
    
    // Get attendance records for the specified date
    let attendanceRecords = await InternsAttendance.find(query)
    .populate({
      path: 'intern',
      select: 'fullName email role courseStatus branch',
      populate: {
        path: 'branch',
        select: 'branchName'
      }
    })
    .sort({ createdAt: -1 });

    // Filter by branch if branchId is provided
    if (branchId) {
      attendanceRecords = attendanceRecords.filter(record => 
        record.intern.branch && record.intern.branch._id.toString() === branchId
      );
      console.log(`Filtered ${attendanceRecords.length} records for branch ${branchId}`);
    }

    // console.log("attendanceRecords",attendanceRecords);

    // Extract unique interns from attendance records
    const internsWithAttendance = attendanceRecords.map(record => ({
      _id: record.intern._id,
      fullName: record.intern.fullName,
      email: record.intern.email,
      role: record.intern.role,
      courseStatus: record.intern.courseStatus,
      branchId: record.intern.branch?._id,
      branchName: record.intern.branch?.branchName,
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
  getInternsByAttendanceDate
};
