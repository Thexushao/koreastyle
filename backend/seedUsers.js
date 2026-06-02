require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');

const users = [
  { name: '王小明', email: 'wang@example.com', password: 'test1234' },
  { name: '李美華', email: 'lee@example.com', password: 'test1234' },
  { name: '陳雅婷', email: 'chen@example.com', password: 'test1234' },
  { name: '林志豪', email: 'lin@example.com', password: 'test1234' },
  { name: '張怡君', email: 'chang@example.com', password: 'test1234' },
];

const addresses = [
  { name: '王小明', phone: '0912345678', street: '信義路五段7號', city: '台北市', postalCode: '110' },
  { name: '李美華', phone: '0923456789', street: '中山北路二段50號', city: '台北市', postalCode: '104' },
  { name: '陳雅婷', phone: '0934567890', street: '文心路三段100號', city: '台中市', postalCode: '408' },
  { name: '林志豪', phone: '0945678901', street: '中正路88號', city: '高雄市', postalCode: '800' },
  { name: '張怡君', phone: '0956789012', street: '東門路一段25號', city: '台南市', postalCode: '700' },
];

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'delivered', 'cancelled'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const products = await Product.find();
  if (products.length === 0) {
    console.log('請先執行 npm run seed 插入商品');
    process.exit(1);
  }

  // 建立使用者（已存在則跳過）
  const createdUsers = [];
  for (const u of users) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create(u);
      console.log(`建立使用者：${u.name} (${u.email})`);
    } else {
      console.log(`已存在，跳過：${u.email}`);
    }
    createdUsers.push(user);
  }

  // 為每位使用者建立 2~3 筆訂單
  const orders = [];
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const addr = addresses[i];
    const orderCount = Math.random() > 0.4 ? 3 : 2;

    for (let j = 0; j < orderCount; j++) {
      const itemCount = Math.floor(Math.random() * 2) + 1;
      const items = [];
      const usedProducts = new Set();

      for (let k = 0; k < itemCount; k++) {
        let p;
        do { p = pick(products); } while (usedProducts.has(p._id.toString()));
        usedProducts.add(p._id.toString());
        items.push({
          product: p._id,
          name: p.name,
          image: p.images[0],
          price: p.price,
          size: pick(p.sizes),
          color: pick(p.colors),
          qty: Math.floor(Math.random() * 2) + 1,
        });
      }

      const totalPrice = items.reduce((acc, it) => acc + it.price * it.qty, 0);
      const shippingFee = totalPrice >= 2000 ? 0 : 60;

      orders.push({
        user: user._id,
        items,
        shippingAddress: addr,
        totalPrice,
        shippingFee,
        status: pick(statuses),
      });
    }
  }

  await Order.insertMany(orders);
  console.log(`\n已為 ${createdUsers.length} 位使用者插入共 ${orders.length} 筆訂單`);
  console.log('\n所有測試帳號密碼皆為：test1234');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
