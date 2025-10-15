const Task = require("../../models/task-management/taskModel");

// Helper function to validate that only one audience field has data
const validateSingleAudienceField = (batches, courses, interns, individualInterns) => {
  const audienceFields = [
    { field: 'batches', data: batches },
    { field: 'courses', data: courses },
    { field: 'interns', data: interns },
    { field: 'individualInterns', data: individualInterns }
  ];
  
  const fieldsWithData = audienceFields.filter(field => field.data && field.data.length > 0);
  
  if (fieldsWithData.length > 1) {
    return {
      isValid: false,
      message: `Only one audience type can be specified at a time. Found data in: ${fieldsWithData.map(f => f.field).join(', ')}`
    };
  }
  
  return { isValid: true };
};

// Create new task
const createTask = async (req, res) => {
  try {
    const {
      title,
      taskType,
      module,
      assignedMentor,
      startDate,
      dueDate,
      description,
      attachments,
      totalMarks,
      achievedMarks,
      status,
      audience,
      batches,
      courses,
      interns,
      individualInterns
    } = req.body;

    console.log("Creating task:", {
      title,
      taskType,
      module,
      assignedMentor,
      startDate,
      dueDate,
      description,
      attachments,
      totalMarks,
      achievedMarks,
      status,
      audience,
      batches,
      courses,
      interns,
      individualInterns
    });

    // Validate required fields
    if (!title || !taskType || !module || !assignedMentor || !startDate || !dueDate || !description || !audience) {
      return res.status(400).json({
        message: "Title, task type, module, assigned mentor, start date, due date, description, and audience are required"
      });
    }

    // Validate taskType enum
    if (!["Weekly Task", "Daily Task"].includes(taskType)) {
      return res.status(400).json({
        message: "Task type must be either 'Weekly Task' or 'Daily Task'"
      });
    }

    // Validate audience enum
    if (!["All interns", "By batches", "By courses", "Individual interns"].includes(audience)) {
      return res.status(400).json({
        message: "Audience must be one of: 'All interns', 'By batches', 'By courses', 'Individual interns'"
      });
    }

    // Validate audience-specific fields
    if (audience === "By batches" && (!batches || batches.length === 0)) {
      return res.status(400).json({
        message: "Batches are required when audience is 'By batches'"
      });
    }

    if (audience === "By courses" && (!courses || courses.length === 0)) {
      return res.status(400).json({
        message: "Courses are required when audience is 'By courses'"
      });
    }

    if (audience === "Individual interns" && (!individualInterns || individualInterns.length === 0)) {
      return res.status(400).json({
        message: "Individual interns are required when audience is 'Individual interns'"
      });
    }

    // Validate that only one audience field can have data at a time
    const audienceValidation = validateSingleAudienceField(batches, courses, interns, individualInterns);
    if (!audienceValidation.isValid) {
      return res.status(400).json({
        message: audienceValidation.message
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const due = new Date(dueDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
      return res.status(400).json({
        message: "Invalid date format"
      });
    }
    
    // Compare dates (due date should be after start date)
    if (start >= due) {
      return res.status(400).json({
        message: "Due date must be after start date"
      });
    }

    // Handle attachments field properly
    let attachmentsValue = null;
    if (attachments && typeof attachments === 'string' && attachments.trim() !== '') {
      attachmentsValue = attachments.trim();
    } else if (attachments && typeof attachments === 'object' && Object.keys(attachments).length > 0) {
      // If it's an object with content, convert to string or handle as needed
      attachmentsValue = JSON.stringify(attachments);
    }

    const newTask = await Task.create({
      title: title.trim(),
      taskType: taskType,
      module: module.trim(),
      assignedMentor: assignedMentor,
      startDate: start,
      dueDate: due,
      description: description.trim(),
      attachments: attachmentsValue,
      totalMarks: totalMarks ? Number(totalMarks) : 0,
      achievedMarks: achievedMarks ? Number(achievedMarks) : 0,
      status: status || "Pending",
      audience: audience,
      batches: batches || [],
      courses: courses || [],
      interns: interns || [],
      individualInterns: individualInterns || []
    });

    res.status(201).json({
      message: "Task created successfully",
      data: newTask
    });
  } catch (error) {
    console.log("Error creating task:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks
const getTasks = async (req, res) => {
  try {
    console.log('Fetching tasks...');
    const tasks = await Task.find({ isActive: true })
      .populate('assignedMentor', 'fullName email')
      .populate('batches', 'batchName description')
      .populate('courses', 'courseName description')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email')
      .sort({ createdAt: -1 });
    console.log('Found tasks:', tasks.length);
    res.status(200).json({
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedMentor', 'fullName email')
      .populate('batches', 'batchName description')
      .populate('courses', 'courseName description')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email');

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task retrieved successfully",
      data: task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const {
      title,
      taskType,
      module,
      assignedMentor,
      startDate,
      dueDate,
      description,
      attachments,
      totalMarks,
      achievedMarks,
      status,
      audience,
      batches,
      courses,
      interns,
      individualInterns
    } = req.body;

    // Validate taskType enum if provided
    if (taskType && !["Weekly Task", "Daily Task"].includes(taskType)) {
      return res.status(400).json({
        message: "Task type must be either 'Weekly Task' or 'Daily Task'"
      });
    }

    // Validate audience enum if provided
    if (audience && !["All interns", "By batches", "By courses", "Individual interns"].includes(audience)) {
      return res.status(400).json({
        message: "Audience must be one of: 'All interns', 'By batches', 'By courses', 'Individual interns'"
      });
    }

    // Validate audience-specific fields if audience is being updated
    if (audience === "By batches" && (!batches || batches.length === 0)) {
      return res.status(400).json({
        message: "Batches are required when audience is 'By batches'"
      });
    }

    if (audience === "By courses" && (!courses || courses.length === 0)) {
      return res.status(400).json({
        message: "Courses are required when audience is 'By courses'"
      });
    }

    if (audience === "Individual interns" && (!individualInterns || individualInterns.length === 0)) {
      return res.status(400).json({
        message: "Individual interns are required when audience is 'Individual interns'"
      });
    }

    // Validate that only one audience field can have data at a time
    const audienceValidation = validateSingleAudienceField(batches, courses, interns, individualInterns);
    if (!audienceValidation.isValid) {
      return res.status(400).json({
        message: audienceValidation.message
      });
    }

    // Validate dates if provided
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(due.getTime())) {
        return res.status(400).json({
          message: "Invalid date format"
        });
      }
      
      // Compare dates (due date should be after start date)
      if (start >= due) {
        return res.status(400).json({
          message: "Due date must be after start date"
        });
      }
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (taskType) updateData.taskType = taskType;
    if (module) updateData.module = module.trim();
    if (assignedMentor) updateData.assignedMentor = assignedMentor;
    if (startDate) updateData.startDate = new Date(startDate);
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (description) updateData.description = description.trim();
    if (attachments !== undefined) {
      // Handle attachments field properly
      if (attachments && typeof attachments === 'string' && attachments.trim() !== '') {
        updateData.attachments = attachments.trim();
      } else if (attachments && typeof attachments === 'object' && Object.keys(attachments).length > 0) {
        updateData.attachments = JSON.stringify(attachments);
      } else {
        updateData.attachments = null;
      }
    }
    if (totalMarks !== undefined) updateData.totalMarks = Number(totalMarks);
    if (achievedMarks !== undefined) updateData.achievedMarks = Number(achievedMarks);
    if (status) updateData.status = status;
    if (audience) updateData.audience = audience;
    if (batches !== undefined) updateData.batches = batches;
    if (courses !== undefined) updateData.courses = courses;
    if (interns !== undefined) updateData.interns = interns;
    if (individualInterns !== undefined) updateData.individualInterns = individualInterns;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('assignedMentor', 'fullName email')
    .populate('batches', 'batchName description')
    .populate('courses', 'courseName description')
    .populate('interns', 'fullName email')
    .populate('individualInterns', 'fullName email');

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task updated successfully",
      data: updated
    });
  } catch (error) {
    console.log("Error updating task:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete task (soft delete)
const deleteTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      data: updated
    });
  } catch (error) {
    console.log("Error deleting task:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by batch
const getTasksByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const tasks = await Task.find({ 
      batches: batchId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks by batch:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by mentor
const getTasksByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const tasks = await Task.find({ 
      assignedMentor: mentorId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks by mentor:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by status
const getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const tasks = await Task.find({ 
      status: status, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status || !["Pending", "In Progress", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Valid status is required (Pending, In Progress, Completed, Cancelled)"
      });
    }

    const updated = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task status updated successfully",
      data: updated
    });
  } catch (error) {
    console.log("Error updating task status:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update task marks
const updateTaskMarks = async (req, res) => {
  try {
    const { achievedMarks, totalMarks } = req.body;
    const { id } = req.params;

    const updateData = {};
    if (achievedMarks !== undefined) updateData.achievedMarks = Number(achievedMarks);
    if (totalMarks !== undefined) updateData.totalMarks = Number(totalMarks);

    // Auto-update status to Completed if marks are provided
    if (achievedMarks !== undefined && totalMarks !== undefined) {
      if (Number(achievedMarks) >= Number(totalMarks)) {
        updateData.status = "Completed";
      } else if (Number(achievedMarks) > 0) {
        updateData.status = "In Progress";
      }
    }

    const updated = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task marks updated successfully",
      data: updated
    });
  } catch (error) {
    console.log("Error updating task marks:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get tasks by course
const getTasksByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tasks = await Task.find({ 
      courses: courseId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks by course:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by intern
const getTasksByIntern = async (req, res) => {
  try {
    const { internId } = req.params;
    const tasks = await Task.find({ 
      $or: [
        { interns: internId },
        { individualInterns: internId }
      ],
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks by intern:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by audience type
const getTasksByAudience = async (req, res) => {
  try {
    const { audienceType } = req.params;
    const tasks = await Task.find({ 
      audience: audienceType, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks by audience:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by task type
const getTasksByType = async (req, res) => {
  try {
    const { taskType } = req.params;
    const tasks = await Task.find({ 
      taskType: taskType, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks by type:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByBatch,
  getTasksByMentor,
  getTasksByStatus,
  updateTaskStatus,
  updateTaskMarks,
  getTasksByCourse,
  getTasksByIntern,
  getTasksByAudience,
  getTasksByType
};
