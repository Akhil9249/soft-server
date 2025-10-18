// models/roleModel.js
const mongoose = require("mongoose");

const privilegeSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["Super Admin", "Admin", "Mentor", "Accountant", "Intern", "Career advisor", "Placement coordinator", "Front office staff"],
    required: true
  },
  description: { 
    type: String, 
    // required: true,
    // trim: true 
  },
  permissions: {
    studentManagement: {
      addStudent: { type: Boolean, default: false },
      viewStudent: { type: Boolean, default: false },
      editStudent: { type: Boolean, default: false },
      deleteStudent: { type: Boolean, default: false }
    },
    mentorManagement: {
      addMentor: { type: Boolean, default: false },
      viewMentor: { type: Boolean, default: false },
      editMentor: { type: Boolean, default: false },
      deleteMentor: { type: Boolean, default: false }
    },
    courseManagement: {
      addCourse: { type: Boolean, default: false },
      viewCourse: { type: Boolean, default: false },
      editCourse: { type: Boolean, default: false },
      deleteCourse: { type: Boolean, default: false }
    },
    categoryManagement: {
      addCategory: { type: Boolean, default: false },
      viewCategory: { type: Boolean, default: false },
      editCategory: { type: Boolean, default: false },
      deleteCategory: { type: Boolean, default: false }
    },
    moduleManagement: {
      addModule: { type: Boolean, default: false },
      viewModule: { type: Boolean, default: false },
      editModule: { type: Boolean, default: false },
      deleteModule: { type: Boolean, default: false }
    },
    topicManagement: {
      addTopic: { type: Boolean, default: false },
      viewTopic: { type: Boolean, default: false },
      editTopic: { type: Boolean, default: false },
      deleteTopic: { type: Boolean, default: false }
    },
    taskManagement: {
      addTask: { type: Boolean, default: false },
      viewTask: { type: Boolean, default: false },
      editTask: { type: Boolean, default: false },
      deleteTask: { type: Boolean, default: false }
    },
    weeklySchedule: {
      addSchedule: { type: Boolean, default: false },
      viewSchedule: { type: Boolean, default: false },
      editSchedule: { type: Boolean, default: false },
      deleteSchedule: { type: Boolean, default: false }
    },
    scheduleTiming: {
      addTiming: { type: Boolean, default: false },
      viewTiming: { type: Boolean, default: false },
      editTiming: { type: Boolean, default: false },
      deleteTiming: { type: Boolean, default: false }
    },
    staticPage: {
      addPage: { type: Boolean, default: false },
      viewPage: { type: Boolean, default: false },
      editPage: { type: Boolean, default: false },
      deletePage: { type: Boolean, default: false }
    }
  },
  isActive: { type: Boolean, default: true },


  // role: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Role",
  //   required: true
  // },

  // privilegeName: { 
  //   type: String, 
  //   required: true, 
  //   trim: true,
  //   unique: true,
  //   enum: ["Student Management", "Mentor Management", "Course Management", "Category Management", "Module Management", "Topic Management", "Task Management", "Weekly Schedule", "Schedule Timing", "Static Page"]
  // },

  // createdBy: { 
  //   type: mongoose.Schema.Types.ObjectId, 
  //   ref: "User",
  //   required: true 
  // },
  // updatedBy: { 
  //   type: mongoose.Schema.Types.ObjectId, 
  //   ref: "User" 
  // }
}, { timestamps: true });

// Pre-save middleware to set updatedBy
privilegeSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.createdBy; // You can modify this logic as needed
  }
  next();
});

  module.exports = mongoose.model("Privilege", privilegeSchema);
