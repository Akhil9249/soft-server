// routes/weeklyScheduleRoutes.js
const express = require("express");
const router = express.Router();
const weeklyScheduleController = require("../controllers/schedule/weeklyScheduleController");

// Basic CRUD operations
router.post("/", weeklyScheduleController.createWeeklySchedule);
router.get("/", weeklyScheduleController.getWeeklySchedules);
router.get("/:id", weeklyScheduleController.getWeeklyScheduleById);
router.put("/:id", weeklyScheduleController.updateWeeklySchedule);
router.delete("/:id", weeklyScheduleController.deleteWeeklySchedule);

// Advanced operations for managing schedule structure
router.post("/:id/time", weeklyScheduleController.addTimeToSchedule);
router.post("/:id/sub-details", weeklyScheduleController.addSubDetailsToTime);
router.post("/:id/batch", weeklyScheduleController.addBatchToSubDetails);
router.delete("/:id/batch", weeklyScheduleController.removeBatchFromSubDetails);

module.exports = router;
