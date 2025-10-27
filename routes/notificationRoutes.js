const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification
} = require('../controllers/settings/notificationController');
const { checkAuth } = require('../middlewares/checkAuth');
const { checkMultipleRoles } = require('../middlewares/checkRole');

// Create middleware wrapper for checkMultipleRoles
const checkRoles = (roles) => {
    return (req, res, next) => {
      checkMultipleRoles(req, res, next, roles);
    };
  };

  // Async wrapper to handle promises
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Create notification
router.post("/", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(createNotification));

// Get all notifications
router.get("/", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(getNotifications));

// Get notification by ID
router.get("/:id", checkAuth, checkRoles(["super admin", "admin", "mentor"]), asyncHandler(getNotificationById));

// Update notification
router.put("/:id", checkAuth, checkRoles(["super admin", "admin","mentor"]), asyncHandler(updateNotification));

// Delete notification (soft delete)
router.delete("/:id", checkAuth, checkRoles(["super admin", "admin","mentor"]), asyncHandler(deleteNotification));

module.exports = router;