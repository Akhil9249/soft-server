// routes/moduleRoutes.js
const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/syllabus-management/moduleController");
const { upload } = require("../uploads/multer");

router.get("/", moduleController.getModules);
router.post("/", upload.single('moduleImage'), moduleController.createModule);
router.get("/:id", moduleController.getModuleById);
router.put("/:id", upload.single('moduleImage'), moduleController.updateModule);
router.delete("/:id", moduleController.deleteModule);
router.delete("/:moduleId/topics/:topicId", moduleController.removeTopicFromModule);

module.exports = router;
