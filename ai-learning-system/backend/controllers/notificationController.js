const Notification = require("../models/Notification");
const asyncHandler = require("express-async-handler");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// @desc    Mark notifications as read
// @route   PUT /api/notifications/mark-read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (id) {
    // Mark specific notification as read
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { unread: false },
      { new: true }
    );
    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }
  } else {
    // Mark all as read
    await Notification.updateMany({ user: req.user._id, unread: true }, { unread: false });
  }

  res.json({ message: "Notifications marked as read" });
});

// @desc    Create a demo notification (for testing)
// @route   POST /api/notifications/demo
// @access  Private
const createDemoNotification = asyncHandler(async (req, res) => {
  const { title, desc } = req.body;
  
  const notification = await Notification.create({
    user: req.user._id,
    title: title || "Demo Notification",
    desc: desc || "This is a test notification generated from backend.",
    unread: true
  });

  res.status(201).json(notification);
});

module.exports = {
  getNotifications,
  markAsRead,
  createDemoNotification
};
