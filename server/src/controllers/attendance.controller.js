const Attendance = require("../models/attendance.model");
const User = require("../models/users.model");

// Get today's date string YYYY-MM-DD in local time
const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

// POST /api/attendance/checkin  (employee)
// Idempotent — creates record only if none exists today
const recordCheckIn = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dateStr = getTodayStr();
    const now = new Date();

    // Determine status: late if check-in after 9:30 AM
    const checkInHour = now.getHours();
    const checkInMin = now.getMinutes();
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMin > 30);

    const attendance = await Attendance.findOneAndUpdate(
      { user: userId, date: dateStr },
      {
        $setOnInsert: {
          user: userId,
          date: dateStr,
          checkIn: now,
          status: isLate ? "late" : "present",
        },
      },
      { upsert: true, new: true },
    );

    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance/checkout  (employee)
const recordCheckOut = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const dateStr = getTodayStr();
    const now = new Date();

    const attendance = await Attendance.findOne({
      user: userId,
      date: dateStr,
    });

    if (!attendance) {
      return res.status(404).json({ message: "No check-in found for today" });
    }

    attendance.checkOut = now;
    if (attendance.checkIn) {
      attendance.totalHours = Math.floor(
        (now - attendance.checkIn) / 1000,
      );
    }
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

// GET /api/attendance/mine  (employee)
const getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// GET /api/attendance/admin/all  (admin)
// Query params: startDate, endDate (YYYY-MM-DD), userId
const getOrgAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // Default to last 7 days
    const end = endDate || getTodayStr();
    const startD = new Date();
    startD.setDate(startD.getDate() - 6);
    const start = startDate || startD.toISOString().split("T")[0];

    const filter = { date: { $gte: start, $lte: end } };
    if (userId) filter.user = userId;

    const records = await Attendance.find(filter)
      .populate("user", "name email")
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// GET /api/attendance/admin/summary  (admin) — today's overview per employee
const getAttendanceSummary = async (req, res, next) => {
  try {
    const dateStr = getTodayStr();

    const members = await User.find({ role: "member", isActive: true }).select(
      "name email",
    );

    const todayRecords = await Attendance.find({ date: dateStr })
      .lean();

    const recordMap = {};
    todayRecords.forEach((r) => {
      recordMap[r.user.toString()] = r;
    });

    const summary = members.map((m) => {
      const record = recordMap[m._id.toString()];
      return {
        member: { _id: m._id, name: m.name, email: m.email },
        status: record ? record.status : "absent",
        checkIn: record?.checkIn || null,
        checkOut: record?.checkOut || null,
        totalHours: record?.totalHours || 0,
      };
    });

    res.json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordCheckIn,
  recordCheckOut,
  getMyAttendance,
  getOrgAttendance,
  getAttendanceSummary,
};
