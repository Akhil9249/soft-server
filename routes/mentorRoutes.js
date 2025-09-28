// routes/mentorRoutes.js
const express = require("express");
const router = express.Router();
const mentorController = require("../controllers/administration/mentorController");

// Routes
router.get("/", mentorController.getMentors); // Get all mentors
router.post("/", mentorController.addMentor); // Create mentor
router.get("/:id", mentorController.getMentorById); // Get single mentor
router.put("/:id", mentorController.updateMentor); // Update mentor
router.delete("/:id", mentorController.deleteMentor); // Delete mentor

module.exports = router;
