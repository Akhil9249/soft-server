// controllers/weeklyScheduleController.js
const WeeklySchedule = require("../../models/schedule/weeklyScheduleModel");

// Create Weekly Schedule
const createWeeklySchedule = async (req, res) => {
  try {
    // const { mentor, schedule } = req.body;
    console.log("createWeeklySchedule");

    // let mentor = "68cda9a22f107d096afc44d3";
    // let schedule = [
    //   {
    //     time: "68d2d91b9b1638f91990ddb5",
    //     sub_details: [
    //       {
    //         days: "MWF",
    //         subject: "node",
    //         batch: ["68d2b4838ccf5349ee3be24b"]
    //       },
    //       {
    //         days: "TTS",
    //         subject: "react",
    //         batch: ["68d2b4838ccf5349ee3be24b"]
    //       }
    //     ]
    //   },
    //   {
    //     time: "68d2d9309b1638f91990ddb7",
    //     sub_details: [
    //       {
    //         days: "MWF",
    //         subject: "node",
    //         batch: ["68d2b4838ccf5349ee3be24b"]
    //       }
    //       ,
    //       {
    //         days: "TTS",
    //         subject: "react",
    //         batch: ["68d2b4838ccf5349ee3be24b"]
    //       }
    //     ]
    //   },
    //   {
    //     time: "68d2e1731efc5fbfff289866",
    //     sub_details: [
    //       {
    //         days: "MWF",
    //         subject: "node",
    //         batch: ["68d2b4838ccf5349ee3be24b"]
    //       },
    //       ,
    //       {
    //         days: "TTS",
    //         subject: "react",
    //         batch: ["68d2b4838ccf5349ee3be24b"]
    //       }
    //     ]
    //   },
    // ]

    console.log('Creating weekly schedule:', { mentor, schedule });

    if (!mentor) {
      return res.status(400).json({ message: "Mentor is required" });
    }

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ message: "Schedule array is required" });
    }

    const newWeeklySchedule = await WeeklySchedule.create({ mentor, schedule });
    console.log('Weekly schedule created successfully:', newWeeklySchedule);
    res.status(201).json({ message: "Weekly schedule created successfully", data: newWeeklySchedule });
  } catch (error) {
    console.error('Error creating weekly schedule:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Weekly Schedules
const getWeeklySchedules = async (req, res) => {
  try {
    console.log('Fetching weekly schedules...');
    const weeklySchedules = await WeeklySchedule.find()
      .populate({
        path: 'mentor',
        select: 'fullName email'
      })
      .populate({
        path: 'schedule.time',
        select: 'timeSlot'
      })
      .populate({
        path: 'schedule.sub_details.batch',
        select: 'batchName branchName'
      });
    console.log('Found weekly schedules:', weeklySchedules.length);
    res.status(200).json({ message: "Weekly schedules retrieved successfully", data: weeklySchedules });
  } catch (error) {
    console.error('Error fetching weekly schedules:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Single Weekly Schedule
const getWeeklyScheduleById = async (req, res) => {
  try {
    const weeklySchedule = await WeeklySchedule.findById(req.params.id)
      .populate({
        path: 'mentor',
        select: 'fullName email'
      })
      .populate({
        path: 'schedule.time',
        select: 'timeSlot'
      })
      .populate({
        path: 'schedule.sub_details.batch',
        select: 'batchName branchName'
      });

    if (!weeklySchedule) return res.status(404).json({ message: "Weekly schedule not found" });
    res.status(200).json({ message: "Weekly schedule retrieved successfully", data: weeklySchedule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Weekly Schedule
const updateWeeklySchedule = async (req, res) => {
  try {
    const { mentor, schedule } = req.body;

    if (!mentor) {
      return res.status(400).json({ message: "Mentor is required" });
    }

    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ message: "Schedule array is required" });
    }

    const updated = await WeeklySchedule.findByIdAndUpdate(req.params.id, { mentor, schedule }, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: 'mentor',
        select: 'fullName email'
      })
      .populate({
        path: 'schedule.time',
        select: 'timeSlot'
      })
      .populate({
        path: 'schedule.sub_details.batch',
        select: 'batchName branchName'
      });

    if (!updated) return res.status(404).json({ message: "Weekly schedule not found" });
    res.status(200).json({ message: "Weekly schedule updated successfully", data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Weekly Schedule
const deleteWeeklySchedule = async (req, res) => {
  try {
    const deleted = await WeeklySchedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Weekly schedule not found" });
    res.status(200).json({ message: "Weekly schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Time to Schedule
const addTimeToSchedule = async (req, res) => {
  try {
    const { timeId, subDetails } = req.body;
    const { id } = req.params; // weekly schedule id

    console.log('Adding time to schedule:', { timeId, subDetails });

    if (!timeId) {
      return res.status(400).json({ message: "Time ID is required" });
    }

    const weeklySchedule = await WeeklySchedule.findById(id);
    if (!weeklySchedule) {
      return res.status(404).json({ message: "Weekly schedule not found" });
    }

    const newTimeDetail = {
      time: timeId,
      sub_details: subDetails || []
    };

    weeklySchedule.schedule.push(newTimeDetail);
    await weeklySchedule.save();

    const updatedSchedule = await WeeklySchedule.findById(id)
      .populate({
        path: 'mentor',
        select: 'fullName email'
      })
      .populate({
        path: 'schedule.time',
        select: 'timeSlot'
      })
      .populate({
        path: 'schedule.sub_details.batch',
        select: 'batchName branchName'
      });

    res.status(200).json({ message: "Time added to schedule successfully", data: updatedSchedule });
  } catch (error) {
    console.error('Error adding time to schedule:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add Sub Details to Time
const addSubDetailsToTime = async (req, res) => {
  try {
    const { timeIndex, days, subject, batchIds } = req.body;
    const { id } = req.params; // weekly schedule id

    console.log('Adding sub details to time:', { timeIndex, days, subject, batchIds });

    if (timeIndex === undefined || !days) {
      return res.status(400).json({ message: "Time index and days are required" });
    }

    const weeklySchedule = await WeeklySchedule.findById(id);
    if (!weeklySchedule) {
      return res.status(404).json({ message: "Weekly schedule not found" });
    }

    if (!weeklySchedule.schedule[timeIndex]) {
      return res.status(404).json({ message: "Time not found at specified index" });
    }

    const newSubDetail = {
      days: days,
      subject: subject || '',
      batch: batchIds || []
    };

    weeklySchedule.schedule[timeIndex].sub_details.push(newSubDetail);
    await weeklySchedule.save();

    const updatedSchedule = await WeeklySchedule.findById(id)
      .populate({
        path: 'mentor',
        select: 'fullName email'
      })
      .populate({
        path: 'schedule.time',
        select: 'timeSlot'
      })
      .populate({
        path: 'schedule.sub_details.batch',
        select: 'batchName branchName'
      });

    res.status(200).json({ message: "Sub details added to time successfully", data: updatedSchedule });
  } catch (error) {
    console.error('Error adding sub details to time:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add Batch to Sub Details
const addBatchToSubDetails = async (req, res) => {
  try {
    const { timeIndex, subDetailIndex, batchId } = req.body;
    const { id } = req.params; // weekly schedule id

    console.log('Adding batch to sub details:', { timeIndex, subDetailIndex, batchId });

    if (timeIndex === undefined || subDetailIndex === undefined || !batchId) {
      return res.status(400).json({ message: "Time index, sub detail index, and batch ID are required" });
    }

    const weeklySchedule = await WeeklySchedule.findById(id);
    if (!weeklySchedule) {
      return res.status(404).json({ message: "Weekly schedule not found" });
    }

    if (!weeklySchedule.schedule[timeIndex] || 
        !weeklySchedule.schedule[timeIndex].sub_details[subDetailIndex]) {
      return res.status(404).json({ message: "Specified schedule path not found" });
    }

    weeklySchedule.schedule[timeIndex].sub_details[subDetailIndex].batch.push(batchId);
    await weeklySchedule.save();

    const updatedSchedule = await WeeklySchedule.findById(id)
      .populate({
        path: 'mentor',
        select: 'fullName email'
      })
      .populate({
        path: 'schedule.time',
        select: 'timeSlot'
      })
      .populate({
        path: 'schedule.sub_details.batch',
        select: 'batchName branchName'
      });

    res.status(200).json({ message: "Batch added to sub details successfully", data: updatedSchedule });
  } catch (error) {
    console.error('Error adding batch to sub details:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove Batch from Sub Details
const removeBatchFromSubDetails = async (req, res) => {
  try {
    const { timeIndex, subDetailIndex, batchId } = req.body;
    const { id } = req.params; // weekly schedule id

    console.log('Removing batch from sub details:', { timeIndex, subDetailIndex, batchId });

    if (timeIndex === undefined || subDetailIndex === undefined || !batchId) {
      return res.status(400).json({ message: "Time index, sub detail index, and batch ID are required" });
    }

    const weeklySchedule = await WeeklySchedule.findById(id);
    if (!weeklySchedule) {
      return res.status(404).json({ message: "Weekly schedule not found" });
    }

    if (!weeklySchedule.schedule[timeIndex] || 
        !weeklySchedule.schedule[timeIndex].sub_details[subDetailIndex]) {
      return res.status(404).json({ message: "Specified schedule path not found" });
    }

    const batchArray = weeklySchedule.schedule[timeIndex].sub_details[subDetailIndex].batch;
    const batchIndex = batchArray.findIndex(batch => batch.toString() === batchId);
    
    if (batchIndex === -1) {
      return res.status(404).json({ message: "Batch not found in sub details" });
    }

    batchArray.splice(batchIndex, 1);
    await weeklySchedule.save();

    const updatedSchedule = await WeeklySchedule.findById(id)
      .populate({
        path: 'mentor',
        select: 'fullName email'
      })
      .populate({
        path: 'schedule.time',
        select: 'timeSlot'
      })
      .populate({
        path: 'schedule.sub_details.batch',
        select: 'batchName branchName'
      });

    res.status(200).json({ message: "Batch removed from sub details successfully", data: updatedSchedule });
  } catch (error) {
    console.error('Error removing batch from sub details:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWeeklySchedule,
  getWeeklySchedules,
  getWeeklyScheduleById,
  updateWeeklySchedule,
  deleteWeeklySchedule,
  addTimeToSchedule,
  addSubDetailsToTime,
  addBatchToSubDetails,
  removeBatchFromSubDetails,
};
