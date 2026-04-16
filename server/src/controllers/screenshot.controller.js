const path = require("path");
const fs = require("fs");
const Screenshot = require("../models/screenshot.model");
const User = require("../models/users.model");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads/screenshots");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// POST /api/screenshots/upload  (employee)
// Receives base64 image string, saves to disk
const uploadScreenshot = async (req, res, next) => {
  try {
    const { imageData } = req.body; // base64 JPEG data URL

    if (!imageData) {
      return res.status(400).json({ message: "No image data provided" });
    }

    // Strip data URL prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const filename = `${req.user._id}_${Date.now()}.jpg`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const screenshot = await Screenshot.create({
      user: req.user._id,
      filename,
      filePath: `/uploads/screenshots/${filename}`,
      fileSize: buffer.length,
      capturedAt: new Date(),
    });

    res.status(201).json({ message: "Screenshot saved", id: screenshot._id });
  } catch (error) {
    next(error);
  }
};

// GET /api/screenshots/mine  (employee) — count only, no images
const getMyScreenshots = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await Screenshot.countDocuments({
      user: req.user._id,
      capturedAt: { $gte: today },
    });

    const total = await Screenshot.countDocuments({ user: req.user._id });

    res.json({ todayCount: count, totalCount: total });
  } catch (error) {
    next(error);
  }
};

// GET /api/screenshots/admin/all  (admin) — latest screenshot per employee
const getAllLatestScreenshots = async (req, res, next) => {
  try {
    const members = await User.find({ role: "member", isActive: true }).select(
      "name email",
    );

    const results = await Promise.all(
      members.map(async (member) => {
        const latest = await Screenshot.findOne({ user: member._id })
          .sort({ capturedAt: -1 })
          .lean();

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayCount = await Screenshot.countDocuments({
          user: member._id,
          capturedAt: { $gte: todayStart },
        });

        return {
          member: { _id: member._id, name: member.name, email: member.email },
          latest: latest
            ? {
                url: latest.filePath,
                capturedAt: latest.capturedAt,
              }
            : null,
          todayCount,
        };
      }),
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
};

// GET /api/screenshots/admin/:userId  (admin) — paginated screenshots for one employee
const getEmployeeScreenshots = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const member = await User.findById(userId).select("name email");
    if (!member) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const [screenshots, total] = await Promise.all([
      Screenshot.find({ user: userId })
        .sort({ capturedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Screenshot.countDocuments({ user: userId }),
    ]);

    res.json({
      member,
      screenshots: screenshots.map((s) => ({
        _id: s._id,
        url: s.filePath,
        capturedAt: s.capturedAt,
        fileSize: s.fileSize,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// In-memory warnings store (survives server restarts via DB if needed, but fast for now)
// Using a simple array stored in module scope — good enough for per-session warnings
const warningsStore = [];

// POST /api/screenshots/warning  (employee)
// Called when an employee stops/disables screen monitoring
const logMonitoringWarning = async (req, res, next) => {
  try {
    const { reason = "User stopped screen monitoring" } = req.body;

    const warning = {
      _id: Date.now().toString(),
      userId: req.user._id.toString(),
      userName: req.user.name,
      userEmail: req.user.email,
      reason,
      timestamp: new Date(),
    };

    warningsStore.unshift(warning); // newest first
    // Keep only last 200 warnings
    if (warningsStore.length > 200) warningsStore.length = 200;

    res.status(201).json({ message: "Warning logged", warning });
  } catch (error) {
    next(error);
  }
};

// GET /api/screenshots/admin/warnings  (admin)
const getMonitoringWarnings = async (req, res, next) => {
  try {
    res.json(warningsStore);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadScreenshot,
  getMyScreenshots,
  getAllLatestScreenshots,
  getEmployeeScreenshots,
  logMonitoringWarning,
  getMonitoringWarnings,
};
