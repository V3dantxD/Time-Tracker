const express = require("express");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getAllTasks,
} = require("../controllers/task.controller.js");
const { protect } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getAllTasks);
router.get("/:projectId", protect, getTasks);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;
