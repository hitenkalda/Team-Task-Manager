const Project = require('../models/Project');
const Task = require('../models/Task');
const { successResponse } = require('../utils/response');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalProjects = await Project.countDocuments({ 'members.user': userId });
    const totalTasks = await Task.countDocuments({
      project: { $in: await Project.find({ 'members.user': userId }).distinct('_id') }
    });

    const tasksByStatusData = await Task.aggregate([
      { 
        $match: { 
          project: { $in: await Project.find({ 'members.user': userId }).distinct('_id') } 
        } 
      },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const tasksByStatus = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasksByStatusData.forEach(s => tasksByStatus[s._id] = s.count);

    const overdueTasks = await Task.find({
      project: { $in: await Project.find({ 'members.user': userId }).distinct('_id') },
      dueDate: { $lt: new Date() },
      status: { $ne: 'DONE' }
    }).populate('project', 'name').populate('assignee', 'name');

    const recentTasks = await Task.find({
      project: { $in: await Project.find({ 'members.user': userId }).distinct('_id') }
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('project', 'name')
    .populate('assignee', 'name');

    const myAssignedTasks = await Task.find({
      assignee: userId,
      status: { $ne: 'DONE' }
    }).populate('project', 'name');

    successResponse(res, {
      totalProjects,
      totalTasks,
      tasksByStatus,
      overdueTasks,
      recentTasks,
      myAssignedTasks
    }, 'Dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
};
