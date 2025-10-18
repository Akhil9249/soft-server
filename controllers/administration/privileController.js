// controllers/privilegeController.js
const Privilege = require("../../models/administration/privilegeModel");
const { User } = require("../../models/userModel");

// Create new privilege (excluding Super Admin)
const createPrivilege = async (req, res) => {
  try {
    const { role, description, permissions } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    // Block creation of Super Admin privileges
    if (role === "Super Admin") {
      return res.status(403).json({ message: "Access denied: Super Admin privileges cannot be created" });
    }

    // Validate role against enum values (excluding Super Admin from frontend)
    const validRoles = ["Admin", "Mentor", "Accountant", "Intern", "Career advisor", "Placement coordinator", "Front office staff"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be one of: " + validRoles.join(", ") });
    }

    // Check if privilege already exists for this role
    const existingPrivilege = await Privilege.findOne({ role });
    if (existingPrivilege) {
      return res.status(400).json({ message: "Privilege for this role already exists" });
    }

    const newPrivilege = await Privilege.create({
      role,
      description,
      permissions: permissions || {}
    });

    res.status(201).json({ message: "Privilege created successfully", data: newPrivilege });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all privileges (excluding Super Admin)
const getPrivileges = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Search parameters
    const search = req.query.search || '';
    const role = req.query.role || '';

    // Build query object
    let query = {
      isActive: true,
      role: { $ne: "Super Admin" } // Exclude Super Admin from results
    };

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { role: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ];
    }

    // Add role filter
    if (role) {
      query.role = role;
    }

    // Get total count for pagination
    const totalCount = await Privilege.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated results
    const privileges = await Privilege.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({ 
      message: "Privileges retrieved successfully", 
      data: privileges,
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
    res.status(500).json({ message: error.message });
  }
};

// Get single privilege (excluding Super Admin)
const getPrivilegeById = async (req, res) => {
  try {
    const privilege = await Privilege.findById(req.params.id);
    
    if (!privilege) {
      return res.status(404).json({ message: "Privilege not found" });
    }

    // Block access to Super Admin privileges
    if (privilege.role === "Super Admin") {
      return res.status(403).json({ message: "Access denied: Super Admin privileges cannot be accessed" });
    }
    
    res.status(200).json({ message: "Privilege retrieved successfully", data: privilege });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update privilege (excluding Super Admin)
const updatePrivilege = async (req, res) => {
  try {
    const { role, description, permissions, isActive } = req.body;
    
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      return res.status(404).json({ message: "Privilege not found" });
    }

    // Block access to Super Admin privileges
    if (privilege.role === "Super Admin") {
      return res.status(403).json({ message: "Access denied: Super Admin privileges cannot be modified" });
    }

    // Validate role if provided
    if (role) {
      const validRoles = ["Super Admin", "Admin", "Mentor", "Accountant", "Intern", "Career advisor", "Placement coordinator", "Front office staff"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be one of: " + validRoles.join(", ") });
      }

      // Prevent changing to Super Admin role
      if (role === "Super Admin") {
        return res.status(403).json({ message: "Access denied: Cannot assign Super Admin role" });
      }

      // Check if role is being changed and if it already exists
      if (role !== privilege.role) {
        const existingPrivilege = await Privilege.findOne({ role, _id: { $ne: req.params.id } });
        if (existingPrivilege) {
          return res.status(400).json({ message: "Privilege for this role already exists" });
        }
      }
    }

    const updatedPrivilege = await Privilege.findByIdAndUpdate(
      req.params.id,
      {
        ...(role && { role }),
        ...(description && { description }),
        ...(permissions && { permissions }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Privilege updated successfully", data: updatedPrivilege });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete privilege (soft delete) - excluding Super Admin
const deletePrivilege = async (req, res) => {
  try {
    const privilege = await Privilege.findById(req.params.id);
    if (!privilege) {
      return res.status(404).json({ message: "Privilege not found" });
    }

    // Block deletion of Super Admin privileges
    if (privilege.role === "Super Admin") {
      return res.status(403).json({ message: "Access denied: Super Admin privileges cannot be deleted" });
    }

    // Soft delete by setting isActive to false
    await Privilege.findByIdAndUpdate(req.params.id, { 
      isActive: false
    });

    res.status(200).json({ message: "Privilege deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get privilege by role (excluding Super Admin)
const getPrivilegeByRole = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    // Block access to Super Admin role
    if (roleName === "Super Admin") {
      return res.status(403).json({ message: "Access denied: Super Admin privileges cannot be accessed" });
    }
    
    const privilege = await Privilege.findOne({ role: roleName, isActive: true });

    if (!privilege) {
      return res.status(404).json({ message: "Privilege not found for this role" });
    }

    res.status(200).json({ message: "Privilege retrieved successfully", data: privilege });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get privilege permissions (excluding Super Admin)
const getPrivilegePermissions = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    // Block access to Super Admin permissions
    if (roleName === "Super Admin") {
      return res.status(403).json({ message: "Access denied: Super Admin permissions cannot be accessed" });
    }
    
    const privilege = await Privilege.findOne({ role: roleName, isActive: true });
    if (!privilege) {
      return res.status(404).json({ message: "Privilege not found" });
    }

    res.status(200).json({ message: "Permissions retrieved successfully", data: { permissions: privilege.permissions } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPrivilege,
  getPrivileges,
  getPrivilegeById,
  updatePrivilege,
  deletePrivilege,
  getPrivilegeByRole,
  getPrivilegePermissions,
};
