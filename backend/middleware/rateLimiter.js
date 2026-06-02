const rateLimit = require('express-rate-limit');

// 全域：每 IP 每 15 分鐘 200 次
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '請求過於頻繁，請稍後再試' },
});

// 登入/註冊：每 IP 每 15 分鐘 10 次（防暴力破解）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '登入嘗試過於頻繁，請 15 分鐘後再試' },
});

// 優惠券驗證：每 IP 每 10 分鐘 20 次
const couponLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '優惠券驗證過於頻繁，請稍後再試' },
});

module.exports = { globalLimiter, authLimiter, couponLimiter };
