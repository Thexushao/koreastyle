const Order = require('../models/Order');
const User = require('../models/User');

const getSummaryReport = async (req, res) => {
  const orders = await Order.find({ status: { $ne: 'cancelled' } });
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice + o.shippingFee, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // 回購率
  const userOrderCounts = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: '$user', count: { $sum: 1 } } },
  ]);
  const repeatBuyers = userOrderCounts.filter((u) => u.count > 1).length;
  const totalBuyers = userOrderCounts.length;
  const repurchaseRate = totalBuyers > 0 ? ((repeatBuyers / totalBuyers) * 100).toFixed(1) : 0;

  // 各時段銷售熱度（0~23 時）
  const hourlyData = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $hour: { date: '$createdAt', timezone: '+08:00' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const hourlyMap = Object.fromEntries(hourlyData.map((h) => [h._id, h]));
  const hourly = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    orders: hourlyMap[i]?.orders || 0,
    revenue: hourlyMap[i]?.revenue || 0,
  }));

  // 月營收（近 6 個月）
  const month6ago = new Date();
  month6ago.setMonth(month6ago.getMonth() - 5);
  month6ago.setDate(1);
  const monthlyData = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: month6ago } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y/%m', date: '$createdAt', timezone: '+08:00' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: '$_id', revenue: 1, orders: 1, _id: 0 } },
  ]);

  res.json({ avgOrderValue, repurchaseRate: Number(repurchaseRate), repeatBuyers, totalBuyers, hourly, monthlyData });
};

const exportOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
  const statusLabel = { pending: '待確認', confirmed: '已確認', shipped: '已出貨', delivered: '已送達', cancelled: '已取消' };

  const rows = [
    ['訂單編號', '會員', 'Email', '商品', '金額', '運費', '優惠折扣', '狀態', '下單時間'],
    ...orders.map((o) => [
      o._id,
      o.user?.name || '',
      o.user?.email || '',
      o.items.map((i) => `${i.name}x${i.qty}`).join(' | '),
      o.totalPrice,
      o.shippingFee,
      o.coupon?.discountAmount || 0,
      statusLabel[o.status] || o.status,
      new Date(o.createdAt).toLocaleString('zh-TW'),
    ]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="orders_${Date.now()}.csv"`);
  res.send('﻿' + csv);
};

module.exports = { getSummaryReport, exportOrders };
