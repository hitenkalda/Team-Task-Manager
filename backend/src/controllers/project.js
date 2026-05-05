const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'ADMIN' }]
    });
    successResponse(res, project, 'Project created', 201);
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      'members.user': req.user.id
    }).populate('owner', 'name email');
    successResponse(res, projects, 'Projects retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');
    
    if (!project) return errorResponse(res, 'Project not found', 404);
    
    const isMember = project.members.some(m => m.user._id.toString() === req.user.id);
    if (!isMember) return errorResponse(res, 'Access denied', 403);

    const taskStats = await Task.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    taskStats.forEach(s => stats[s._id] = s.count);

    successResponse(res, { project, stats }, 'Project details retrieved');
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return errorResponse(res, 'Project not found', 404);

    const isAdmin = project.members.some(m => m.user.toString() === req.user.id && m.role === 'ADMIN');
    if (!isAdmin) return errorResponse(res, 'Admin access required', 403);

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    successResponse(res, updatedProject, 'Project updated');
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return errorResponse(res, 'Project not found', 404);

    const isAdmin = project.members.some(m => m.user.toString() === req.user.id && m.role === 'ADMIN');
    if (!isAdmin) return errorResponse(res, 'Admin access required', 403);

    await Project.findByIdAndDelete(req.params.id);
    await Task.deleteMany({ project: req.params.id });
    successResponse(res, null, 'Project and associated tasks deleted');
  } catch (error) {
    next(error);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return errorResponse(res, 'Project not found', 404);

    const isAdmin = project.members.some(m => m.user.toString() === req.user.id && m.role === 'ADMIN');
    if (!isAdmin) return errorResponse(res, 'Admin access required', 403);

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return errorResponse(res, 'User not found', 404);

    const alreadyMember = project.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return errorResponse(res, 'User already a member', 400);

    project.members.push({ user: userToAdd._id, role });
    await project.save();
    successResponse(res, project, 'Member added');
  } catch (error) {
    next(error);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return errorResponse(res, 'Project not found', 404);

    const isAdmin = project.members.some(m => m.user.toString() === req.user.id && m.role === 'ADMIN');
    if (!isAdmin) return errorResponse(res, 'Admin access required', 403);

    const memberToRemove = project.members.find(m => m.user.toString() === req.params.userId);
    if (memberToRemove && memberToRemove.role === 'ADMIN') {
      const adminCount = project.members.filter(m => m.role === 'ADMIN').length;
      if (adminCount <= 1) return errorResponse(res, 'Cannot remove the last admin', 400);
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    successResponse(res, project, 'Member removed');
  } catch (error) {
    next(error);
  }
};
