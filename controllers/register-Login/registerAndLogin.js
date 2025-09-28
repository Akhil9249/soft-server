const { User } = require("../../models/userModel.js");
const razorpay = require("../../utils/razorpay.js");
require('dotenv').config()
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require('jsonwebtoken');

const {
  generatePasswordHash,
  comparePasswordHash,
} = require("../../utils/bcrypt.js");
const { generateAccessToken } = require("../../utils/jwt.js");
const internModel = require("../../models/administration/internModel.js");

// ✅ Register - User Signup
const signup = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role
    } = req.body;

    // Validate input
    if (!password || !name || !phone || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }



    const isExist = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (isExist) {
      return res.status(422).json({
        message: "User Already Exists"
      });
    }

    const hashedPassword = await generatePasswordHash(password);

    let  isCreate = await User.create({
        name,
        email,
        phone,
        role,
        password: hashedPassword,
        isActive: true
      });

    

    res.status(201).json({
      success: true,
      message: "Account has been created successfully"
    });
  } catch (error) {
    console.error("Error creating user:", error);
    next(error);
  }
};



// ✅ Login - User Authentication
const login = async (req, res, next) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      const error = {
        status: 400,
        message: "Invalid input data",
        fields: {
          body: req.body,
          required: { email, password },
        },
      };
      return next(error);
    }

    // Check if user exists in the database
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      const error = {
        status: 401,
        message: "User does not exist",
      };
      return next(error);
    }

    // Verify the password
    const validPassword = await comparePasswordHash(password, user.password);
    if (!validPassword) {
      const error = {
        status: 401,
        message: "Invalid password or Username",
      };
      return next(error);
    }

    // Generate an access token for the user
    const accessToken = generateAccessToken(user._id);

    // Prepare user data for response (excluding sensitive info)
    const userData = {
      name: user?.name,
      phone: user?.phone,
      email: user?.email,
      role: user?.role,
    };

    // Respond with success message and token
    res.status(200).json({
      success: true,
      accessToken,
      userData,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    next(error); // Forward error to error-handling middleware
  }
};

const internslogin = async (req, res, next) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      const error = {
        status: 400,
        message: "Invalid input data",
        fields: {
          body: req.body,
          required: { email, password },
        },
      };
      return next(error);
    }

    // Check if user exists in the database
    const intern = await internModel.findOne({ email, isActive: true });

    if (!intern) {
      const error = {
        status: 401,
        message: "Intern does not exist",
      };
      return next(error);
    }

    // Verify the password
    const validPassword = await comparePasswordHash(password, intern.password);
    if (!validPassword) {
      const error = {
        status: 401,
        message: "Invalid password or Username",
      };
      return next(error);
    }

    // Generate an access token for the Intern
    const accessToken = generateAccessToken(intern._id);

    // Prepare intern data for response (excluding password)
    const internData = {
      _id: intern._id,
      fullName: intern.fullName,
      dateOfBirth: intern.dateOfBirth,
      gender: intern.gender,
      email: intern.email,
      internPhoneNumber: intern.internPhoneNumber,
      officialEmail: intern.officialEmail,
      course: intern.course,
      branch: intern.branch,
      courseStartedDate: intern.courseStartedDate,
      isActive: intern.isActive,
      createdAt: intern.createdAt,
      updatedAt: intern.updatedAt
    };

    // Respond with success message and token
    res.status(200).json({
      success: true,
      accessToken,
      internData,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    next(error); // Forward error to error-handling middleware
  }
};


module.exports = {
  login,
  signup,
  internslogin
};
