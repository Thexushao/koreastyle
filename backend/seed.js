require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  {
    name: '韓版寬鬆棉質T恤',
    nameKo: '오버핏 코튼 티셔츠',
    description: '採用100%純棉材質，寬鬆版型舒適百搭，春夏必備單品。',
    price: 690, cost: 280,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
    category: 'tops',
    colors: ['白色', '黑色', '米色', '粉色'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 50, isFeatured: true, isNew: true,
  },
  {
    name: '韓系高腰牛仔褲',
    nameKo: '하이웨이스트 데님 팬츠',
    description: '高腰設計修飾腿型，彈力牛仔布料穿著舒適，時尚韓風必備。',
    price: 1290, cost: 550,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'],
    category: 'bottoms',
    colors: ['淺藍', '深藍', '黑色'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock: 35, isFeatured: true, isNew: false,
  },
  {
    name: '韓版小碎花洋裝',
    nameKo: '플로럴 원피스',
    description: '甜美碎花圖案，A字裙擺優雅飄逸，約會、出遊最佳選擇。',
    price: 1490, cost: 620,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600'],
    category: 'dresses',
    colors: ['粉花', '藍花'],
    sizes: ['S', 'M', 'L'],
    stock: 20, isFeatured: true, isNew: true,
  },
  {
    name: '韓系格紋外套',
    nameKo: '체크 재킷',
    description: '經典格紋圖案，修身版型俐落有型，秋冬必備外搭單品。',
    price: 2190, cost: 980,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600'],
    category: 'outerwear',
    colors: ['黑白格', '棕格'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 25, isFeatured: false, isNew: true,
  },
  {
    name: '韓版針織毛衣',
    nameKo: '니트 스웨터',
    description: '柔軟針織材質，寬鬆慵懶的韓系穿搭，秋冬暖意首選。',
    price: 1190, cost: 490,
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'],
    category: 'tops',
    colors: ['米色', '灰色', '深藍'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 40, isFeatured: true, isNew: false,
  },
  {
    name: '韓系抽繩短褲',
    nameKo: '드로우스트링 쇼츠',
    description: '輕薄透氣材質，鬆緊抽繩設計，舒適自在的日常穿搭。',
    price: 790, cost: 320,
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600'],
    category: 'bottoms',
    colors: ['黑色', '灰色', '卡其'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 45, isFeatured: false, isNew: true,
  },
  {
    name: '韓系迷你裙',
    nameKo: '미니 스커트',
    description: 'A字版型顯瘦，百搭設計可搭配各種上衣，時尚簡約。',
    price: 890, cost: 360,
    images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600'],
    category: 'bottoms',
    colors: ['黑色', '白色', '卡其'],
    sizes: ['XS', 'S', 'M', 'L'],
    stock: 30, isFeatured: true, isNew: false,
  },
  {
    name: '韓系長版風衣',
    nameKo: '롱 트렌치코트',
    description: '經典風衣款式，長版設計氣質優雅，春秋必備百搭外套。',
    price: 3290, cost: 1450,
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600'],
    category: 'outerwear',
    colors: ['駝色', '黑色'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 15, isFeatured: true, isNew: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`已插入 ${products.length} 筆商品資料`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
