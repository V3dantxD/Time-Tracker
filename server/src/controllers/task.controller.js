const Task = require("../models/task.model");

const createTask = async (req, res, next) => {
  try {
    const { title, description, project } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create tasks" });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: req.body.assignedTo || req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const filter = { project: req.params.projectId };
    if (req.user.role !== "admin") {
      filter.assignedTo = req.user._id;
    }
    const tasks = await Task.find(filter);

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) throw new Error("Task not found");

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update tasks" });
    }

    Object.assign(task, req.body);

    await task.save();

    res.json(task);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) throw new Error("Task not found");

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete tasks" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    let tasks = [];
    if (req.user.role === "admin") {
      tasks = await Task.find().populate("project");
    } else {
      const Project = require("../models/project.model");
      const userProjects = await Project.find({ members: req.user._id }).select("_id");
      const projectIds = userProjects.map((p) => p._id);
      
      tasks = await Task.find({ project: { $in: projectIds }, assignedTo: req.user._id }).populate("project");
    }
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getAllTasks };
