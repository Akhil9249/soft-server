// routes/staffRoutes.js
const express = require("express");
const router = express.Router();
const staffController = require("../controllers/administration/staffController");
const { upload } = require("../uploads/multer");

// Routes
router.get("/", staffController.getStaff); // Get all staff
router.post("/", upload.fields([{ name: 'photo', maxCount: 1 },{ name: 'resume', maxCount: 1 }]), staffController.addStaff); // Create staff
router.get("/:id", staffController.getStaffById); // Get single staff
router.put("/:id", upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), staffController.updateStaff); // Update staff
router.delete("/:id", staffController.deleteStaff); // Delete staff

module.exports = router;
