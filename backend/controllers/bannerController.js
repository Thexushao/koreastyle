const Banner = require('../models/Banner');

// Public: 取得啟用中的 banner（按 order 排序）
const getActiveBanners = async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  res.json(banners);
};

// Admin CRUD
const getAllBanners = async (req, res) => {
  const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
  res.json(banners);
};

const createBanner = async (req, res) => {
  const count = await Banner.countDocuments();
  const banner = await Banner.create({ ...req.body, order: req.body.order ?? count });
  res.status(201).json(banner);
};

const updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) return res.status(404).json({ message: '找不到 Banner' });
  res.json(banner);
};

const deleteBanner = async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: '已刪除' });
};

const reorderBanners = async (req, res) => {
  const { ids } = req.body; // 依序排列的 id 陣列
  await Promise.all(ids.map((id, i) => Banner.findByIdAndUpdate(id, { order: i })));
  res.json({ message: '排序已更新' });
};

module.exports = { getActiveBanners, getAllBanners, createBanner, updateBanner, deleteBanner, reorderBanners };
