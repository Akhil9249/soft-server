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
    const {data} = req.body;
    const { timeIndex, subDetailIndex, batchId } = data;
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

// Update Subject in Sub Details
const updateSubjectInSubDetails = async (req, res) => {
  try {
    const { timeIndex, subDetailIndex, subject } = req.body;
    const { id } = req.params; // weekly schedule id

    console.log('Updating subject in sub details:', { timeIndex, subDetailIndex, subject });

    if (timeIndex === undefined || subDetailIndex === undefined) {
      return res.status(400).json({ message: "Time index and sub detail index are required" });
    }

    const weeklySchedule = await WeeklySchedule.findById(id);
    if (!weeklySchedule) {
      return res.status(404).json({ message: "Weekly schedule not found" });
    }

    if (!weeklySchedule.schedule[timeIndex] || 
        !weeklySchedule.schedule[timeIndex].sub_details[subDetailIndex]) {
      return res.status(404).json({ message: "Specified schedule path not found" });
    }

    // Update the subject
    weeklySchedule.schedule[timeIndex].sub_details[subDetailIndex].subject = subject || '';

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

    res.status(200).json({ message: "Subject updated successfully", data: updatedSchedule });
  } catch (error) {
    console.error('Error updating subject in sub details:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Mentors with Their Assigned Batches
const getAllMentorsWithBatches = async (req, res) => {
  try {
    console.log('Fetching all mentors with their assigned batches...');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    // Get all weekly schedules with populated data
    const weeklySchedules = await WeeklySchedule.find()
      .populate({
        path: 'mentor',
        select: 'fullName email role',
        populate: {
          path: 'role',
          select: 'role'
        }
      })
      .populate({
        path: 'schedule.time',
        select: 'timeSlot'
      })
      .populate({
        path: 'schedule.sub_details.batch',
        select: 'batchName branch',
        populate: [
          {
            path: 'branch',
            select: 'branchName'
          },
          {
            path: 'interns',
            select: 'course',
            populate: {
              path: 'course',
              select: 'courseName'
            }
          }
        ]
      });

    // Process the data to create a structured list of mentors with their batches
    const mentorsWithBatches = [];
    const mentorMap = new Map();

    weeklySchedules.forEach(schedule => {
      const mentor = schedule.mentor;
      if (!mentor) return;

      const mentorId = mentor._id.toString();
      
      // Initialize mentor if not exists
      if (!mentorMap.has(mentorId)) {
        mentorMap.set(mentorId, {
          _id: mentor._id,
          fullName: mentor.fullName,
          email: mentor.email,
          role: mentor.role?.role || 'mentor',
          batches: new Set(),
          scheduleDetails: []
        });
      }

      const mentorData = mentorMap.get(mentorId);

      // Process schedule details
      schedule.schedule.forEach(timeSlot => {
        const timeSlotData = {
          timeSlot: timeSlot.time?.timeSlot || 'N/A',
          subDetails: []
        };

        timeSlot.sub_details.forEach(subDetail => {
          const subDetailData = {
            days: subDetail.days,
            subject: subDetail.subject || 'N/A',
            batches: []
          };

          subDetail.batch.forEach(batch => {
            if (batch) {
              // Add batch to mentor's batch set
              mentorData.batches.add(batch._id.toString());
              
              // Extract course information from interns
              const courses = new Set();
              if (batch.interns && batch.interns.length > 0) {
                batch.interns.forEach(intern => {
                  if (intern.course && intern.course.courseName) {
                    courses.add(intern.course.courseName);
                  }
                });
              }
              const courseNames = Array.from(courses).join(', ') || 'N/A';

              // Add batch details to sub detail
              subDetailData.batches.push({
                _id: batch._id,
                batchName: batch.batchName,
                branchName: batch.branch?.branchName || 'N/A',
                courseName: courseNames
              });
            }
          });

          timeSlotData.subDetails.push(subDetailData);
        });

        mentorData.scheduleDetails.push(timeSlotData);
      });
    });

    // Convert Map to Array and format batches
    mentorsWithBatches.push(...Array.from(mentorMap.values()).map(mentor => ({
      ...mentor,
      batches: Array.from(mentor.batches).map(batchId => {
        // Find batch details from any schedule
        for (const schedule of weeklySchedules) {
          for (const timeSlot of schedule.schedule) {
            for (const subDetail of timeSlot.sub_details) {
              for (const batch of subDetail.batch) {
                if (batch && batch._id.toString() === batchId) {
                  // Extract course information from interns
                  const courses = new Set();
                  if (batch.interns && batch.interns.length > 0) {
                    batch.interns.forEach(intern => {
                      if (intern.course && intern.course.courseName) {
                        courses.add(intern.course.courseName);
                      }
                    });
                  }
                  const courseNames = Array.from(courses).join(', ') || 'N/A';

                  return {
                    _id: batch._id,
                    batchName: batch.batchName,
                    branchName: batch.branch?.branchName || 'N/A',
                    courseName: courseNames
                  };
                }
              }
            }
          }
        }
        return null;
      }).filter(batch => batch !== null)
    })));

    console.log(`Found ${mentorsWithBatches.length} mentors with assigned batches`);

    // Backend-driven pagination
    const totalCount = mentorsWithBatches.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const skip = (currentPage - 1) * limit;
    const pagedMentors = mentorsWithBatches.slice(skip, skip + limit);

    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;
    const startIndex = totalCount === 0 ? 0 : skip + 1;
    const endIndex = Math.min(skip + limit, totalCount);

    const getPageNumbers = (cp, tp) => {
      const maxVisible = 5;
      let startPage, endPage;
      if (tp <= maxVisible) {
        startPage = 1; endPage = tp;
      } else if (cp <= 3) {
        startPage = 1; endPage = maxVisible;
      } else if (cp >= tp - 2) {
        startPage = tp - maxVisible + 1; endPage = tp;
      } else {
        startPage = cp - 2; endPage = cp + 2;
      }
      return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    res.status(200).json({
      message: "Mentors with assigned batches retrieved successfully",
      data: pagedMentors,
      pagination: {
        currentPage,
        totalPages,
        totalCount,
        limit,
        skip,
        hasNextPage,
        hasPrevPage,
        startIndex,
        endIndex,
        pageNumbers: getPageNumbers(currentPage, totalPages),
        displayInfo: {
          showing: `${startIndex} to ${endIndex}`,
          total: totalCount,
          pageInfo: `Page ${currentPage} of ${totalPages}`
        }
      }
    });
  } catch (error) {
    console.error('Error fetching mentors with batches:', error);
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
  updateSubjectInSubDetails,
  getAllMentorsWithBatches,
};
