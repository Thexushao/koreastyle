const User = require('../models/User');
const Order = require('../models/Order');

const getUsers = async (req, res) => {
  const { search } = req.query;
  const filter = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  res.json(users);
};

const getUserDetail = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: '找不到會員' });
  const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
  const totalSpent = orders.filter((o) => o.status !== 'cancelled').reduce((acc, o) => acc + o.totalPrice + o.shippingFee, 0);
  res.json({ user, orders, totalSpent });
};

const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: '找不到會員' });
  if (user.isAdmin) return res.status(400).json({ message: '無法停用管理員帳號' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ isActive: user.isActive });
};

module.exports = { getUsers, getUserDetail, toggleUserStatus };
