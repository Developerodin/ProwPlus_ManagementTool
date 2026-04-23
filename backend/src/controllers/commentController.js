const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

const canSee = (user, project) => {
  if (user.role === 'admin') return true;
  if (user.role === 'team') return project.teamMembers.some((m) => String(m) === String(user._id));
  if (user.role === 'client') return String(project.client) === String(user._id);
  return false;
};

exports.listByTask = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const project = await Project.findById(task.project);
  if (!canSee(req.user, project)) return res.status(403).json({ message: 'Forbidden' });
  const comments = await Comment.find({ task: task._id })
    .populate('author', 'name role avatar')
    .sort({ createdAt: 1 });
  res.json({ comments });
};

exports.create = async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  const project = await Project.findById(task.project);
  if (!canSee(req.user, project)) return res.status(403).json({ message: 'Forbidden' });
  const { content, mentions } = req.body || {};
  if (!content?.trim()) return res.status(400).json({ message: 'content is required' });

  const comment = await Comment.create({
    task: task._id,
    project: project._id,
    author: req.user._id,
    content: content.trim(),
    mentions: mentions || [],
  });
  await Activity.create({
    user: req.user._id,
    project: project._id,
    task: task._id,
    action: 'task.comment.added',
    details: { title: task.title, preview: content.slice(0, 80) },
  });
  const populated = await comment.populate('author', 'name role avatar');
  res.status(201).json({ comment: populated });
};

exports.remove = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (req.user.role !== 'admin' && String(comment.author) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await comment.deleteOne();
  res.json({ ok: true });
};
