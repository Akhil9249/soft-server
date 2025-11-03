// routes/materialRoutes.js
const express = require("express");
const router = express.Router();
const materialController = require("../controllers/task-management/materialController");
const { upload } = require("../uploads/multer");
const { checkAuth } = require("../middlewares/checkAuth");
const { checkMultipleRoles } = require("../middlewares/checkRole");

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
router.get("/", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(materialController.getMaterials));
router.post("/", checkAuth, checkRoles(["super admin", "admin"]), upload.single('attachments'), asyncHandler(materialController.createMaterial));

// Additional material operations (must be before /:id routes)
router.get("/mentor/:mentorId", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(materialController.getMaterialsByMentor));
router.get("/batch/:batchId", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(materialController.getMaterialsByBatch));
router.get("/course/:courseId", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(materialController.getMaterialsByCourse));
router.get("/audience/:audience", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(materialController.getMaterialsByAudience));
router.get("/:id/download", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(materialController.downloadAttachment));

// ID-based routes (must be last)
router.get("/:id", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(materialController.getMaterialById));
router.put("/:id", checkAuth, checkRoles(["super admin", "admin"]), upload.single('attachments'), asyncHandler(materialController.updateMaterial));
router.delete("/:id", checkAuth, checkRoles(["super admin", "admin"]), asyncHandler(materialController.deleteMaterial));

module.exports = router;
