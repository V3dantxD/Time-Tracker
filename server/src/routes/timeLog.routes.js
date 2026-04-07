const express = require("express");
const {
  startTimer,
  stopTimer,
  getActiveTimeLog,
  getTimeLogs,
  getDashboardStats,
  getOrgMembers,
  getMemberStats,
} = require("../controllers/timeLog.controller.js");

const { protect, isAdmin } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/start", protect, startTimer);
router.post("/stop", protect, stopTimer);
router.get("/active", protect, getActiveTimeLog);
router.get("/", protect, getTimeLogs);
router.get("/stats", protect, getDashboardStats);

router.get("/admin/members", protect, isAdmin, getOrgMembers);
router.get("/admin/members/:memberId/stats", protect, isAdmin, getMemberStats);

module.exports = router;
