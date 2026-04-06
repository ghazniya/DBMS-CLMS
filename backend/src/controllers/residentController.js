const pool = require('../config/db');

exports.createOrder = async (req, res) => {
    try {
        const { laundry_type, no_of_items, notes } = req.body;
        const userId = req.user.id;
        
        // Get customer id
        const custRes = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userId]);
        if (custRes.rows.length === 0) return res.status(404).json({ message: 'Customer profile not found' });
        const customerId = custRes.rows[0].id;
        
        // Get rate
        const chargeRes = await pool.query('SELECT rate_per_item FROM charge WHERE laundry_type = $1', [laundry_type]);
        if (chargeRes.rows.length === 0) return res.status(400).json({ message: 'Invalid laundry type' });
        const rate = chargeRes.rows[0].rate_per_item;
        
        const total = rate * no_of_items;
        
        const newOrder = await pool.query(
            'INSERT INTO orders (customer_id, laundry_type, no_of_items, notes, total_charge) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [customerId, laundry_type, no_of_items, notes, total]
        );
        
        res.status(201).json(newOrder.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const custRes = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userId]);
        if (custRes.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const customerId = custRes.rows[0].id;
        
        const orders = await pool.query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [customerId]);
        res.json(orders.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        
        // Ensure user owns order
        const custRes = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userId]);
        if (custRes.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const customerId = custRes.rows[0].id;
        
        const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1 AND customer_id = $2', [orderId, customerId]);
        if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        
        res.json(orderRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCharges = async (req, res) => {
    try {
        const charges = await pool.query('SELECT * FROM charge ORDER BY laundry_type ASC');
        res.json(charges.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.confirmDelivery = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        
        const custRes = await pool.query('SELECT id FROM customers WHERE user_id = $1', [userId]);
        const customerId = custRes.rows[0].id;
        
        const orderRes = await pool.query('SELECT order_status FROM orders WHERE id = $1 AND customer_id = $2', [orderId, customerId]);
        if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        
        if (orderRes.rows[0].order_status !== 'Ready') {
            return res.status(400).json({ message: 'Order is not ready for delivery' });
        }
        
        const updateRes = await pool.query(
            'UPDATE orders SET order_status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            ['Delivered', 'Paid', orderId]
        );
        
        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
