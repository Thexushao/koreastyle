const Order = require('../models/Order');

const createOrder = async (req, res) => {
  const { items, shippingAddress, note } = req.body;
  if (!items || items.length === 0)
    return res.status(400).json({ message: '購物車是空的' });

  const totalPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    totalPrice,
    note,
  });
  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: '找不到訂單' });
  if (order.user._id.toString() !== req.user._id.toString())
    return res.status(403).json({ message: '無權限查看此訂單' });
  res.json(order);
};

module.exports = { createOrder, getMyOrders, getOrderById };
