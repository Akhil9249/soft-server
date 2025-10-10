// models/attendance/internsAttendanceModel.js
const mongoose = require("mongoose");

const internsAttendanceSchema = new mongoose.Schema({
  intern: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Intern", 
    required: true 
  },
  date: { 
    type: String, 
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,  // Ensures YYYY-MM-DD format
    set: function(value) {
      // Ensure date is always stored as YYYY-MM-DD string
      if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return value;
    }
  },
  status: { 
    type: Boolean,
    default: false,
    required: true,
    // true = Present, false = Absent
  },
  checkInTime: { 
    type: Date, 
    required: false 
  },
  checkOutTime: { 
    type: Date, 
    required: false 
  },
  totalHours: { 
    type: Number, 
    required: false 
  },
  remarks: { 
    type: String, 
    required: false 
  },
  markedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Staff", 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Create compound index for intern and date to prevent duplicates
internsAttendanceSchema.index({ intern: 1, date: 1 }, { unique: true });

// Virtual field for human-readable status
internsAttendanceSchema.virtual('statusText').get(function() {
  return this.status ? 'Present' : 'Absent';
});

// Ensure virtual fields are serialized
internsAttendanceSchema.set('toJSON', { virtuals: true });
internsAttendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("InternsAttendance", internsAttendanceSchema);
