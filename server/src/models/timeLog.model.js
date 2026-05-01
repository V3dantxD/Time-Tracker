const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number, // in seconds
      default: 0,
    },

    isManual: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      trim: true,
    },

    // Productivity tracking
    activeSeconds: {
      type: Number, // seconds where mouse/keyboard was used
      default: 0,
    },

    unwantedUrlHits: {
      type: Number, // number of distraction events (window blur >30s etc.)
      default: 0,
    },

    productivityScore: {
      type: Number, // 0–100 calculated on stop
      default: null,
    },
  },
  { timestamps: true },
);

timeLogSchema.index({ user: 1, startTime: -1 });

timeLogSchema.pre("save", function () {
  if (this.startTime && this.endTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
});

const TimeLog = mongoose.model("TimeLog", timeLogSchema);

module.exports = TimeLog;
