// routes/internsAttendanceRoutes.js
const express = require("express");
const router = express.Router();
const {
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
  getMentorInterns,
  getInternsAttendanceByMonth
} = require("../controllers/attendance/internsAttendanceController");

// Import middleware for role checking
const { checkAdmin, checkMentor, checkMultipleRoles } = require("../middlewares/checkRole");
const { checkAuth } = require("../middlewares/checkAuth");

// Async wrapper to handle promises
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create middleware wrapper for checkMultipleRoles
const checkRoles = (roles) => {
  return (req, res, next) => {
    checkMultipleRoles(req, res, next, roles);
  };
};

// -------------------- INTERNS ATTENDANCE ROUTES --------------------



// GET /api/interns-attendance - Get all interns attendance with pagination and filters
router.get("/", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(getInternsAttendance));

// GET /api/interns-attendance/interns-by-date - Get interns based on attendance collection for a specific date
router.get("/interns-by-date",checkAuth , checkRoles(["admin", "mentor","super admin"]), asyncHandler(getInternsByAttendanceDate));

// GET /api/interns-attendance/summary-report - Get detailed attendance summary report
router.get("/summary-report", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(getAttendanceSummaryReport));

// GET /api/interns-attendance/date-range - Get interns attendance by date range
router.get("/date-range/range", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(getInternsAttendanceByDateRange));

// GET /api/interns-attendance/summary - Get interns attendance summary
router.get("/summary/overview", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(getInternsAttendanceSummary));

// GET /api/interns-attendance/mentor-interns/:mentorId? - Get interns for a mentor based on WeeklySchedule
router.get("/mentor-interns/:mentorId?", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(getMentorInterns));

// GET /api/interns-attendance/month - Get all interns attendance for a specific month
router.get("/month", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(getInternsAttendanceByMonth));

// GET /api/interns-attendance/:id - Get single interns attendance by ID
router.get("/:id", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(getInternsAttendanceById));


// POST /api/interns-attendance - Create new interns attendance
router.post("/", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(addInternsAttendance));

// PUT /api/interns-attendance/update-single - Update single intern attendance
router.put("/update-single", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(updateSingleInternAttendance));

// PUT /api/interns-attendance/:id - Update interns attendance
router.put("/:id", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(updateInternsAttendance));

// DELETE /api/interns-attendance/:id - Delete interns attendance (soft delete)
router.delete("/:id", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(deleteInternsAttendance));


// POST /api/interns-attendance/create-daily - Create daily attendance for all ongoing interns
router.post("/create-daily", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(createDailyAttendanceForAllInterns));








module.exports = router;
