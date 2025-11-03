// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task-management/taskController");
const { upload } = require("../uploads/multer");

// Basic CRUD operations
router.get("/", taskController.getTasks);
router.post("/", upload.single('attachments'), taskController.createTask);
router.get("/:id", taskController.getTaskById);
router.put("/:id", upload.single('attachments'), taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Additional task operations
router.get("/batch/:batchName", taskController.getTasksByBatch);
router.get("/mentor/:mentorName", taskController.getTasksByMentor);
router.get("/status/:status", taskController.getTasksByStatus);
router.patch("/:id/status", taskController.updateTaskStatus);
router.patch("/:id/marks", taskController.updateTaskMarks);

module.exports = router;
