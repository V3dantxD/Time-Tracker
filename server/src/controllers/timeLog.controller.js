const TimeLog = require("../models/timeLog.model");
const User = require("../models/users.model");
const { sendLowProductivityAlert } = require("../utils/mailer");

// ─── helpers ────────────────────────────────────────────────────────────────
const WORKDAY_SECONDS = 8 * 3600; // 28 800 s
const LOW_PRODUCTIVITY_THRESHOLD = 0.30; // 30 %

/**
 * Calculate a 0-100 productivity score for a session.
 *  score = clamp( (activeSeconds / sessionDuration) * 100 - (hits * 5), 0, 100 )
 */
const calcScore = (activeSeconds, sessionDuration, unwantedUrlHits) => {
  if (!sessionDuration || sessionDuration <= 0) return 0;
  const raw =
    (activeSeconds / sessionDuration) * 100 - (unwantedUrlHits || 0) * 5;
  return Math.max(0, Math.min(100, Math.round(raw)));
};

// ─── controllers ────────────────────────────────────────────────────────────

const startTimer = async (req, res, next) => {
  try {
    const { project, task, description } = req.body;

    const existing = await TimeLog.findOne({
      user: req.user._id,
      endTime: null,
    });

    if (existing) {
      return res.status(400).json({ message: "Timer already running" });
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

// ── NEW: client pings this every 30 s with live activity data ───────────────
const pingActivity = async (req, res, next) => {
  try {
    const { activeSeconds, unwantedUrlHits } = req.body;

    const log = await TimeLog.findOne({
      user: req.user._id,
      endTime: null,
    });

    if (!log) return res.status(404).json({ message: "No active timer" });

    // Only accept increments (never go backwards)
    if (typeof activeSeconds === "number" && activeSeconds > (log.activeSeconds || 0)) {
      log.activeSeconds = activeSeconds;
    }
    if (typeof unwantedUrlHits === "number" && unwantedUrlHits > (log.unwantedUrlHits || 0)) {
      log.unwantedUrlHits = unwantedUrlHits;
    }

    await log.save();
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

const stopTimer = async (req, res, next) => {
  try {
    const { activeSeconds, unwantedUrlHits } = req.body || {};

    const log = await TimeLog.findOne({
      user: req.user._id,
      endTime: null,
    });

    if (!log) throw new Error("No active timer");

    log.endTime = new Date();

    // Accept final activity snapshot from client (take the higher of the two)
    if (typeof activeSeconds === "number") {
      log.activeSeconds = Math.max(log.activeSeconds || 0, activeSeconds);
    }
    if (typeof unwantedUrlHits === "number") {
      log.unwantedUrlHits = Math.max(log.unwantedUrlHits || 0, unwantedUrlHits);
    }

    // duration is set by the pre-save hook
    await log.save();

    const sessionDuration = log.duration || 0;
    log.productivityScore = calcScore(
      log.activeSeconds,
      sessionDuration,
      log.unwantedUrlHits,
    );
    await log.save();

    // ── Admin alert: check if today's total productive seconds < 30 % of 8 h ──
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayLogs = await TimeLog.find({
        user: req.user._id,
        endTime: { $ne: null },
        startTime: { $gte: todayStart },
      });

      const todayActiveSeconds = todayLogs.reduce(
        (sum, l) => sum + (l.activeSeconds || 0),
        0,
      );

      const productivityRatio = todayActiveSeconds / WORKDAY_SECONDS;

      if (productivityRatio < LOW_PRODUCTIVITY_THRESHOLD) {
        // Find admin(s) to notify
        const admin = await User.findOne({ role: "admin" }).select("email name");
        if (admin) {
          const member = req.user;
          const pct = Math.round(productivityRatio * 100);
          await sendLowProductivityAlert(
            admin.email,
            member.name,
            member.email,
            pct,
          ).catch((err) =>
            console.error("Low-productivity alert email failed:", err.message),
          );
        }
      }
    } catch (alertErr) {
      // Alert errors must never break the stop response
      console.error("Alert check failed:", alertErr.message);
    }

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
    const logs = await TimeLog.find({ user: req.user._id })
      .populate("project", "name")
      .populate("task", "title")
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
    })
      .populate("project", "name")
      .populate("task", "title");

    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    let todayTime = 0;
    let weeklyTime = 0;
    let totalTime = 0;
    let todayActiveSeconds = 0;
    let todayUnwantedHits = 0;
    const projectStats = {};
    const taskStats = {};

    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { day: label, duration: 0, productivityScore: null };
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
        todayActiveSeconds += log.activeSeconds || 0;
        todayUnwantedHits += log.unwantedUrlHits || 0;
      }

      if (startTime >= weekStart) {
        weeklyTime += duration;

        const dateKey = startTime.toISOString().split("T")[0];
        if (dailyMap[dateKey] !== undefined) {
          dailyMap[dateKey].duration += duration;
          // Track the highest score for the day
          if (
            log.productivityScore !== null &&
            (dailyMap[dateKey].productivityScore === null ||
              log.productivityScore > dailyMap[dateKey].productivityScore)
          ) {
            dailyMap[dateKey].productivityScore = log.productivityScore;
          }
        }

        const hour = startTime.getHours();
        hourlyMap[hour].duration += duration;
      }

      const projectName = log.project?.name || "Unknown";
      if (!projectStats[projectName]) projectStats[projectName] = 0;
      projectStats[projectName] += duration;

      // Accumulate time per task (all-time)
      if (log.task) {
        const taskName = log.task.title || "Unnamed Task";
        if (!taskStats[taskName]) taskStats[taskName] = 0;
        taskStats[taskName] += duration;
      }
    });

    // Today's aggregate productivity score
    const todayProductivityScore =
      todayTime > 0
        ? calcScore(todayActiveSeconds, todayTime, todayUnwantedHits)
        : 0;

    res.json({
      totalTime,
      todayTime,
      weeklyTime,
      todayActiveSeconds,
      todayProductivityScore,
      projectStats,
      taskStats,
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
    })
      .populate("project", "name")
      .populate("task", "title");

    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    let todayTime = 0;
    let weeklyTime = 0;
    let totalTime = 0;
    let todayActiveSeconds = 0;
    let todayUnwantedHits = 0;
    const projectStats = {};
    const taskStats = {};

    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const key = d.toISOString().split("T")[0];
      dailyMap[key] = { day: label, duration: 0, productivityScore: null };
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
        todayActiveSeconds += log.activeSeconds || 0;
        todayUnwantedHits += log.unwantedUrlHits || 0;
      }

      if (startTime >= weekStart) {
        weeklyTime += duration;

        const dateKey = startTime.toISOString().split("T")[0];
        if (dailyMap[dateKey] !== undefined) {
          dailyMap[dateKey].duration += duration;
          if (
            log.productivityScore !== null &&
            (dailyMap[dateKey].productivityScore === null ||
              log.productivityScore > dailyMap[dateKey].productivityScore)
          ) {
            dailyMap[dateKey].productivityScore = log.productivityScore;
          }
        }

        const hour = startTime.getHours();
        hourlyMap[hour].duration += duration;
      }

      const projectName = log.project?.name || "Unknown";
      if (!projectStats[projectName]) projectStats[projectName] = 0;
      projectStats[projectName] += duration;

      // Accumulate time per task (all-time)
      if (log.task) {
        const taskName = log.task.title || "Unnamed Task";
        if (!taskStats[taskName]) taskStats[taskName] = 0;
        taskStats[taskName] += duration;
      }
    });

    const todayProductivityScore =
      todayTime > 0
        ? calcScore(todayActiveSeconds, todayTime, todayUnwantedHits)
        : 0;

    // Is this member currently low-productivity?
    const isLowProductivity =
      todayActiveSeconds / WORKDAY_SECONDS < LOW_PRODUCTIVITY_THRESHOLD;

    res.json({
      member,
      totalTime,
      todayTime,
      weeklyTime,
      todayActiveSeconds,
      todayProductivityScore,
      isLowProductivity,
      projectStats,
      taskStats,
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
  pingActivity,
  getActiveTimeLog,
  getTimeLogs,
  getDashboardStats,
  getOrgMembers,
  getMemberStats,
};
