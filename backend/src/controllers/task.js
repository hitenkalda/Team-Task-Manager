const Task = require('../models/Task');
const Project = require('../models/Project');
const { successResponse, errorResponse } = require('../utils/response');

exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, dueDate, assigneeId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return errorResponse(res, 'Project not found', 404);

    const isMember = project.members.some(m => m.user.toString() === req.user.id);
    if (!isMember) return errorResponse(res, 'Access denied', 403);

    if (assigneeId) {
      const isAssigneeMember = project.members.some(m => m.user.toString() === assigneeId);
      if (!isAssigneeMember) return errorResponse(res, 'Assignee must be a project member', 400);
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      project: projectId,
      assignee: assigneeId || null,
      createdBy: req.user.id
    });

    successResponse(res, task, 'Task created', 201);
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId } = req.query;

    const project = await Project.findById(projectId);
    if (!project) return errorResponse(res, 'Project not found', 404);

    const isMember = project.members.some(m => m.user.toString() === req.user.id);
    if (!isMember) return errorResponse(res, 'Access denied', 403);

    const query = { project: projectId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assigneeId) query.assignee = assigneeId;

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    successResponse(res, tasks, 'Tasks retrieved');
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name')
      .populate('project', 'name');

    if (!task) return errorResponse(res, 'Task not found', 404);

    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.user.toString() === req.user.id);
    if (!isMember) return errorResponse(res, 'Access denied', 403);

    successResponse(res, task, 'Task details retrieved');
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return errorResponse(res, 'Task not found', 404);

    const project = await Project.findById(task.project);
    const isAdmin = project.members.some(m => m.user.toString() === req.user.id && m.role === 'ADMIN');
    const isCreator = task.createdBy.toString() === req.user.id;
    const isAssignee = task.assignee && task.assignee.toString() === req.user.id;

    if (!isAdmin && !isCreator && !isAssignee) {
      return errorResponse(res, 'Access denied', 403);
    }

    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    
    if (assigneeId) {
      const isAssigneeMember = project.members.some(m => m.user.toString() === assigneeId);
      if (!isAssigneeMember) return errorResponse(res, 'Assignee must be a project member', 400);
      task.assignee = assigneeId;
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;

    await task.save();
    successResponse(res, task, 'Task updated');
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return errorResponse(res, 'Task not found', 404);

    const project = await Project.findById(task.project);
    const isAdmin = project.members.some(m => m.user.toString() === req.user.id && m.role === 'ADMIN');
    const isCreator = task.createdBy.toString() === req.user.id;

    if (!isAdmin && !isCreator) {
      return errorResponse(res, 'Access denied', 403);
    }

    await Task.findByIdAndDelete(taskId);
    successResponse(res, null, 'Task deleted');
  } catch (error) {
    next(error);
  }
};
