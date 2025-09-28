// controllers/notificationController.js
const Notification = require("../../models/settings/notificationModel");

// Create Notification
const createNotification = async (req, res) => {
  try {
    const { notificationTitle, notificationContent, type, branch, audience, pushNotification } = req.body;

    if (!notificationTitle || !notificationContent || !type || !branch || !audience) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newNotification = await Notification.create({
      notificationTitle,
      notificationContent,
      type,
      branch,
      audience,
      pushNotification: pushNotification || false,
    });

    // if pushNotification is true, you can integrate Firebase/OneSignal here
    if (newNotification.pushNotification) {
      console.log("📢 Push notification triggered!");
    }

    res.status(201).json({ message: "Notification created successfully", notification: newNotification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Notification
const updateNotification = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification updated", notification: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Notification not found" });
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
