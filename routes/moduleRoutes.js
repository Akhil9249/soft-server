// routes/moduleRoutes.js
const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/syllabus-management/moduleController");

router.get("/", moduleController.getModules);
router.post("/", moduleController.createModule);
router.get("/:id", moduleController.getModuleById);
router.put("/:id", moduleController.updateModule);
router.delete("/:id", moduleController.deleteModule);

module.exports = router;
