const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

const canSeeProject = (user, project) => {
  if (user.role === 'admin') return true;
  if (user.role === 'team') return project.teamMembers.some((m) => String(m) === String(user._id));
  if (user.role === 'client') return String(project.client) === String(user._id);
  return false;
};

const log = (user, project, task, action, details = {}) =>
  Activity.create({ user: user._id, project, task, action, details });

const recalcProgress = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (!tasks.length) {
    await Project.findByIdAndUpdate(projectId, { progress: 0 });
    return;
  }
  const done = tasks.filter((t) => t.status === 'done').length;
  const progress = Math.round((done / tasks.length) * 100);
  await Project.findByIdAndUpdate(projectId, { progress });
};

exports.listByProject = async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!canSeeProject(req.user, project)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const tasks = await Task.find({ project: project._id })
    .populate('assignedTo', 'name email avatar role designation')
    .populate('createdBy', 'name role')
    .sort({ createdAt: -1 });
  res.json({ tasks });
};

exports.create = async (req, res) => {
  if (!['admin', 'team'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only admin or team can create tasks' });
  }
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  if (!canSeeProject(req.user, project)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const task = await Task.create({
    ...req.body,
    project: project._id,
    createdBy: req.user._id,
  });
  await log(req.user, project._id, task._id, 'task.created', { title: task.title, type: task.type });
  await recalcProgress(project._id);
  const populated = await task.populate('assignedTo', 'name email avatar role');
  res.status(201).json({ task: populated });
};

exports.update = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const project = await Project.findById(task.project);
  if (!canSeeProject(req.user, project)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // clients may only approve tasks — not edit
  if (req.user.role === 'client') {
    return res.status(403).json({ message: 'Use /approve endpoint' });
  }

  const allowed = [
    'title', 'description', 'type', 'status', 'priority',
    'assignedTo', 'dueDate', 'subtasks', 'attachments',
  ];
  const patch = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  });

  if (patch.status === 'done' && task.status !== 'done') patch.completedAt = new Date();
  if (patch.status && patch.status !== 'done') patch.completedAt = null;

  const before = task.status;
  Object.assign(task, patch);
  await task.save();

  if (patch.status && patch.status !== before) {
    await log(req.user, task.project, task._id, 'task.status.changed', {
      title: task.title, from: before, to: patch.status,
    });
  }

  await recalcProgress(task.project);
  const populated = await task.populate('assignedTo', 'name email avatar role');
  res.json({ task: populated });
};

exports.remove = async (req, res) => {
  if (!['admin', 'team'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  await recalcProgress(task.project);
  res.json({ ok: true });
};

exports.approve = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const project = await Project.findById(task.project);
  if (req.user.role !== 'client' || String(project.client) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Only the project client can approve' });
  }
  if (task.status !== 'done') {
    return res.status(400).json({ message: 'Task must be marked done first' });
  }
  task.clientApproved = true;
  task.clientApprovedAt = new Date();
  await task.save();
  await log(req.user, task.project, task._id, 'task.approved', { title: task.title });
  res.json({ task });
};

exports.myTasks = async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate('project', 'name status')
    .sort({ dueDate: 1, createdAt: -1 })
    .limit(50);
  res.json({ tasks });
};
