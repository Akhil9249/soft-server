// routes/timingRoutes.js
const express = require("express");
const router = express.Router();
// const timingController = require("../controllers/timingController");
const timingController = require("../controllers/schedule/timingController");

router.post("/", timingController.createTiming);
router.get("/", timingController.getTimings);
router.get("/:id", timingController.getTimingById);
router.put("/:id", timingController.updateTiming);
router.delete("/:id", timingController.deleteTiming);

module.exports = router;
