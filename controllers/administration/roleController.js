// controllers/roleController.js
const Role = require("../../models/administration/roleModel");
const { User } = require("../../models/userModel");

// Create new role
const createRole = async (req, res) => {
  try {
    const { roleName, description, permissions } = req.body;

    if (!roleName || !description) {
      return res.status(400).json({ message: "Role name and description are required" });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ roleName });
    if (existingRole) {
      return res.status(400).json({ message: "Role with this name already exists" });
    }

    const newRole = await Role.create({
      roleName,
      description,
      permissions: permissions || {},
      createdBy: req.user?.id || "system" // Assuming you have user info in req.user
    });

    res.status(201).json({ message: "Role created successfully", role: newRole });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });
    
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single role
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");
    
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const { roleName, description, permissions, isActive } = req.body;
    
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if role name is being changed and if it already exists
    if (roleName && roleName !== role.roleName) {
      const existingRole = await Role.findOne({ roleName, _id: { $ne: req.params.id } });
      if (existingRole) {
        return res.status(400).json({ message: "Role with this name already exists" });
      }
    }

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      {
        ...(roleName && { roleName }),
        ...(description && { description }),
        ...(permissions && { permissions }),
        ...(isActive !== undefined && { isActive }),
        updatedBy: req.user?.id || "system"
      },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email").populate("updatedBy", "name email");

    res.status(200).json({ message: "Role updated successfully", role: updatedRole });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete role (soft delete)
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if role is being used by any users
    const usersWithRole = await User.find({ role: role.roleName });
    if (usersWithRole.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role. It is currently assigned to ${usersWithRole.length} user(s).` 
      });
    }

    // Soft delete by setting isActive to false
    await Role.findByIdAndUpdate(req.params.id, { 
      isActive: false,
      updatedBy: req.user?.id || "system"
    });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    const users = await User.find({ role: roleName })
      .select("name email role lastLogin createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign role to user
const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({ message: "User ID and role name are required" });
    }

    // Check if role exists
    const role = await Role.findOne({ roleName, isActive: true });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update user's role
    const user = await User.findByIdAndUpdate(
      userId,
      { role: roleName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Role assigned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get role permissions
const getRolePermissions = async (req, res) => {
  try {
    const { roleName } = req.params;
    
    const role = await Role.findOne({ roleName, isActive: true });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ permissions: role.permissions });
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
  getUsersByRole,
  assignRoleToUser,
  getRolePermissions,
};
