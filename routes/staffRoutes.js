// routes/staffRoutes.js
const express = require("express");
const router = express.Router();
const staffController = require("../controllers/administration/staffController");

// Routes
router.get("/", staffController.getStaff); // Get all staff
router.post("/", staffController.addStaff); // Create staff
router.get("/:id", staffController.getStaffById); // Get single staff
router.put("/:id", staffController.updateStaff); // Update staff
router.delete("/:id", staffController.deleteStaff); // Delete staff

module.exports = router;
