const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken, authorizeRoles('resident'));

router.get('/charges', residentController.getCharges);
router.post('/orders', residentController.createOrder);
router.get('/orders', residentController.getMyOrders);
router.get('/orders/:id', residentController.getOrderDetails);
router.put('/orders/:id/confirm', residentController.confirmDelivery);

module.exports = router;
