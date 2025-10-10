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
  getInternsByAttendanceDate
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

function Temp(req, res, next) {
  console.log("Temp");
  // next();
  
}



// GET /api/interns-attendance - Get all interns attendance with pagination and filters
// router.get("/", checkRoles(["Admin", "Mentor"]), asyncHandler(getInternsAttendance));
router.get("/",checkAuth, checkRoles(["Admin", "Mentor"]), asyncHandler(getInternsAttendance));

// GET /api/interns-attendance/interns-by-date - Get interns based on attendance collection for a specific date
router.get("/interns-by-date",checkAuth , checkRoles(["Admin", "Mentor"]), asyncHandler(getInternsByAttendanceDate));

// GET /api/interns-attendance/summary-report - Get detailed attendance summary report
router.get("/summary-report", checkRoles(["Admin", "Mentor"]), asyncHandler(getAttendanceSummaryReport));

// GET /api/interns-attendance/date-range - Get interns attendance by date range
router.get("/date-range/range", checkRoles(["Admin", "Mentor"]), asyncHandler(getInternsAttendanceByDateRange));

// GET /api/interns-attendance/summary - Get interns attendance summary
router.get("/summary/overview", checkRoles(["Admin", "Mentor"]), asyncHandler(getInternsAttendanceSummary));


// GET /api/interns-attendance/:id - Get single interns attendance by ID
router.get("/:id", checkRoles(["Admin", "Mentor"]), asyncHandler(getInternsAttendanceById));

// POST /api/interns-attendance - Create new interns attendance
router.post("/",checkAuth, checkRoles(["Admin", "Mentor"]), asyncHandler(addInternsAttendance));
// router.post("/", asyncHandler(addInternsAttendance));

// PUT /api/interns-attendance/update-single - Update single intern attendance
router.put("/update-single",checkAuth, checkRoles(["Admin", "Mentor"]), asyncHandler(updateSingleInternAttendance));

// PUT /api/interns-attendance/:id - Update interns attendance
router.put("/:id", checkRoles(["Admin", "Mentor"]), asyncHandler(updateInternsAttendance));

// DELETE /api/interns-attendance/:id - Delete interns attendance (soft delete)
router.delete("/:id", checkAdmin, asyncHandler(deleteInternsAttendance));


// POST /api/interns-attendance/create-daily - Create daily attendance for all ongoing interns
// router.post("/create-daily",checkAuth, checkAdmin, asyncHandler(createDailyAttendanceForAllInterns));
router.post("/create-daily",checkAuth,checkRoles(["Admin", "Mentor"]), asyncHandler(createDailyAttendanceForAllInterns));






module.exports = router;
