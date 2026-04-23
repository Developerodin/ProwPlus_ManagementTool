const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

const scopeForUser = (user) => {
  if (user.role === 'admin') return {};
  if (user.role === 'team') return { teamMembers: user._id };
  if (user.role === 'client') return { client: user._id };
  return { _id: null };
};

const log = (user, project, task, action, details = {}) =>
  Activity.create({ user: user._id, project, task, action, details });

exports.list = async (req, res) => {
  const { search, status } = req.query;
  const q = scopeForUser(req.user);
  if (status) q.status = status;
  if (search) q.name = { $regex: search, $options: 'i' };
  const projects = await Project.find(q)
    .populate('client', 'name email company avatar')
    .populate('teamMembers', 'name email designation avatar')
    .sort({ createdAt: -1 });
  res.json({ projects });
};

exports.getOne = async (req, res) => {
  const q = { _id: req.params.id, ...scopeForUser(req.user) };
  const project = await Project.findOne(q)
    .populate('client', 'name email company avatar phone')
    .populate('teamMembers', 'name email designation avatar')
    .populate('createdBy', 'name email');
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json({ project });
};

exports.create = async (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.client) {
    return res.status(400).json({ message: 'name and client are required' });
  }
  const project = await Project.create({ ...body, createdBy: req.user._id });
  await log(req.user, project._id, null, 'project.created', { name: project.name });
  const populated = await project.populate([
    { path: 'client', select: 'name email company' },
    { path: 'teamMembers', select: 'name email designation' },
  ]);
  res.status(201).json({ project: populated });
};

exports.update = async (req, res) => {
  const allowed = [
    'name', 'description', 'techStack', 'startDate', 'deadline',
    'status', 'priority', 'progress', 'teamMembers', 'budget', 'tags', 'client',
  ];
  const patch = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  });

  const before = await Project.findById(req.params.id);
  if (!before) return res.status(404).json({ message: 'Project not found' });

  const project = await Project.findByIdAndUpdate(req.params.id, patch, { new: true })
    .populate('client', 'name email company')
    .populate('teamMembers', 'name email designation');

  if (patch.status && patch.status !== before.status) {
    await log(req.user, project._id, null, 'project.status.changed', {
      from: before.status, to: patch.status,
    });
  }
  res.json({ project });
};

exports.remove = async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  await Task.deleteMany({ project: req.params.id });
  await Activity.deleteMany({ project: req.params.id });
  res.json({ ok: true });
};

exports.stats = async (req, res) => {
  const base = scopeForUser(req.user);
  const [total, active, completed, onHold] = await Promise.all([
    Project.countDocuments(base),
    Project.countDocuments({ ...base, status: { $in: ['planning', 'in-progress', 'testing'] } }),
    Project.countDocuments({ ...base, status: 'completed' }),
    Project.countDocuments({ ...base, status: 'on-hold' }),
  ]);
  res.json({ total, active, completed, onHold });
};

exports.activity = async (req, res) => {
  const projects = await Project.find(scopeForUser(req.user)).select('_id');
  const ids = projects.map((p) => p._id);
  const activity = await Activity.find({ project: { $in: ids } })
    .populate('user', 'name role avatar')
    .populate('project', 'name')
    .sort({ createdAt: -1 })
    .limit(30);
  res.json({ activity });
};
