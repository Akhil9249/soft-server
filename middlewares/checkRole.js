const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");
const { Staff } = require("../models/administration/staffModel");
const Role = require("../models/administration/roleModel");

// Helper function to get user role name
const getUserRoleName = async (userId) => {
  try {
    // Check if user is in Staff collection
    let user = await Staff.findById(userId).populate('role', 'role');
    // console.log("user=========", user.role.role);
    if (user && user.role) {
      return user.role.role;
    }
    
    // Check if user is in User collection (for super admin/admin) - now with role reference
    user = await User.findById(userId).populate('role', 'role');
    console.log("user=========", user?.role?.role);
  
    if (user && user.role) {
      return user.role.role;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// Helper function to check if user has required role
const checkUserRole = async (req, res, next, requiredRole) => {
  try {
    const userRole = await getUserRoleName(req.userId);
    
    if (!userRole) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Check if user has the required role (case-insensitive comparison)
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedRequiredRole = requiredRole.toLowerCase();
    
    if (normalizedUserRole !== normalizedRequiredRole) {
      return res.status(401).json({
        message: "You are UnAuthorized",
      });
    }

    next();

  } catch (error) {
    res.status(401).json({
        message: "You are UnAuthorized",
    });
  }
};

// Check for Super Admin role
const checkSuperAdmin = async (req, res, next) => {
  await checkUserRole(req, res, next, "super admin");
};

// Check for Admin role
const checkAdmin = async (req, res, next) => {
  await checkUserRole(req, res, next, "admin");
};

// Check for Mentor role
const checkMentor = async (req, res, next) => {
  await checkUserRole(req, res, next, "mentor");
};

// Check for Accountant role
const checkAccountant = async (req, res, next) => {
  await checkUserRole(req, res, next, "accountant");
};

// Check for multiple roles (Super Admin, Admin, Mentor, Accountant)
const checkMultipleRoles = async (req, res, next, allowedRoles) => {
  try {
    console.log("Checking multiple roles for userId:====", req.userId);
    
    const userRole = await getUserRoleName(req.userId);

    console.log("userRole", userRole);
    console.log("allowedRoles", allowedRoles);
    
    if (!userRole) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    
    // Normalize roles for comparison (case-insensitive)
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(401).json({
        message: "You are UnAuthorized",
      });
    }

    next();

  } catch (error) {
    res.status(401).json({
        message: "You are UnAuthorized",
    });
  }
};

module.exports = {
    checkSuperAdmin,
    checkAdmin,
    checkMentor,
    checkAccountant,
    checkMultipleRoles
};
