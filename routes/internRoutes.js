// routes/internRoutes.js
const express = require("express");
const router = express.Router();
const internController = require("../controllers/administration/internController");

router.post("/", internController.addIntern);
router.get("/", internController.getInterns);
router.get("/search", internController.searchInterns);
router.get("/:id", internController.getInternById);
router.put("/:id", internController.updateIntern);
router.delete("/:id", internController.deleteIntern);

module.exports = router;
