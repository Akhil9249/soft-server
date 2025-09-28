// routes/batchRoutes.js
const express = require("express");
const router = express.Router();
const batchController = require("../controllers/schedule/batchController");

router.get("/", batchController.getBatches);
router.get("/:id", batchController.getBatchById);
router.post("/", batchController.createBatch);
router.put("/:id", batchController.updateBatch);
router.delete("/:id", batchController.deleteBatch);

// Intern routes
router.post("/:id/interns", batchController.addIntern); // add intern
router.delete("/:id/interns/:internId", batchController.removeIntern); // remove intern

module.exports = router;
