const Product = require('../models/Product');
const StockLog = require('../models/StockLog');

const getLowStock = async (req, res) => {
  const threshold = Number(req.query.threshold) || 10;
  const products = await Product.find({ stock: { $lte: threshold } }).sort({ stock: 1 });
  res.json(products);
};

const adjustStock = async (req, res) => {
  const { change, reason } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: '找不到商品' });

  const previousStock = product.stock;
  const newStock = previousStock + Number(change);
  if (newStock < 0) return res.status(400).json({ message: '庫存不足，無法調整' });

  product.stock = newStock;
  await product.save();

  await StockLog.create({
    product: product._id,
    productName: product.name,
    previousStock,
    newStock,
    change: Number(change),
    reason,
    operator: req.user._id,
  });

  res.json({ stock: product.stock });
};

const getStockLogs = async (req, res) => {
  const logs = await StockLog.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('operator', 'name');
  res.json(logs);
};

module.exports = { getLowStock, adjustStock, getStockLogs };
