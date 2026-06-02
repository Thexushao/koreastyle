const Coupon = require('../models/Coupon');

// Admin CRUD
const getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

const createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
};

const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ message: '找不到優惠券' });
  res.json(coupon);
};

const deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: '已刪除' });
};

// Public: validate coupon
const validateCoupon = async (req, res) => {
  const { code, orderTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ message: '優惠券不存在或已停用' });
  if (coupon.expiresAt && new Date() > coupon.expiresAt)
    return res.status(400).json({ message: '優惠券已過期' });
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
    return res.status(400).json({ message: '優惠券已達使用上限' });
  if (orderTotal < coupon.minOrder)
    return res.status(400).json({ message: `訂單需滿 NT$${coupon.minOrder} 才可使用` });

  const discountAmount = coupon.type === 'percentage'
    ? Math.floor(orderTotal * (coupon.value / 100))
    : Math.min(coupon.value, orderTotal);

  res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discountAmount,
  });
};

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
