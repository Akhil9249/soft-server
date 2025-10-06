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
const { Mentor } = require("../../models/administration/mentorModel.js");

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



// ✅ Combined Login - Universal Authentication for all user types
const login = async (req, res, next) => {
  try {
    // Extract email, password, and userType from request body
    const { email, password, userType = 'user' } = req.body;

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

    let user = null;
    let userData = null;
    let userTypeName = '';

    // Determine which model to query based on userType
    switch (userType.toLowerCase()) {
      case 'intern':
        user = await internModel.findOne({ email, isActive: true });
        userTypeName = 'Intern';
        if (user) {
          userData = {
            fullName: user?.fullName,
            role: user?.role,
            gender: user?.gender,
            email: user?.email,
            internPhoneNumber: user?.internPhoneNumber,
            officialEmail: user?.officialEmail,
            isActive: user?.isActive,
          };
        }
        break;
      
      case 'mentor':
        user = await Mentor.findOne({ email, isActive: true });
        userTypeName = 'Mentor';
        if (user) {
          userData = {
            fullName: user?.fullName,
            role: user?.role,
            gender: user?.gender,
            email: user?.email,
            mentorPhoneNumber: user?.mentorPhoneNumber,
            officialEmail: user?.officialEmail,
            isActive: user?.isActive,
          };
        }
        break;
      
      case 'user':
      default:
        user = await User.findOne({ email, isActive: true });
        userTypeName = 'User';
        if (user) {
          userData = {
            name: user?.name,
            phone: user?.phone,
            email: user?.email,
            role: user?.role,
          };
        }
        break;
    }

    if (!user) {
      const error = {
        status: 401,
        message: `${userTypeName} does not exist`,
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

    // Respond with success message and token
    res.status(200).json({
      success: true,
      accessToken,
      userData,
      userType: userType.toLowerCase(),
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    next(error); // Forward error to error-handling middleware
  }
};

module.exports = {
  login,
  signup
};
