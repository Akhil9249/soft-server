// routes/pageRoutes.js
const express = require("express");
const router = express.Router();
const pageController = require("../controllers/settings/pageController");

router.post("/", pageController.createPage);
router.get("/", pageController.getPages);
router.get("/:slug", pageController.getPageBySlug);   // get page by slug
router.put("/:id", pageController.updatePage);
router.delete("/:id", pageController.deletePage);

module.exports = router;
