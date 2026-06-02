const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// 儀表板統計
const getDashboard = async (req, res) => {
  const now = new Date();
  const day7ago = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const day30ago = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [productCount, orderCount, userCount, recentOrders] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    User.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
  ]);

  // 總營收 + 成本（透過 lookup 取得商品成本）
  const revenueAgg = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  const profitAgg = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        totalCost: { $sum: { $multiply: [{ $ifNull: ['$productInfo.cost', 0] }, '$items.qty'] } },
      },
    },
  ]);

  const totalRevenue = profitAgg[0]?.totalRevenue || 0;
  const totalCost = profitAgg[0]?.totalCost || 0;
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;

  // 近 7 天每日營收 + 成本
  const dailyRevenue = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: day7ago } } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $dateToString: { format: '%m/%d', date: '$createdAt', timezone: '+08:00' } },
        revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        cost: { $sum: { $multiply: [{ $ifNull: ['$productInfo.cost', 0] }, '$items.qty'] } },
        orders: { $addToSet: '$_id' },
      },
    },
    {
      $project: {
        _id: 1, revenue: 1, cost: 1,
        profit: { $subtract: ['$revenue', '$cost'] },
        orders: { $size: '$orders' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 補齊近 7 天（無訂單的日期顯示 0）
  const dailyMap = Object.fromEntries(dailyRevenue.map((d) => [d._id, d]));
  const dailyFilled = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    return {
      date: key,
      revenue: dailyMap[key]?.revenue || 0,
      cost: dailyMap[key]?.cost || 0,
      profit: dailyMap[key]?.profit || 0,
      orders: dailyMap[key]?.orders || 0,
    };
  });

  // 近 30 天每週營收
  const weeklyRevenue = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: day30ago } } },
    {
      $group: {
        _id: { $isoWeek: '$createdAt' },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
        week: { $first: '$createdAt' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        label: { $dateToString: { format: 'W%V', date: '$week' } },
        revenue: 1,
        orders: 1,
      },
    },
  ]);

  // 訂單狀態分佈
  const statusStats = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const statusLabels = { pending: '待確認', confirmed: '已確認', shipped: '已出貨', delivered: '已送達', cancelled: '已取消' };
  const statusData = statusStats.map((s) => ({ name: statusLabels[s._id] || s._id, value: s.count }));

  // 熱賣商品 Top 5
  const topProducts = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        totalQty: { $sum: '$items.qty' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: 5 },
  ]);

  // 分類銷售佔比
  const categoryRevenue = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $group: {
        _id: '$productInfo.category',
        revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
        qty: { $sum: '$items.qty' },
      },
    },
    { $sort: { revenue: -1 } },
  ]);
  const catLabels = { tops: '上衣', bottoms: '下著', dresses: '洋裝', outerwear: '外套', accessories: '配件' };
  const categoryData = categoryRevenue.map((c) => ({ name: catLabels[c._id] || c._id, revenue: c.revenue, qty: c.qty }));

  res.json({
    productCount,
    orderCount,
    userCount,
    revenue: revenueAgg[0]?.total || 0,
    totalCost,
    grossProfit,
    grossMargin: Number(grossMargin),
    recentOrders,
    dailyRevenue: dailyFilled,
    weeklyRevenue,
    statusData,
    topProducts,
    categoryData,
  });
};

// 商品管理
const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ message: '找不到商品' });
  res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: '找不到商品' });
  res.json({ message: '已刪除商品' });
};

// 訂單管理
const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email');
  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  ).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: '找不到訂單' });
  res.json(order);
};

module.exports = { getDashboard, createProduct, updateProduct, deleteProduct, getAllOrders, updateOrderStatus };
