// controllers/roleController.js
const Role = require("../../models/administration/roleModel");
const { User } = require("../../models/userModel");

// Create new role (excluding Super Admin)
const createRole = async (req, res) => {
  try {
    const { role, description, permissions } = req.body;
    // console.log(req.body);

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    // Convert role to lowercase for storage
    const roleLower = role.toLowerCase();

    // Block creation of Super Admin roles
    if (roleLower === "super admin") {
      return res.status(403).json({ message: "Access denied: Super Admin roles cannot be created" });
    }

    // Validate role against enum values (excluding Super Admin from frontend)
    // const validRoles = ["admin", "mentor", "accountant", "intern", "career advisor", "placement coordinator", "front office staff"];
    // if (!validRoles.includes(roleLower)) {
    //   return res.status(400).json({ message: "Invalid role. Must be one of: " + validRoles.join(", ") });
    // }

    // Check if role already exists
    const existingRole = await Role.findOne({ role: roleLower });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const newRole = await Role.create({
      role: roleLower,
      description,
      permissions: permissions || {}
    });

    res.status(201).json({ message: "Role created successfully", data: newRole });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all roles (excluding Super Admin)
const getRoles = async (req, res) => {
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
      role: { $ne: "super admin" } // Exclude Super Admin from results
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
    const totalCount = await Role.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated results
    const roles = await Role.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('Found roles:', roles.length);
    
    res.status(200).json({ 
      message: "Roles retrieved successfully", 
      data: roles,
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

// Get single role (excluding Super Admin)
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Block access to Super Admin roles
    if (role.role === "super admin") {
      return res.status(403).json({ message: "Access denied: Super Admin roles cannot be accessed" });
    }
    
    res.status(200).json({ message: "Role retrieved successfully", data: role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update role (excluding Super Admin)
const updateRole = async (req, res) => {
  try {
    const { role, description, permissions, isActive } = req.body;
    
    const existingRole = await Role.findById(req.params.id);
    if (!existingRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Block access to Super Admin roles
    if (existingRole.role === "super admin") {
      return res.status(403).json({ message: "Access denied: Super Admin roles cannot be modified" });
    }

    // Validate role if provided
    if (role) {
      // Convert role to lowercase for validation and storage
      const roleLower = role.toLowerCase();
      
      // const validRoles = ["super admin", "admin", "mentor", "accountant", "intern", "career advisor", "placement coordinator", "front office staff"];
      // if (!validRoles.includes(roleLower)) {
      //   return res.status(400).json({ message: "Invalid role. Must be one of: " + validRoles.join(", ") });
      // }

      // Prevent changing to Super Admin role
      if (roleLower === "super admin") {
        return res.status(403).json({ message: "Access denied: Cannot assign Super Admin role" });
      }

      // Check if role is being changed and if it already exists
      if (roleLower !== existingRole.role) {
        const duplicateRole = await Role.findOne({ role: roleLower, _id: { $ne: req.params.id } });
        if (duplicateRole) {
          return res.status(400).json({ message: "Role already exists" });
        }
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      {
        ...(role && { role: role.toLowerCase() }),
        ...(description && { description }),
        ...(permissions && { permissions }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Role updated successfully", data: updatedRole });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete role (soft delete) - excluding Super Admin
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Block deletion of Super Admin roles
    if (role.role === "super admin") {
      return res.status(403).json({ message: "Access denied: Super Admin roles cannot be deleted" });
    }

    // Soft delete by setting isActive to false
    await Role.findByIdAndUpdate(req.params.id, { 
      isActive: false
    });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get role by role name (excluding Super Admin)
const getRoleByRoleName = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    // Convert roleName to lowercase for comparison
    const roleNameLower = roleName.toLowerCase();
    
    // Block access to Super Admin role
    if (roleNameLower === "super admin") {
      return res.status(403).json({ message: "Access denied: Super Admin roles cannot be accessed" });
    }
    
    const role = await Role.findOne({ role: roleNameLower, isActive: true });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ message: "Role retrieved successfully", data: role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get role permissions (excluding Super Admin)
const getRolePermissions = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    // Convert roleName to lowercase for comparison
    const roleNameLower = roleName.toLowerCase();
    
    // Block access to Super Admin permissions
    if (roleNameLower === "super admin") {
      return res.status(403).json({ message: "Access denied: Super Admin permissions cannot be accessed" });
    }
    
    const role = await Role.findOne({ role: roleNameLower, isActive: true });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ message: "Permissions retrieved successfully", data: { permissions: role.permissions } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRoleByRoleName,
  getRolePermissions,
};
