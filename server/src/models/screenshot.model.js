const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    capturedAt: {
      type: Date,
      default: Date.now,
    },

    fileSize: {
      type: Number, // in bytes
      default: 0,
    },
  },
  { timestamps: true },
);

screenshotSchema.index({ user: 1, capturedAt: -1 });

const Screenshot = mongoose.model("Screenshot", screenshotSchema);

module.exports = Screenshot;
