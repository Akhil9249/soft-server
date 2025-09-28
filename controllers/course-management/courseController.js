// controllers/courseController.js
const Course = require("../../models/course-management/courseModel");
const Category = require("../../models/course-management/categoryModel");

// Create new course
const createCourse = async (req, res) => {
  try {
    const { courseName, duration, category, courseType, courseFee, modules } = req.body;

    if (!courseName || !duration || !category || !courseType || !courseFee) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if category exists
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if course with same name already exists in this category
    const existingCourse = await Course.findOne({ courseName, category });
    if (existingCourse) {
      return res.status(400).json({ message: "Course with this name already exists in this category" });
    }

    const newCourse = await Course.create({
      courseName,
      duration,
      category,
      courseType,
      courseFee,
      modules: modules || [],
      totalModules: modules ? modules.length : 0
    });

    // Add course to category's courses array
    existingCategory.courses.push(newCourse._id);
    existingCategory.totalCourses = existingCategory.courses.length;
    await existingCategory.save();

    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};

// Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("category", "categoryName")
      .populate("modules", "moduleName totalTopics");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single course
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("category", "categoryName")
      .populate("modules", "moduleName totalTopics");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const { modules, category: newCategoryId } = req.body;
    
    // Get current course to check if category is changing
    const currentCourse = await Course.findById(req.params.id);
    if (!currentCourse) return res.status(404).json({ message: "Course not found" });

    const updateData = { ...req.body };
    
    // If modules array is being updated, calculate totalModules
    if (modules !== undefined) {
      updateData.totalModules = modules.length;
    }

    // If category is changing, update category arrays
    if (newCategoryId && newCategoryId !== currentCourse.category.toString()) {
      // Remove course from old category
      const oldCategory = await Category.findById(currentCourse.category);
      if (oldCategory) {
        oldCategory.courses = oldCategory.courses.filter(courseId => courseId.toString() !== currentCourse._id.toString());
        oldCategory.totalCourses = oldCategory.courses.length;
        await oldCategory.save();
      }

      // Add course to new category
      const newCategory = await Category.findById(newCategoryId);
      if (newCategory) {
        newCategory.courses.push(currentCourse._id);
        newCategory.totalCourses = newCategory.courses.length;
        await newCategory.save();
      }
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "categoryName")
      .populate("modules", "moduleName totalTopics");

    res.status(200).json({ message: "Course updated", course: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await Course.findByIdAndDelete(req.params.id);

    // Remove course from category's courses array
    const category = await Category.findById(course.category);
    if (category) {
      category.courses = category.courses.filter(courseId => courseId.toString() !== course._id.toString());
      category.totalCourses = category.courses.length;
      await category.save();
    }

    res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
