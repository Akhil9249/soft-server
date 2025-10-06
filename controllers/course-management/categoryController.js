// controllers/categoryController.js
const Category = require("../../models/course-management/categoryModel");

// Create new category
const createCategory = async (req, res) => {
  try {
    const { categoryName, branch, courses } = req.body;

    if (!categoryName || !branch) {
      return res.status(400).json({ message: "Category name and branch are required" });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    const newCategory = await Category.create({
      categoryName,
      branch,
      courses: courses || [],
      totalCourses: courses ? courses.length : 0
    });

    res.status(201).json({ message: "Category created successfully", data: newCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("courses", "courseName duration courseType courseFee");
    res.status(200).json({ message: "Categories retrieved successfully", data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single category
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("courses", "courseName duration courseType courseFee");
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category retrieved successfully", data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { courses } = req.body;
    
    const updateData = { ...req.body };
    
    // If courses array is being updated, calculate totalCourses
    if (courses !== undefined) {
      updateData.totalCourses = courses.length;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("courses", "courseName duration courseType courseFee");

    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
