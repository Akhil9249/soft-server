// routes/materialRoutes.js
const express = require("express");
const router = express.Router();
const materialController = require("../controllers/task-management/materialController");

// Basic CRUD operations
router.get("/", materialController.getMaterials);
router.post("/", materialController.createMaterial);
router.get("/:id", materialController.getMaterialById);
router.put("/:id", materialController.updateMaterial);
router.delete("/:id", materialController.deleteMaterial);

// Additional material operations
router.get("/mentor/:mentorId", materialController.getMaterialsByMentor);
router.get("/batch/:batchId", materialController.getMaterialsByBatch);
router.get("/course/:courseId", materialController.getMaterialsByCourse);
router.get("/audience/:audience", materialController.getMaterialsByAudience);

module.exports = router;
