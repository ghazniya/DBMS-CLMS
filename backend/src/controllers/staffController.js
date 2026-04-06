const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await pool.query(
            "SELECT o.*, c.first_name, c.last_name, c.room_number FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.order_status IN ('Pending', 'In Progress', 'Ready') ORDER BY o.created_at ASC"
        );
        res.json(orders.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        
        if (!['Pending', 'In Progress', 'Ready', 'Delivered'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        const updateRes = await pool.query(
            'UPDATE orders SET order_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, orderId]
        );
        
        if (updateRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        
        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.recordDelivery = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { notes } = req.body;
        const userId = req.user.id;
        
        const staffRes = await pool.query('SELECT id FROM staff WHERE user_id = $1', [userId]);
        if (staffRes.rows.length === 0) return res.status(403).json({ message: 'Not a staff member' });
        const staffId = staffRes.rows[0].id;
        
        const orderRes = await pool.query('SELECT order_status FROM orders WHERE id = $1', [orderId]);
        if (orderRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        
        // Record delivery (upsert in case of retry)
        await pool.query(
            'INSERT INTO delivery_details (order_id, staff_id, delivery_time, status, notes) VALUES ($1, $2, NOW(), $3, $4) ON CONFLICT (order_id) DO UPDATE SET staff_id = $2, delivery_time = NOW(), status = $3, notes = $4',
            [orderId, staffId, 'Completed', notes]
        );
        
        // Update order status
        const updateRes = await pool.query(
            "UPDATE orders SET order_status = 'Delivered', updated_at = NOW() WHERE id = $1 RETURNING *",
            [orderId]
        );
        
        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCustomers = async (req, res) => {
    try {
        const customers = await pool.query('SELECT id, first_name, last_name, room_number FROM customers ORDER BY first_name ASC');
        res.json(customers.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCharges = async (req, res) => {
    try {
        const charges = await pool.query('SELECT * FROM charge');
        res.json(charges.rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { customer_id, laundry_type, no_of_items, notes } = req.body;
        
        const chargeRes = await pool.query('SELECT rate_per_item FROM charge WHERE laundry_type = $1', [laundry_type]);
        if (chargeRes.rows.length === 0) return res.status(400).json({ message: 'Invalid laundry type' });
        const rate = chargeRes.rows[0].rate_per_item;
        
        const total = rate * no_of_items;
        const newOrder = await pool.query(
            'INSERT INTO orders (customer_id, laundry_type, no_of_items, notes, total_charge) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [customer_id, laundry_type, no_of_items, notes, total]
        );
        res.status(201).json(newOrder.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createResident = async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password, first_name, last_name, room_number, phone_number } = req.body;
        
        await client.query('BEGIN');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        const userRes = await client.query(
            "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'resident') RETURNING id, email, role",
            [email, hash]
        );
        const userId = userRes.rows[0].id;
        
        await client.query(
            'INSERT INTO customers (user_id, first_name, last_name, room_number, phone_number) VALUES ($1, $2, $3, $4, $5)',
            [userId, first_name, last_name, room_number, phone_number]
        );
        
        await client.query('COMMIT');
        res.status(201).json({ message: 'Resident created successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        if (err.code === '23505') return res.status(400).json({ message: 'Email already exists' });
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { payment_status } = req.body;
        
        if (!['Paid', 'Unpaid'].includes(payment_status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }
        
        const updateRes = await pool.query(
            'UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [payment_status, orderId]
        );
        
        if (updateRes.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        
        res.json(updateRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');
        await client.query('DELETE FROM delivery_details WHERE order_id = $1', [id]);
        const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Order not found' });
        }
        await client.query('COMMIT');
        res.json({ message: 'Order deleted' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await pool.query(
            "SELECT o.*, c.first_name, c.last_name, c.room_number FROM orders o JOIN customers c ON o.customer_id = c.id ORDER BY o.created_at DESC"
        );
        res.json(orders.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
