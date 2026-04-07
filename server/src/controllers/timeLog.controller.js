const TimeLog = require("../models/timeLog.model");
const User = require("../models/users.model");

const startTimer = async (req, res, next) => {
  try {
    const { project, task, description } = req.body;

    const existing = await TimeLog.findOne({
      user: req.user._id,
      endTime: null,
    });

    if (existing) {
      return res.status(400).json({
        message: "Timer already running",
      });
    }
    const log = await TimeLog.create({
      user: req.user._id,
      project,
      task,
      description,
      startTime: new Date(),
    });

    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

const stopTimer = async (req, res, next) => {
  try {
    const log = await TimeLog.findOne({
      user: req.user._id,
      endTime: null,
    });

    if (!log) throw new Error("No active timer");

    log.endTime = new Date();
    await log.save();

    res.json(log);
  } catch (error) {
    next(error);
  }
};

const getActiveTimeLog = async (req, res, next) => {
  try {
    const activeLog = await TimeLog.findOne({
      user: req.user._id,
      endTime: null,
    }).populate("project");

    res.status(200).json(activeLog);
  } catch (error) {
    next(error);
  }
};

const getTimeLogs = async (req, res, next) => {
  try {
    const logs = await TimeLog.find({
      user: req.user._id,
    })
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const logs = await TimeLog.find({
      user: userId,
      endTime: { $ne: null },
    }).populate("project", "name");

    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    let todayTime = 0;
    let weeklyTime = 0;
    let totalTime = 0;
    const projectStats = {};

    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { day: label, duration: 0 };
    }

    const hourlyMap = {};
    for (let h = 0; h < 24; h++) {
      hourlyMap[h] = { hour: `${h}:00`, duration: 0 };
    }

    logs.forEach((log) => {
      const duration = log.duration || 0;
      const startTime = new Date(log.startTime);

      totalTime += duration;

      if (startTime >= todayStart) {
        todayTime += duration;
      }

      if (startTime >= weekStart) {
        weeklyTime += duration;

        const dateKey = startTime.toISOString().split("T")[0];
        if (dailyMap[dateKey] !== undefined) {
          dailyMap[dateKey].duration += duration;
        }

        const hour = startTime.getHours();
        hourlyMap[hour].duration += duration;
      }

      const projectName = log.project?.name || "Unknown";
      if (!projectStats[projectName]) {
        projectStats[projectName] = 0;
      }
      projectStats[projectName] += duration;
    });

    res.json({
      totalTime,
      todayTime,
      weeklyTime,
      projectStats,
      dailyStats: Object.values(dailyMap),
      hourlyStats: Object.values(hourlyMap),
    });
  } catch (error) {
    next(error);
  }
};

const getOrgMembers = async (req, res, next) => {
  try {
    const members = await User.find({
      role: "member",
      isActive: true,
    }).select("name email organization");

    res.json(members);
  } catch (error) {
    next(error);
  }
};

const getMemberStats = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    const member = await User.findOne({
      _id: memberId,
      role: "member",
    }).select("name email");

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const logs = await TimeLog.find({
      user: memberId,
      endTime: { $ne: null },
    }).populate("project", "name");

    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    let todayTime = 0;
    let weeklyTime = 0;
    let totalTime = 0;
    const projectStats = {};

    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { day: label, duration: 0 };
    }

    const hourlyMap = {};
    for (let h = 0; h < 24; h++) {
      hourlyMap[h] = { hour: `${h}:00`, duration: 0 };
    }

    logs.forEach((log) => {
      const duration = log.duration || 0;
      const startTime = new Date(log.startTime);

      totalTime += duration;

      if (startTime >= todayStart) todayTime += duration;

      if (startTime >= weekStart) {
        weeklyTime += duration;

        const dateKey = startTime.toISOString().split("T")[0];
        if (dailyMap[dateKey] !== undefined) {
          dailyMap[dateKey].duration += duration;
        }

        const hour = startTime.getHours();
        hourlyMap[hour].duration += duration;
      }

      const projectName = log.project?.name || "Unknown";
      if (!projectStats[projectName]) projectStats[projectName] = 0;
      projectStats[projectName] += duration;
    });

    res.json({
      member,
      totalTime,
      todayTime,
      weeklyTime,
      projectStats,
      dailyStats: Object.values(dailyMap),
      hourlyStats: Object.values(hourlyMap),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startTimer,
  stopTimer,
  getActiveTimeLog,
  getTimeLogs,
  getDashboardStats,
  getOrgMembers,
  getMemberStats,
};
