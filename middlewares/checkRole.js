const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");
const { Staff } = require("../models/administration/staffModel");

// Helper function to check if user has required role
const checkUserRole = async (req, res, next, requiredRole) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // if (user.role !== requiredRole) {
    //   return res.status(401).json({
    //     message: "You are UnAuthorized",
    //   });
    // }

  

    next();

  } catch (error) {
    res.status(401).json({
        message: "You are UnAuthorized",
    });
  }
};

// Check for Super Admin role
const checkSuperAdmin = async (req, res, next) => {
  await checkUserRole(req, res, next, "Super Admin");
};

// Check for Admin role
const checkAdmin = async (req, res, next) => {
  await checkUserRole(req, res, next, "Admin");
};

// Check for Mentor role
const checkMentor = async (req, res, next) => {
  await checkUserRole(req, res, next, "Mentor");
};

// Check for Accountant role
const checkAccountant = async (req, res, next) => {
  await checkUserRole(req, res, next, "Accountant");
};

// Check for multiple roles (Super Admin, Admin, Mentor, Accountant)
const checkMultipleRoles = async (req, res, next, allowedRoles) => {
  try {
    console.log("Checking multiple roles for userId:====", req.userId);
    // console.log("Allowed roles:", allowedRoles);
    // const user = await User.findById(req.userId);

    // const user = await Staff.findById(req.userId);
      // const user = await User.findById(req.userId);
      let user = null;
   
      user = await Staff.findById(req.userId);
  
      if (!user) {
        user = await User.findById(req.userId);
      }

    
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    

    if (!allowedRoles.includes(user.role)) {
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
