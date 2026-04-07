const express = require("express");
const {
  uploadScreenshot,
  getMyScreenshots,
  getAllLatestScreenshots,
  getEmployeeScreenshots,
  logMonitoringWarning,
  getMonitoringWarnings,
} = require("../controllers/screenshot.controller.js");

const { protect, isAdmin } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/upload", protect, uploadScreenshot);
router.get("/mine", protect, getMyScreenshots);
router.post("/warning", protect, logMonitoringWarning);
router.get("/admin/all", protect, isAdmin, getAllLatestScreenshots);
router.get("/admin/warnings", protect, isAdmin, getMonitoringWarnings);
router.get("/admin/:userId", protect, isAdmin, getEmployeeScreenshots);

module.exports = router;

