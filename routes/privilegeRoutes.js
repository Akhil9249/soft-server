// routes/privilegeRoutes.js
const express = require("express");
const router = express.Router();
const privilegeController = require("../controllers/administration/privileController");

// Privilege CRUD operations
router.post("/", privilegeController.createPrivilege);
router.get("/", privilegeController.getPrivileges);
router.get("/:id", privilegeController.getPrivilegeById);
router.put("/:id", privilegeController.updatePrivilege);
router.delete("/:id", privilegeController.deletePrivilege);

// Privilege-specific operations
router.get("/role/:roleName", privilegeController.getPrivilegeByRole);
router.get("/permissions/:roleName", privilegeController.getPrivilegePermissions);

module.exports = router;
