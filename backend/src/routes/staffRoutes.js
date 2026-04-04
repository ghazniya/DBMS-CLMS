const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken, authorizeRoles('staff', 'admin'));

router.get('/orders', staffController.getPendingOrders);
router.get('/history', staffController.getAllOrders);
router.post('/orders', staffController.createOrder);
router.put('/orders/:id/status', staffController.updateOrderStatus);
router.put('/orders/:id/payment', staffController.updatePaymentStatus);
router.post('/orders/:id/delivery', staffController.recordDelivery);

router.get('/customers', staffController.getCustomers);
router.post('/customers', staffController.createResident);
router.get('/charges', staffController.getCharges);

module.exports = router;
