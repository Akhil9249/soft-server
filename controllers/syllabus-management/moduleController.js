// controllers/moduleController.js
const Module = require("../../models/syllabus-management/moduleModel");
const Course = require("../../models/course-management/courseModel");

// Create new module
const createModule = async (req, res) => {
  try {
    const { moduleName, course, moduleImage, topics } = req.body;

    if (!moduleName || !course) {
      return res.status(400).json({ message: "Module name and course are required" });
    }

    // Check if course exists
    const existingCourse = await Course.findById(course);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if module with same name already exists in this course
    const existingModule = await Module.findOne({ moduleName, course });
    if (existingModule) {
      return res.status(400).json({ message: "Module with this name already exists in this course" });
    }

    const newModule = await Module.create({
      moduleName,
      course,
      moduleImage: moduleImage || null,
      topics: topics || [],
      totalTopics: topics ? topics.length : 0
    });

    // Add module to course's modules array
    existingCourse.modules.push(newModule._id);
    existingCourse.totalModules = existingCourse.modules.length;
    await existingCourse.save();

    res.status(201).json({ message: "Module created successfully", module: newModule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all modules
const getModules = async (req, res) => {
  try {
    const modules = await Module.find()
      .populate("course", "courseName")
      .populate("topics", "topicName");
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single module
const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate("course", "courseName")
      .populate("topics", "topicName");
    if (!module) return res.status(404).json({ message: "Module not found" });
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update module
const updateModule = async (req, res) => {
  try {
    const { topics, course: newCourseId } = req.body;
    
    // Get current module to check if course is changing
    const currentModule = await Module.findById(req.params.id);
    if (!currentModule) return res.status(404).json({ message: "Module not found" });

    const updateData = { ...req.body };
    
    // If topics array is being updated, calculate totalTopics
    if (topics !== undefined) {
      updateData.totalTopics = topics.length;
    }

    // If course is changing, update course arrays
    if (newCourseId && newCourseId !== currentModule.course.toString()) {
      // Remove module from old course
      const oldCourse = await Course.findById(currentModule.course);
      if (oldCourse) {
        oldCourse.modules = oldCourse.modules.filter(moduleId => moduleId.toString() !== currentModule._id.toString());
        oldCourse.totalModules = oldCourse.modules.length;
        await oldCourse.save();
      }

      // Add module to new course
      const newCourse = await Course.findById(newCourseId);
      if (newCourse) {
        newCourse.modules.push(currentModule._id);
        newCourse.totalModules = newCourse.modules.length;
        await newCourse.save();
      }
    }

    const updated = await Module.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("course", "courseName")
      .populate("topics", "topicName");

    res.status(200).json({ message: "Module updated", module: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete module
const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: "Module not found" });

    await Module.findByIdAndDelete(req.params.id);

    // Remove module from course's modules array
    const course = await Course.findById(module.course);
    if (course) {
      course.modules = course.modules.filter(moduleId => moduleId.toString() !== module._id.toString());
      course.totalModules = course.modules.length;
      await course.save();
    }

    res.status(200).json({ message: "Module deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
};
