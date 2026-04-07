const Project = require("../models/project.model");

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can create projects" });
    }

    const project = await Project.create({
      name,
      description,
      organization: req.user.organization,
      members: [req.user._id],
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find();

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) throw new Error("Project not found");

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can update projects" });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;

    await project.save();

    res.json(project);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) throw new Error("Project not found");

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can delete projects" });
    }

    await project.deleteOne();

    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
};
