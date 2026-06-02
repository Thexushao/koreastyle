const Product = require('../models/Product');

const getProducts = async (req, res) => {
  const { category, size, color, sort, search, featured } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (size) filter.sizes = size;
  if (color) filter.colors = color;
  if (featured === 'true') filter.isFeatured = true;
  if (search) filter.name = { $regex: search, $options: 'i' };

  let query = Product.find(filter);
  if (sort === 'price_asc') query = query.sort({ price: 1 });
  else if (sort === 'price_desc') query = query.sort({ price: -1 });
  else if (sort === 'newest') query = query.sort({ createdAt: -1 });
  else query = query.sort({ createdAt: -1 });

  const products = await query;
  res.json(products);
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: '找不到商品' });
  res.json(product);
};

const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json(products);
};

const getNewArrivals = async (req, res) => {
  const products = await Product.find({ isNew: true }).sort({ createdAt: -1 }).limit(8);
  res.json(products);
};

module.exports = { getProducts, getProductById, getFeaturedProducts, getNewArrivals };
