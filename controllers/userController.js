const { User } = require("../models/userModel.js");
const { Product } = require("../models/productModel.js");
const mongoose = require("mongoose");

// ✅ Get All Categories
const getAllusers = async (res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
    if (!users) {
      return res.status(400).json({
        success: false,
        message: "No users found. Please add users first.",
      });
    }
    return users;
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the users.",
      error: error.message,
    });
  }
};

const getUser = async (req, res) => {
  try {

    const userId = req.userId;

    const user = await User.findById(userId);

    let users = null

    if (user.role === "Super Admin") {
      users = await User.find({ role: { $ne: "Super Admin" } }); // Exclude admins

    } else if (user.role === "admin") {
      // users = await User.find({ role: { $nin: ["Super Admin", "admin", "Manager"] } });

       // Step 1: Get all product IDs added by the admin
    const adminProducts = await Product.find({ agent: userId }).select("_id");
    const productIds = adminProducts.map(p => p._id);

    if (productIds.length === 0) return []; // No products added by admin

    // Step 2: Aggregate orders that include those products
    const users = await Order.aggregate([
      {
        $unwind: "$orderItems",
      },
      {
        $match: {
          "orderItems.product": { $in: productIds },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $group: {
          _id: "$user", // Group by user ID to avoid duplicates
          user: { $first: "$userDetails" },
        },
      },
      {
        $project: {
          _id: 0,
          user: 1,
        },
      },
    ]);

    return users.map(u => u.user); // Return array of user objects

    }

    //  else {
    //   users = await User.find({ role: { $nin: ["Super Admin", "admin", "Manager"] } });

    // }


    if (!users) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      users: users || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the user.",
      error: error.message,
    });
  }
};


const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate id
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    // Find the category and toggle isActive
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found.",
      });
    }

    user.isActive = !user.isActive; // Toggle isActive
    await user.save(); // Save the updated category

    const users = await getAllusers(res);
    if (!Array.isArray(users)) return;

    res.status(200).json({
      success: true,
      message: `User updated Successfully.`,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the user status.",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.userId; // Assuming extracted from auth middleware

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // Find the user first
    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    const user = {
      name: userData?.name,
      email: userData?.email,
      phone: userData?.phone,
      image: userData?.image,
    };
    res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the user.",
      error: error.message,
    });
  }
};

module.exports = {
  getUser,
  toggleUserStatus,
  getUserById,
};
