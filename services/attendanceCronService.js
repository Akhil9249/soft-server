// services/attendanceCronService.js
const Intern = require("../models/administration/internModel");
const InternsAttendance = require("../models/attendance/internsAttendanceModel");
const { Staff } = require("../models/administration/staffModel");

// Function to create daily attendance records for all ongoing interns
const createDailyAttendanceRecords = async () => {
  try {
    console.log('Starting daily attendance creation process...');
    
    // Get current date formatted as YYYY-MM-DD string
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${year}-${month}-${day}`;
    
    // Get all interns with "Ongoing" course status
    const ongoingInterns = await Intern.find({ 
      courseStatus: "Ongoing",
      // isActive: true 
    });
    console.log("ongoingInterns",ongoingInterns);
    
    console.log(`Found ${ongoingInterns.length} ongoing interns`);
    
    if (ongoingInterns.length === 0) {
      console.log('No ongoing interns found. Skipping attendance creation.');
      return;
    }
    
    // Get a default admin user to mark attendance (you can modify this logic)
    const defaultAdmin = await Staff.findOne({ 
      // role: "Admin", 
      role: "Mentor", 
      isActive: true 
    });
    
    if (!defaultAdmin) {
      console.error('No admin user found to mark attendance');
      return;
    }
    
    const attendanceRecords = [];
    const errors = [];
    
    // Create attendance records for each intern
    for (const intern of ongoingInterns) {
      try {
        // Check if attendance already exists for this intern on this date
        const existingAttendance = await InternsAttendance.findOne({
          intern: intern._id,
          date: formattedToday
        });
        
        if (existingAttendance) {
          console.log(`Attendance already exists for intern ${intern.fullName} on ${formattedToday}`);
          continue;
        }
        
        // Create new attendance record
        const attendanceRecord = {
          intern: intern._id,
          date: formattedToday,
          status: false, // Default to absent (will be updated when they actually attend)
          markedBy: defaultAdmin._id,
          remarks: "Auto-generated daily attendance record"
        };
        
        attendanceRecords.push(attendanceRecord);
        
      } catch (error) {
        console.error(`Error creating attendance for intern ${intern.fullName}:`, error.message);
        errors.push({
          intern: intern.fullName,
          error: error.message
        });
      }
    }
    
    // Bulk insert attendance records
    if (attendanceRecords.length > 0) {
      const createdRecords = await InternsAttendance.insertMany(attendanceRecords);
      console.log(`Successfully created ${createdRecords.length} attendance records`);
    }
    
    // Log any errors
    if (errors.length > 0) {
      console.error('Errors during attendance creation:', errors);
    }
    
    console.log('Daily attendance creation process completed');
    
  } catch (error) {
    console.error('Error in createDailyAttendanceRecords:', error);
  }
};

// Function to update attendance for a specific intern on a specific date
const updateInternAttendance = async (internId, date, status, markedBy, remarks = '') => {
  try {
    // Format date to YYYY-MM-DD string format
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Find or create attendance record
    let attendance = await InternsAttendance.findOne({
      intern: internId,
      date: formattedDate
    });
    
    if (!attendance) {
      // Create new attendance record
      attendance = await InternsAttendance.create({
        intern: internId,
        date: formattedDate,
        status: status,
        markedBy: markedBy,
        remarks: remarks || 'Updated via API'
      });
    } else {
      // Update existing record
      attendance.status = status;
      attendance.markedBy = markedBy;
      attendance.remarks = remarks || attendance.remarks;
      await attendance.save();
    }
    
    return attendance;
  } catch (error) {
    console.error('Error updating intern attendance:', error);
    throw error;
  }
};

// Function to get attendance summary for a date range
const getAttendanceSummary = async (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    const summary = await InternsAttendance.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'interns',
          localField: 'intern',
          foreignField: '_id',
          as: 'internDetails'
        }
      },
      {
        $unwind: '$internDetails'
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            status: { $cond: [{ $eq: ["$status", true] }, "Present", "Absent"] }
          },
          count: { $sum: 1 },
          interns: { $push: "$internDetails.fullName" }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          attendance: {
            $push: {
              status: "$_id.status",
              count: "$count",
              interns: "$interns"
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    return summary;
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    throw error;
  }
};

module.exports = {
  createDailyAttendanceRecords,
  updateInternAttendance,
  getAttendanceSummary
};
