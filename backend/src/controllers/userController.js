const User = require('../models/User');

// GET /api/users?role=team|client&search=foo
exports.list = async (req, res) => {
  const { role, search } = req.query;
  const q = {};
  if (role) q.role = role;
  if (search) {
    q.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(q).sort({ createdAt: -1 });
  res.json({ users });
};

exports.getOne = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
};

exports.create = async (req, res) => {
  const { name, email, password, role, designation, company, phone } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, role are required' });
  }
  if (!['team', 'client'].includes(role)) {
    return res.status(400).json({ message: 'role must be team or client' });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const user = await User.create({
    name,
    email,
    password,
    role,
    designation,
    company,
    phone,
    createdBy: req.user._id,
  });
  res.status(201).json({ user: user.toSafeJSON() });
};

exports.update = async (req, res) => {
  const allowed = ['name', 'designation', 'company', 'phone', 'avatar', 'isActive'];
  const patch = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  });
  if (req.body.password) {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = req.body.password;
    Object.assign(user, patch);
    await user.save();
    return res.json({ user: user.toSafeJSON() });
  }
  const user = await User.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
};

exports.remove = async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(400).json({ message: 'Cannot delete yourself' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') {
    return res.status(400).json({ message: 'Cannot delete admin accounts here' });
  }
  await user.deleteOne();
  res.json({ ok: true });
};

exports.stats = async (req, res) => {
  const [teamCount, clientCount, adminCount] = await Promise.all([
    User.countDocuments({ role: 'team', isActive: true }),
    User.countDocuments({ role: 'client', isActive: true }),
    User.countDocuments({ role: 'admin', isActive: true }),
  ]);
  res.json({ teamCount, clientCount, adminCount });
};
