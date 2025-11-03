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

    // Validate required fields (attachments is now optional if file is uploaded)
    if (!title || !mentor || !audience) {
      return res.status(400).json({
        message: "Title, mentor, and audience are required"
      });
    }

    // Handle uploaded file
    let attachmentsValue = attachments || null;
    if (req.file) {
      attachmentsValue = req.file.path; // Cloudinary URL
    } else if (attachments && typeof attachments === 'string' && attachments.trim() !== '') {
      // Existing URL passed from frontend
      attachmentsValue = attachments.trim();
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

    const newMaterial = await Material.create({
      title: title.trim(),
      mentor: mentor,
      attachments: attachmentsValue,
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

    // Get current material to preserve existing attachment if no new file is uploaded
    const currentMaterial = await Material.findById(id);
    if (!currentMaterial) {
      return res.status(404).json({
        message: "Material not found"
      });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (mentor) updateData.mentor = mentor;
    
    // Handle uploaded file - remove attachments from updateData first to handle it separately
    delete updateData.attachments;
    
    let attachmentsValue = currentMaterial.attachments || undefined;
    if (req.file) {
      // New file uploaded
      console.log('New attachment uploaded:', req.file.originalname, req.file.mimetype, req.file.path);
      attachmentsValue = req.file.path; // Cloudinary URL
      updateData.attachments = attachmentsValue;
    } else if (attachments && typeof attachments === 'string' && attachments.trim() !== '') {
      // Existing URL passed from frontend
      console.log('Preserving existing attachment URL:', attachments);
      attachmentsValue = attachments.trim();
      updateData.attachments = attachmentsValue;
    }
    // If neither req.file nor attachments string is provided, attachmentsValue stays as existing value
    // and we don't add it to updateData, so the existing value is preserved
    
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

// Download attachment file (proxy through backend to avoid CORS issues)
const downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("id*******************", id);

    // Get material to retrieve attachment URL
    const material = await Material.findById(id);
    if (!material || !material.attachments) {
      return res.status(404).json({ message: "Material or attachment not found" });
    }

    const attachmentUrl = material.attachments;
    
    // Use axios to fetch file from Cloudinary
    const axios = require('axios');
    
    try {
      // Fetch file as stream from Cloudinary
      const response = await axios.get(attachmentUrl, {
        responseType: 'stream',
        timeout: 30000, // 30 second timeout
        maxRedirects: 5
      });
      
      // Extract filename from URL or use material title
      const urlParts = attachmentUrl.split('/');
      let filename = urlParts[urlParts.length - 1] || 'attachment';
      
      // Clean up filename (remove query parameters if any)
      if (filename.includes('?')) {
        filename = filename.split('?')[0];
      }
      
      // Use material title as base if available
      if (material.title && filename === 'attachment') {
        const extension = attachmentUrl.includes('.pdf') ? '.pdf' : 
                         attachmentUrl.match(/\.(jpg|jpeg|png)$/i) ? attachmentUrl.match(/\.(jpg|jpeg|png)$/i)[0] : '';
        filename = `${material.title.replace(/[^a-z0-9]/gi, '_')}${extension}`;
      }
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
      res.setHeader('Content-Length', response.headers['content-length'] || '');
      
      // Pipe the file stream to response
      response.data.pipe(res);
      
    } catch (fetchError) {
      console.error('Error fetching file from Cloudinary:', fetchError.message);
      
      // If axios fails, try native http/https as fallback
      const https = require('https');
      const http = require('http');
      const parsedUrl = new URL(attachmentUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      protocol.get(attachmentUrl, (response) => {
        if (response.statusCode !== 200) {
          return res.status(response.statusCode).json({ 
            message: `Failed to fetch file from Cloudinary. Status: ${response.statusCode}` 
          });
        }
        
        // Set headers for file download
        const urlParts = attachmentUrl.split('/');
        const filename = urlParts[urlParts.length - 1] || 'attachment';
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        
        // Pipe the file stream to response
        response.pipe(res);
      }).on('error', (error) => {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file from Cloudinary' });
      });
    }
    
  } catch (error) {
    console.error('Error in downloadAttachment:', error);
    res.status(500).json({ message: error.message || 'Error downloading attachment' });
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
  getMaterialsByAudience,
  downloadAttachment
};
