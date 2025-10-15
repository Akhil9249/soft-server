// routes/internRoutes.js
const express = require("express");
const router = express.Router();
const internController = require("../controllers/administration/internController");
const {checkAuth }= require("../middlewares/checkAuth");

router.get("/", internController.getInterns);
router.get("/search", internController.searchInterns);
router.get("/details",checkAuth, internController.getInternDetails);
router.get("/:id", internController.getInternById);
router.post("/", internController.addIntern);
router.put("/:id", internController.updateIntern);
router.delete("/:id", internController.deleteIntern);

module.exports = router;
