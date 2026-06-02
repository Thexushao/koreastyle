require('dotenv').config();
const mongoose = require('mongoose');
const Banner = require('./models/Banner');

const banners = [
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
    tag: '2024 SUMMER COLLECTION',
    title: '夏日韓風\n穿搭特輯',
    subtitle: '清爽棉質、輕薄洋裝，讓你整個夏天都時髦',
    ctaText: '立即選購',
    ctaHref: '/products',
    order: 0,
    isActive: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80',
    tag: 'NEW ARRIVALS',
    title: '最新上架\n韓系外套',
    subtitle: '格紋、風衣、針織，秋冬必備百搭單品',
    ctaText: '查看新品',
    ctaHref: '/products?sort=newest',
    order: 1,
    isActive: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80',
    tag: 'FEATURED',
    title: '精選推薦\n本季必入',
    subtitle: '嚴選韓國當季最流行的穿搭，每件都是焦點',
    ctaText: '探索精選',
    ctaHref: '/products?featured=true',
    order: 2,
    isActive: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Banner.deleteMany({});
  await Banner.insertMany(banners);
  console.log(`已插入 ${banners.length} 筆 Banner 資料`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
