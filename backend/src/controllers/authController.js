const User = require('../models/User');
const { sign } = require('../utils/jwt');

const cookieOpts = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
  path: '/',
});

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  user.lastLoginAt = new Date();
  await user.save();

  const token = sign({ id: user._id, role: user.role });
  res.cookie('token', token, cookieOpts());
  res.json({ token, user: user.toSafeJSON() });
};

exports.logout = async (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ ok: true });
};

exports.me = async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
};
