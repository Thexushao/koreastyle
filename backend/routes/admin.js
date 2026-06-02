const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getDashboard, createProduct, updateProduct, deleteProduct, getAllOrders, updateOrderStatus } = require('../controllers/adminController');
const { getUsers, getUserDetail, toggleUserStatus } = require('../controllers/userAdminController');
const { getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { getLowStock, adjustStock, getStockLogs } = require('../controllers/inventoryController');
const { getSummaryReport, exportOrders } = require('../controllers/reportController');
const { getAllBanners, createBanner, updateBanner, deleteBanner, reorderBanners } = require('../controllers/bannerController');
const { validate, productRules, couponRules, stockAdjustRules, bannerRules } = require('../middleware/validate');

router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);

// Products
router.post('/products', productRules, validate, createProduct);
router.put('/products/:id', productRules, validate, updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Coupons
router.get('/coupons', getCoupons);
router.post('/coupons', couponRules, validate, createCoupon);
router.put('/coupons/:id', couponRules, validate, updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Inventory
router.get('/inventory/low-stock', getLowStock);
router.get('/inventory/logs', getStockLogs);
router.put('/inventory/:id/adjust', stockAdjustRules, validate, adjustStock);

// Reports
router.get('/reports/summary', getSummaryReport);
router.get('/reports/export', exportOrders);

// Banners
router.get('/banners', getAllBanners);
router.post('/banners', bannerRules, validate, createBanner);
router.put('/banners/reorder', reorderBanners);
router.put('/banners/:id', bannerRules, validate, updateBanner);
router.delete('/banners/:id', deleteBanner);

module.exports = router;
