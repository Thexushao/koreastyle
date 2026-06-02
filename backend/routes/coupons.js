const express = require('express');
const router = express.Router();
const { validateCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { validate, couponValidateRules } = require('../middleware/validate');

router.post('/validate', protect, couponValidateRules, validate, validateCoupon);

module.exports = router;
