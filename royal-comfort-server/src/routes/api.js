const express = require('express');
const router = express.Router();

const ordersController = require('../controllers/ordersController');
const catalogController = require('../controllers/catalogController');

// --- ЗАКАЗЫ ---
router.post('/orders', ordersController.createOrder);
router.get('/orders/active', ordersController.getActiveOrders);
router.get('/orders/search', ordersController.searchOrdersByContact);
router.get('/orders/:id', ordersController.getOrderStatus);

// --- КАТАЛОГ (для сайта) ---
router.get('/catalog/categories', catalogController.getActiveCategories);
router.get('/catalog/categories/all', catalogController.getAllCategories);
router.get('/catalog/categories/:id', catalogController.getCategoryWithConfig);

// --- ОБНОВЛЕНИЕ (для бота) ---
router.put('/catalog/categories/:id', catalogController.updateCategory);
router.put('/catalog/options/:id', catalogController.updateOption);

module.exports = router;