// cron/attendanceCron.js
const cron = require('node-cron');
const { createDailyAttendanceRecords } = require('../services/attendanceCronService');

// Schedule to run every day at 6:00 AM
const attendanceCronJob = cron.schedule('0 6 * * *', async () => {
  console.log('Running daily attendance creation cron job...');
  try {
    await createDailyAttendanceRecords();
    console.log('Daily attendance creation cron job completed successfully');
  } catch (error) {
    console.error('Error in daily attendance creation cron job:', error);
  }
}, {
  scheduled: false, // Don't start automatically
  timezone: "Asia/Kolkata" // Adjust timezone as needed
});

// Function to start the cron job
const startAttendanceCron = () => {
  console.log('Starting attendance cron job...');
  attendanceCronJob.start();
  console.log('Attendance cron job started - will run daily at 6:00 AM');
};

// Function to stop the cron job
const stopAttendanceCron = () => {
  console.log('Stopping attendance cron job...');
  attendanceCronJob.stop();
  console.log('Attendance cron job stopped');
};

// Function to run attendance creation manually (for testing)
const runAttendanceCreationManually = async () => {
  console.log('Running attendance creation manually...');
  try {
    await createDailyAttendanceRecords();
    console.log('Manual attendance creation completed successfully');
  } catch (error) {
    console.error('Error in manual attendance creation:', error);
  }
};

module.exports = {
  startAttendanceCron,
  stopAttendanceCron,
  runAttendanceCreationManually,
  attendanceCronJob
};
