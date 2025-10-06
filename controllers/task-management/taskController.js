const Task = require("../../models/task-management/taskModel");

// Create new task
const createTask = async (req, res) => {
  try {
    const {
      title,
      batch,
      module,
      assignedMentor,
      startDate,
      dueDate,
      description,
      attachments,
      totalMarks,
      achievedMarks,
      status
    } = req.body;

    console.log("Creating task:", {
      title,
      batch,
      module,
      assignedMentor,
      startDate,
      dueDate,
      description,
      attachments,
      totalMarks,
      achievedMarks,
      status
    });

    // Validate required fields
    if (!title || !batch || !module || !assignedMentor || !startDate || !dueDate || !description) {
      return res.status(400).json({
        message: "Title, batch, module, assigned mentor, start date, due date, and description are required"
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const due = new Date(dueDate);
    
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
      batch: batch.trim(),
      module: module.trim(),
      assignedMentor: assignedMentor.trim(),
      startDate: start,
      dueDate: due,
      description: description.trim(),
      attachments: attachmentsValue,
      totalMarks: totalMarks ? Number(totalMarks) : 0,
      achievedMarks: achievedMarks ? Number(achievedMarks) : 0,
      status: status || "Pending"
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
    const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });
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
    const task = await Task.findById(req.params.id);

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
      batch,
      module,
      assignedMentor,
      startDate,
      dueDate,
      description,
      attachments,
      totalMarks,
      achievedMarks,
      status
    } = req.body;

    // Validate dates if provided
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      
      if (start >= due) {
        return res.status(400).json({
          message: "Due date must be after start date"
        });
      }
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (batch) updateData.batch = batch.trim();
    if (module) updateData.module = module.trim();
    if (assignedMentor) updateData.assignedMentor = assignedMentor.trim();
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

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

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
    const { batchName } = req.params;
    const tasks = await Task.find({ 
      batch: batchName, 
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
    const { mentorName } = req.params;
    const tasks = await Task.find({ 
      assignedMentor: mentorName, 
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
  updateTaskMarks
};
