// routes/roleRoutes.js
const express = require("express");
const router = express.Router();
const roleController = require("../controllers/administration/roleController");

// Role CRUD operations
router.post("/", roleController.createRole);
router.get("/", roleController.getRoles);
router.get("/:id", roleController.getRoleById);
router.put("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

// Role-specific operations
router.get("/users/:roleName", roleController.getUsersByRole);
router.post("/assign", roleController.assignRoleToUser);
router.get("/permissions/:roleName", roleController.getRolePermissions);

module.exports = router;
