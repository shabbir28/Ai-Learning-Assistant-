const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    unread: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: "system",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
