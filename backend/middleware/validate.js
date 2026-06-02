const { validationResult, body, param } = require('express-validator');

// 驗證結果檢查器，統一回傳格式
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({ message: messages[0], errors: messages });
  }
  next();
};

// ─── Auth ───────────────────────────────────────────
const registerRules = [
  body('name').trim().notEmpty().withMessage('請填寫姓名').isLength({ max: 50 }).withMessage('姓名不得超過 50 字'),
  body('email').isEmail().withMessage('Email 格式不正確').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('密碼至少需要 6 個字元').isLength({ max: 100 }).withMessage('密碼過長'),
];

const loginRules = [
  body('email').isEmail().withMessage('Email 格式不正確').normalizeEmail(),
  body('password').notEmpty().withMessage('請填寫密碼'),
];

// ─── Products ───────────────────────────────────────
const productRules = [
  body('name').trim().notEmpty().withMessage('請填寫商品名稱').isLength({ max: 100 }).withMessage('名稱不得超過 100 字'),
  body('description').trim().notEmpty().withMessage('請填寫商品描述'),
  body('price').isFloat({ min: 0 }).withMessage('售價必須為 0 以上的數字'),
  body('cost').isFloat({ min: 0 }).withMessage('成本必須為 0 以上的數字'),
  body('stock').isInt({ min: 0 }).withMessage('庫存必須為 0 以上的整數'),
  body('category')
    .isIn(['tops', 'bottoms', 'dresses', 'outerwear', 'accessories'])
    .withMessage('無效的商品分類'),
  body('images').isArray({ min: 1 }).withMessage('至少需要一張圖片'),
  body('images.*').isURL().withMessage('圖片必須為有效的 URL'),
];

// ─── Orders ─────────────────────────────────────────
const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('購物車不能為空'),
  body('items.*.name').notEmpty().withMessage('訂單商品缺少名稱'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('訂單商品價格無效'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('商品數量至少為 1'),
  body('items.*.size').notEmpty().withMessage('請選擇尺寸'),
  body('items.*.color').notEmpty().withMessage('請選擇顏色'),
  body('shippingAddress.name').trim().notEmpty().withMessage('請填寫收件人姓名'),
  body('shippingAddress.phone')
    .matches(/^09\d{8}$/)
    .withMessage('手機號碼格式不正確（需為 09 開頭 10 碼）'),
  body('shippingAddress.street').trim().notEmpty().withMessage('請填寫詳細地址'),
  body('shippingAddress.city').trim().notEmpty().withMessage('請填寫城市'),
  body('shippingAddress.postalCode')
    .matches(/^\d{3,6}$/)
    .withMessage('郵遞區號格式不正確'),
];

// ─── Coupons ────────────────────────────────────────
const couponRules = [
  body('code')
    .trim().notEmpty().withMessage('請填寫優惠碼')
    .isAlphanumeric().withMessage('優惠碼只能包含英文字母和數字')
    .isLength({ min: 3, max: 20 }).withMessage('優惠碼長度需在 3~20 字元之間'),
  body('type').isIn(['percentage', 'fixed']).withMessage('折扣類型無效'),
  body('value').isFloat({ min: 1 }).withMessage('折扣值必須大於 0'),
  body('value').custom((val, { req }) => {
    if (req.body.type === 'percentage' && val > 100) throw new Error('百分比折扣不得超過 100%');
    return true;
  }),
  body('minOrder').optional().isFloat({ min: 0 }).withMessage('最低金額不得為負數'),
  body('maxUses').optional().isInt({ min: 0 }).withMessage('使用次數不得為負數'),
  body('expiresAt').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('日期格式不正確'),
];

const couponValidateRules = [
  body('code').trim().notEmpty().withMessage('請填寫優惠碼'),
  body('orderTotal').isFloat({ min: 0 }).withMessage('訂單金額無效'),
];

// ─── Inventory ──────────────────────────────────────
const stockAdjustRules = [
  body('change').isInt().withMessage('異動數量必須為整數').custom((val) => {
    if (val === 0) throw new Error('異動數量不得為 0');
    return true;
  }),
  body('reason').trim().notEmpty().withMessage('請填寫調整原因').isLength({ max: 200 }).withMessage('原因不得超過 200 字'),
];

// ─── Banners ────────────────────────────────────────
const bannerRules = [
  body('image').isURL().withMessage('圖片必須為有效的 URL'),
  body('title').trim().notEmpty().withMessage('請填寫標題').isLength({ max: 100 }).withMessage('標題不得超過 100 字'),
  body('ctaHref').trim().notEmpty().withMessage('請填寫按鈕連結'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  productRules,
  orderRules,
  couponRules,
  couponValidateRules,
  stockAdjustRules,
  bannerRules,
};
