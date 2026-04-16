const Project = require("../models/project.model");

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can create projects" });
    }

    const membersList = req.body.members || [];
    if (!membersList.includes(req.user._id.toString())) {
      membersList.push(req.user._id);
    }

    const project = await Project.create({
      name,
      description,
      organization: req.user.organization,
      members: membersList,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === "admin") {
      projects = await Project.find();
    } else {
      projects = await Project.find({ members: req.user._id });
    }

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

    if (req.body.members) {
      project.members = req.body.members;
      if (!project.members.includes(req.user._id.toString())) {
        project.members.push(req.user._id);
      }
    }

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
