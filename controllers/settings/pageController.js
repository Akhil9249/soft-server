// controllers/pageController.js
// const Page = require("../models/pageModel");
const Page = require("../../models/settings/pageModel");

// Create Page
const createPage = async (req, res) => {
  try {
    const { menuName, pageTitle, pageSlug, pageContent, metaKeyword } = req.body;

    if (!menuName || !pageTitle || !pageSlug || !pageContent) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const exists = await Page.findOne({ pageSlug });
    if (exists) return res.status(400).json({ message: "Page slug already exists" });

    const newPage = await Page.create({ menuName, pageTitle, pageSlug, pageContent, metaKeyword });
    res.status(201).json({ message: "Page created successfully", data: newPage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Pages
const getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "Pages retrieved successfully", data: pages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Page by Slug
const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ pageSlug: req.params.slug });
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.status(200).json({ message: "Page retrieved successfully", data: page });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Page
const updatePage = async (req, res) => {
  try {
    const updated = await Page.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Page not found" });
    res.status(200).json({ message: "Page updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Page
const deletePage = async (req, res) => {
  try {
    const deleted = await Page.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Page not found" });
    res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPage,
  getPages,
  getPageBySlug,
  updatePage,
  deletePage,
};
