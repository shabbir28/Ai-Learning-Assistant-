const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getNotifications, markAsRead, createDemoNotification } = require("../controllers/notificationController");

router.route("/")
  .get(protect, getNotifications);

router.route("/mark-read")
  .put(protect, markAsRead);
  
router.route("/demo")
  .post(protect, createDemoNotification);

module.exports = router;
