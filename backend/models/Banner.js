const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    tag: { type: String, default: '' },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    ctaText: { type: String, default: '立即選購' },
    ctaHref: { type: String, default: '/products' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
