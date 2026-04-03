const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken, authorizeRoles('admin'));

// Users
router.post('/users', adminController.createUser);
router.get('/users', adminController.getUsers);

// Charges
router.get('/charges', adminController.getCharges);
router.put('/charges/:type', adminController.updateCharge);
router.delete('/charges/:type', adminController.deleteCharge);

// Reports
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/orders', adminController.getOrderHistory);
router.get('/reports/workload', adminController.getStaffWorkload);

module.exports = router;
