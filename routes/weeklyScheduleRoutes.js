// routes/weeklyScheduleRoutes.js
const express = require("express");
const router = express.Router();
const weeklyScheduleController = require("../controllers/schedule/weeklyScheduleController");
const { checkAuth } = require("../middlewares/checkAuth");
// const { checkMultipleRoles } = require("../middlewares/checkRole");
const { checkAdmin, checkMentor, checkMultipleRoles } = require("../middlewares/checkRole");
// const asyncHandler = require("../middlewares/errorHandle");

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
// Basic CRUD operations
router.get("/mentors-batches",checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(weeklyScheduleController.getAllMentorsWithBatches));
router.get("/", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(weeklyScheduleController.getWeeklySchedules));
router.post("/", checkAuth, checkRoles(["super admin", "admin"]), asyncHandler(weeklyScheduleController.createWeeklySchedule));
router.get("/:id", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(weeklyScheduleController.getWeeklyScheduleById));
router.put("/:id", checkAuth, checkRoles(["super admin", "admin"]), asyncHandler(weeklyScheduleController.updateWeeklySchedule));
// router.delete("/:id", weeklyScheduleController.deleteWeeklySchedule);

// Advanced operations for managing schedule structure
router.post("/:id/time", checkAuth, checkRoles(["super admin", "admin"]), asyncHandler(weeklyScheduleController.addTimeToSchedule));
router.post("/:id/sub-details", checkAuth, checkRoles(["super admin", "admin"]), asyncHandler(weeklyScheduleController.addSubDetailsToTime));
router.post("/:id/batch", checkAuth, checkRoles(["super admin", "admin"]), asyncHandler(weeklyScheduleController.addBatchToSubDetails));
router.delete("/:id/batch", checkAuth, checkRoles(["super admin", "admin"]), asyncHandler(weeklyScheduleController.removeBatchFromSubDetails));
router.put("/:id/subject", checkAuth, checkRoles(["super admin", "admin"]), asyncHandler(weeklyScheduleController.updateSubjectInSubDetails));

module.exports = router;
