require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = await User.find();
  const products = await Product.find();

  if (users.length === 0) {
    console.log('找不到使用者，請先註冊至少一個帳號後再執行');
    process.exit(1);
  }
  if (products.length === 0) {
    console.log('找不到商品，請先執行 npm run seed');
    process.exit(1);
  }

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const orders = [
    {
      user: pick(users)._id,
      items: [
        { product: products[0]._id, name: products[0].name, image: products[0].images[0], price: products[0].price, size: 'M', color: '白色', qty: 2 },
        { product: products[4]._id, name: products[4].name, image: products[4].images[0], price: products[4].price, size: 'L', color: '米色', qty: 1 },
      ],
      shippingAddress: { name: '王小明', phone: '0912345678', street: '信義路五段7號', city: '台北市', postalCode: '110' },
      totalPrice: products[0].price * 2 + products[4].price,
      shippingFee: 0,
      status: 'delivered',
    },
    {
      user: pick(users)._id,
      items: [
        { product: products[1]._id, name: products[1].name, image: products[1].images[0], price: products[1].price, size: 'S', color: '深藍', qty: 1 },
      ],
      shippingAddress: { name: '李美華', phone: '0923456789', street: '中山北路二段50號', city: '台北市', postalCode: '104' },
      totalPrice: products[1].price,
      shippingFee: 60,
      status: 'shipped',
    },
    {
      user: pick(users)._id,
      items: [
        { product: products[2]._id, name: products[2].name, image: products[2].images[0], price: products[2].price, size: 'M', color: '粉花', qty: 1 },
        { product: products[6]._id, name: products[6].name, image: products[6].images[0], price: products[6].price, size: 'S', color: '黑色', qty: 1 },
      ],
      shippingAddress: { name: '陳雅婷', phone: '0934567890', street: '文心路三段100號', city: '台中市', postalCode: '408' },
      totalPrice: products[2].price + products[6].price,
      shippingFee: 60,
      status: 'confirmed',
      note: '請幫我包裝漂亮一點，要送人的',
    },
    {
      user: pick(users)._id,
      items: [
        { product: products[3]._id, name: products[3].name, image: products[3].images[0], price: products[3].price, size: 'M', color: '黑白格', qty: 1 },
        { product: products[7]._id, name: products[7].name, image: products[7].images[0], price: products[7].price, size: 'M', color: '駝色', qty: 1 },
      ],
      shippingAddress: { name: '林志豪', phone: '0945678901', street: '中正路88號', city: '高雄市', postalCode: '800' },
      totalPrice: products[3].price + products[7].price,
      shippingFee: 0,
      status: 'pending',
    },
    {
      user: pick(users)._id,
      items: [
        { product: products[5]._id, name: products[5].name, image: products[5].images[0], price: products[5].price, size: 'L', color: '卡其', qty: 3 },
      ],
      shippingAddress: { name: '張怡君', phone: '0956789012', street: '東門路一段25號', city: '台南市', postalCode: '700' },
      totalPrice: products[5].price * 3,
      shippingFee: 60,
      status: 'cancelled',
    },
    {
      user: pick(users)._id,
      items: [
        { product: products[0]._id, name: products[0].name, image: products[0].images[0], price: products[0].price, size: 'XS', color: '粉色', qty: 1 },
        { product: products[2]._id, name: products[2].name, image: products[2].images[0], price: products[2].price, size: 'S', color: '藍花', qty: 1 },
        { product: products[6]._id, name: products[6].name, image: products[6].images[0], price: products[6].price, size: 'XS', color: '白色', qty: 2 },
      ],
      shippingAddress: { name: '吳佩珊', phone: '0967890123', street: '光復路二段30號', city: '新竹市', postalCode: '300' },
      totalPrice: products[0].price + products[2].price + products[6].price * 2,
      shippingFee: 0,
      status: 'delivered',
    },
  ];

  await Order.deleteMany({});
  await Order.insertMany(orders);
  console.log(`已插入 ${orders.length} 筆訂單資料`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
