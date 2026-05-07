const express = require("express");
const {
  startTimer,
  stopTimer,
  pingActivity,
  getActiveTimeLog,
  getTimeLogs,
  getDashboardStats,
  getOrgMembers,
  getMemberStats,
  getProjectStats,
} = require("../controllers/timeLog.controller.js");

const { protect, isAdmin } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/start", protect, startTimer);
router.post("/stop", protect, stopTimer);
router.post("/activity", protect, pingActivity); // live activity ping
router.get("/active", protect, getActiveTimeLog);
router.get("/", protect, getTimeLogs);
router.get("/stats", protect, getDashboardStats);

router.get("/admin/members", protect, isAdmin, getOrgMembers);
router.get("/admin/members/:memberId/stats", protect, isAdmin, getMemberStats);
router.get("/admin/project-stats", protect, isAdmin, getProjectStats);

module.exports = router;
