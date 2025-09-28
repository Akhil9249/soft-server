// routes/branchRoutes.js
const express = require("express");
const router = express.Router();
const branchController = require("../controllers/settings/branchController");

// Branch routes
router.get("/", branchController.getBranches);
router.post("/", branchController.createBranch);
router.get("/:id", branchController.getBranchById);
router.put("/:id", branchController.updateBranch);
router.delete("/:id", branchController.deleteBranch);
router.patch("/:id/toggle-status", branchController.toggleBranchStatus);

module.exports = router;
