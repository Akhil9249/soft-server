const Material = require("../../models/task-management/material");

// Create new material
const createMaterial = async (req, res) => {
  try {
    const {
      title,
      mentor,
      attachments,
      audience,
      batches,
      courses,
      interns,
      individualInterns
    } = req.body;

    console.log("Creating material:", {
      title,
      mentor,
      attachments,
      audience,
      batches,
      courses,
      interns,
      individualInterns
    });

    // Validate required fields
    if (!title || !mentor || !attachments || !audience) {
      return res.status(400).json({
        message: "Title, mentor, attachments, and audience are required"
      });
    }
console.log(audience);
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

    const newMaterial = await Material.create({
      title: title.trim(),
      mentor: mentor,
      attachments: attachments,
      audience: audience,
      batches: batches || [],
      courses: courses || [],
      interns: interns || [],
      individualInterns: individualInterns || []
    });

    res.status(201).json({
      message: "Material created successfully",
      data: newMaterial
    });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all materials
const getMaterials = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Search parameters
    const search = req.query.search || '';
    const audience = req.query.audience || '';
    const mentor = req.query.mentor || '';

    // Build query object
    let query = { isActive: true };

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { attachments: { $regex: searchRegex } }
      ];
    }

    // Add filters
    if (audience) {
      query.audience = audience;
    }
    if (mentor) {
      query.mentor = mentor;
    }

    // Get total count for pagination
    const totalCount = await Material.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated results
    const materials = await Material.find(query)
      .populate('mentor', 'fullName email')
      .populate('batches', 'batchName description')
      .populate('courses', 'courseName description')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log('Found materials:', materials.length);
    res.status(200).json({
      message: "Materials retrieved successfully",
      data: materials,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single material by ID
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findById(id)
      .populate('mentor', 'fullName email')
      .populate('batches', 'batchName description')
      .populate('courses', 'courseName description')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email');

    if (!material) {
      return res.status(404).json({
        message: "Material not found"
      });
    }

    res.status(200).json({
      message: "Material retrieved successfully",
      data: material
    });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update material
const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      mentor,
      attachments,
      audience,
      batches,
      courses,
      interns,
      individualInterns
    } = req.body;

    // Validate audience if provided
    if (audience && !["All interns", "By batches", "By courses", "Individual interns"].includes(audience)) {
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

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (mentor) updateData.mentor = mentor;
    if (attachments !== undefined) updateData.attachments = attachments;
    if (audience) updateData.audience = audience;
    if (batches !== undefined) updateData.batches = batches;
    if (courses !== undefined) updateData.courses = courses;
    if (interns !== undefined) updateData.interns = interns;
    if (individualInterns !== undefined) updateData.individualInterns = individualInterns;

    const updatedMaterial = await Material.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('mentor', 'fullName email')
      .populate('batches', 'batchName description')
      .populate('courses', 'courseName description')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email');

    if (!updatedMaterial) {
      return res.status(404).json({
        message: "Material not found"
      });
    }

    res.status(200).json({
      message: "Material updated successfully",
      data: updatedMaterial
    });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete material (soft delete)
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await Material.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({
        message: "Material not found"
      });
    }

    res.status(200).json({
      message: "Material deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get materials by mentor
const getMaterialsByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const materials = await Material.find({ 
      mentor: mentorId, 
      isActive: true 
    })
      .populate('mentor', 'fullName email')
      .populate('batches', 'batchName description')
      .populate('courses', 'courseName description')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Materials retrieved successfully",
      data: materials
    });
  } catch (error) {
    console.error('Error fetching materials by mentor:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get materials by batch
const getMaterialsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const materials = await Material.find({ 
      $or: [
        { audience: "All interns" },
        { audience: "By batches", batches: batchId }
      ],
      isActive: true 
    })
      .populate('mentor', 'fullName email')
      .populate('batches', 'batchName description')
      .populate('courses', 'courseName description')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Materials retrieved successfully",
      data: materials
    });
  } catch (error) {
    console.error('Error fetching materials by batch:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get materials by course
const getMaterialsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const materials = await Material.find({ 
      $or: [
        { audience: "All interns" },
        { audience: "By courses", courses: courseId }
      ],
      isActive: true 
    })
      .populate('mentor', 'fullName email')
      .populate('batches', 'batchName description')
      .populate('courses', 'courseName description')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Materials retrieved successfully",
      data: materials
    });
  } catch (error) {
    console.error('Error fetching materials by course:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get materials by audience
const getMaterialsByAudience = async (req, res) => {
  try {
    const { audience } = req.params;
    const materials = await Material.find({ 
      audience: audience, 
      isActive: true 
    })
      .populate('mentor', 'fullName email')
      .populate('batches', 'batchName description')
      .populate('courses', 'courseName description')
      .populate('interns', 'fullName email')
      .populate('individualInterns', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Materials retrieved successfully",
      data: materials
    });
  } catch (error) {
    console.error('Error fetching materials by audience:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  getMaterialsByMentor,
  getMaterialsByBatch,
  getMaterialsByCourse,
  getMaterialsByAudience
};
