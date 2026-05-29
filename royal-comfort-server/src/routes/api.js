const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/ordersController');
const catalogController = require('../controllers/catalogController');
const referralController = require('../controllers/referralController');

// --- ЗАКАЗЫ ---
router.post('/orders', ordersController.createOrder);
router.get('/orders/active', ordersController.getActiveOrders);
router.get('/orders/search', ordersController.searchOrdersByContact);
router.get('/orders/:id', ordersController.getOrderStatus);

// --- КАТАЛОГ (для сайта) ---
router.get('/catalog/categories', catalogController.getActiveCategories);
router.get('/catalog/categories/all', catalogController.getAllCategories);
router.get('/catalog/categories/:id', catalogController.getCategoryWithConfig);
router.get('/catalog/products', catalogController.getProducts);
router.get('/catalog/reviews', catalogController.getReviews);
router.post('/reviews', catalogController.createReview);
router.get('/catalog/promo', catalogController.getPromoSettings);

// --- РЕФЕРАЛЬНАЯ СИСТЕМА ---
router.post('/referral/generate', referralController.generateReferralCode);
router.post('/referral/validate', referralController.validateReferralCode);

module.exports = router;