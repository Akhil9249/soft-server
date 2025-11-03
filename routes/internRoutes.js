// routes/internRoutes.js
const express = require("express");
const router = express.Router();
const internController = require("../controllers/administration/internController");
const {checkAuth }= require("../middlewares/checkAuth");
const { upload } = require("../uploads/multer");
router.get("/", internController.getInterns);
router.get("/search", internController.searchInterns);
router.get("/details",checkAuth, internController.getInternDetails);
router.get("/:id", internController.getInternById);
router.post("/", upload.fields([{ name: 'photo', maxCount: 1 },{ name: 'resume', maxCount: 1 }]), internController.addIntern);
router.put("/:id", upload.fields([{ name: 'photo', maxCount: 1 },{ name: 'resume', maxCount: 1 }]),internController.updateIntern);
router.delete("/:id", internController.deleteIntern);

module.exports = router;