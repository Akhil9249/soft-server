// controllers/notificationController.js
const Notification = require("../../models/settings/notificationModel");

// Create Notification
const createNotification = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      type, 
      branch, 
      audience, 
      batches, 
      courses, 
      interns, 
      individualInterns, 
      pushNotification 
    } = req.body;

    if (!title || !content || !type || !audience) {
      return res.status(400).json({ message: "Title, content, type, and audience are required fields" });
    }

    // Validate audience-specific fields
    if (audience === "By batches" && (!batches || batches.length === 0)) {
      return res.status(400).json({ message: "Batches must be selected when audience is 'By batches'" });
    }
    
    if (audience === "By courses" && (!courses || courses.length === 0)) {
      return res.status(400).json({ message: "Courses must be selected when audience is 'By courses'" });
    }
    
    if (audience === "Individual interns" && (!individualInterns || individualInterns.length === 0)) {
      return res.status(400).json({ message: "Individual interns must be selected when audience is 'Individual interns'" });
    }

    const newNotification = await Notification.create({
      title,
      content,
      type,
      branch: branch || null,
      audience,
      batches: batches || [],
      courses: courses || [],
      interns: interns || [],
      individualInterns: individualInterns || [],
      pushNotification: pushNotification || false,
    });

    // Populate the response with referenced data
    const populatedNotification = await Notification.findById(newNotification._id)
      .populate('branch', 'branchName')
      .populate('batches', 'batchName')
      .populate('courses', 'courseName')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email');

    // if pushNotification is true, you can integrate Firebase/OneSignal here
    if (newNotification.pushNotification) {
      console.log("📢 Push notification triggered!");
    }

    res.status(201).json({ 
      message: "Notification created successfully", 
      data: populatedNotification 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Notifications
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    const totalCount = await Notification.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalCount / limit);
    
    // Calculate pagination metadata
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const startIndex = skip + 1;
    const endIndex = Math.min(skip + limit, totalCount);
    
    // Calculate page numbers to display (smart pagination)
    const getPageNumbers = (currentPage, totalPages) => {
      const maxVisible = 5;
      let startPage, endPage;
      
      if (totalPages <= maxVisible) {
        startPage = 1;
        endPage = totalPages;
      } else {
        if (currentPage <= 3) {
          startPage = 1;
          endPage = maxVisible;
        } else if (currentPage >= totalPages - 2) {
          startPage = totalPages - maxVisible + 1;
          endPage = totalPages;
        } else {
          startPage = currentPage - 2;
          endPage = currentPage + 2;
        }
      }
      
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    const notifications = await Notification.find({ isActive: true })
      .populate('branch', 'branchName')
      .populate('batches', 'batchName')
      .populate('courses', 'courseName')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({ 
      message: "Notifications retrieved successfully", 
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        skip,
        hasNextPage,
        hasPrevPage,
        startIndex,
        endIndex,
        pageNumbers: getPageNumbers(page, totalPages),
        displayInfo: {
          showing: `${startIndex} to ${endIndex}`,
          total: totalCount,
          pageInfo: `Page ${page} of ${totalPages}`
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('branch', 'branchName')
      .populate('batches', 'batchName')
      .populate('courses', 'courseName')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email');
    
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification retrieved successfully", data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Notification
const updateNotification = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      type, 
      branch, 
      audience, 
      batches, 
      courses, 
      interns, 
      individualInterns, 
      pushNotification 
    } = req.body;

    // Validate audience-specific fields if audience is being updated
    if (audience === "By batches" && (!batches || batches.length === 0)) {
      return res.status(400).json({ message: "Batches must be selected when audience is 'By batches'" });
    }
    
    if (audience === "By courses" && (!courses || courses.length === 0)) {
      return res.status(400).json({ message: "Courses must be selected when audience is 'By courses'" });
    }
    
    if (audience === "Individual interns" && (!individualInterns || individualInterns.length === 0)) {
      return res.status(400).json({ message: "Individual interns must be selected when audience is 'Individual interns'" });
    }

    const updated = await Notification.findByIdAndUpdate(
      req.params.id, 
      {
        title,
        content,
        type,
        branch: branch || null,
        audience,
        batches: batches || [],
        courses: courses || [],
        interns: interns || [],
        individualInterns: individualInterns || [],
        pushNotification: pushNotification || false,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('branch', 'branchName')
      .populate('batches', 'batchName')
      .populate('courses', 'courseName')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email');

    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Notification (Soft Delete)
const deleteNotification = async (req, res) => {
  try {
    // const deleted = await Notification.findByIdAndUpdate(
    //   req.params.id, 
    //   { isActive: false }, 
    //   { new: true }
    // );
    
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    
    if (!deleted) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
