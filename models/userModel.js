const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    mobile: {
      type: String,
    },
    description: {
      type: String,
      // required: [true, "Mobile number is required"],
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },
    password: {
      type: String,
      // required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    // googleId: {
    //   type: String,
    //   unique: true,
    //   sparse: true, // Allows multiple users without a googleId
    // },
    loginMethod: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["Super Admin", "Admin", "Teacher", "Accountant", "Student"],
      // default: "user",
    }
  },
  { timestamps: true }
);


module.exports = {
  User: mongoose.model("User", userSchema),
};

