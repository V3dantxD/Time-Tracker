const express = require("express");
const {
  recordCheckIn,
  recordCheckOut,
  getMyAttendance,
  getOrgAttendance,
  getAttendanceSummary,
} = require("../controllers/attendance.controller.js");

const { protect, isAdmin } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/checkin", protect, recordCheckIn);
router.post("/checkout", protect, recordCheckOut);
router.get("/mine", protect, getMyAttendance);
router.get("/admin/summary", protect, isAdmin, getAttendanceSummary);
router.get("/admin/all", protect, isAdmin, getOrgAttendance);

module.exports = router;
