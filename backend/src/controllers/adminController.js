const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { email, password, role, first_name, last_name, room_number, phone_number } = req.body;
        
        const hashedPwd = await bcrypt.hash(password, 10);
        const userRes = await client.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
            [email, hashedPwd, role]
        );
        const userId = userRes.rows[0].id;
        
        if (role === 'resident') {
            await client.query(
                'INSERT INTO customers (user_id, first_name, last_name, room_number, phone_number) VALUES ($1, $2, $3, $4, $5)',
                [userId, first_name, last_name, room_number, phone_number]
            );
        } else if (role === 'staff') {
            await client.query(
                'INSERT INTO staff (user_id, first_name, last_name, phone_number) VALUES ($1, $2, $3, $4)',
                [userId, first_name, last_name, phone_number]
            );
        } else if (role === 'admin') {
            await client.query(
                'INSERT INTO administrators (user_id, first_name, last_name) VALUES ($1, $2, $3)',
                [userId, first_name, last_name]
            );
        }
        
        await client.query('COMMIT');
        res.status(201).json({ message: 'User created successfully', userId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

exports.getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        let queryStr = 'SELECT id, email, role, created_at FROM users';
        let params = [];
        if (role) {
            queryStr += ' WHERE role = $1';
            params.push(role);
        }
        const users = await pool.query(queryStr, params);
        res.json(users.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCharges = async (req, res) => {
    try {
        const charges = await pool.query('SELECT * FROM charge');
        res.json(charges.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCharge = async (req, res) => {
    try {
        const { type } = req.params;
        const { rate_per_item } = req.body;
        
        const chargeRes = await pool.query(
            'INSERT INTO charge (laundry_type, rate_per_item) VALUES ($1, $2) ON CONFLICT (laundry_type) DO UPDATE SET rate_per_item = EXCLUDED.rate_per_item RETURNING *',
            [type, rate_per_item]
        );
        res.json(chargeRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCharge = async (req, res) => {
    const client = await pool.connect();
    try {
        const { type } = req.params;
        await client.query('BEGIN');
        // Delete delivery details for orders with this laundry type
        await client.query(
            'DELETE FROM delivery_details WHERE order_id IN (SELECT id FROM orders WHERE laundry_type = $1)', [type]
        );
        // Delete orders with this laundry type
        await client.query('DELETE FROM orders WHERE laundry_type = $1', [type]);
        // Delete the charge itself
        await client.query('DELETE FROM charge WHERE laundry_type = $1', [type]);
        await client.query('COMMIT');
        res.json({ message: 'Charge deleted' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

exports.getRevenueReport = async (req, res) => {
    try {
        const rev = await pool.query("SELECT SUM(total_charge) as total_revenue, COUNT(id) as total_orders FROM orders WHERE payment_status = 'Paid'");
        res.json(rev.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOrderHistory = async (req, res) => {
    try {
        const history = await pool.query(`
            SELECT o.*, c.first_name, c.last_name 
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            ORDER BY o.created_at DESC
        `);
        res.json(history.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');
        // Get customer id if user is a resident
        const custRes = await client.query('SELECT id FROM customers WHERE user_id = $1', [id]);
        if (custRes.rows.length > 0) {
            const custId = custRes.rows[0].id;
            // Delete delivery details for this customer's orders
            await client.query(
                'DELETE FROM delivery_details WHERE order_id IN (SELECT id FROM orders WHERE customer_id = $1)', [custId]
            );
            // Delete orders for this customer
            await client.query('DELETE FROM orders WHERE customer_id = $1', [custId]);
        }
        // Get staff id if user is staff
        const staffRes = await client.query('SELECT id FROM staff WHERE user_id = $1', [id]);
        if (staffRes.rows.length > 0) {
            const staffId = staffRes.rows[0].id;
            // Nullify staff references in delivery details
            await client.query('UPDATE delivery_details SET staff_id = NULL WHERE staff_id = $1', [staffId]);
        }
        // Delete the user (cascades to customers/staff/administrators)
        const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'User not found' });
        }
        await client.query('COMMIT');
        res.json({ message: 'User deleted' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

exports.getStaffWorkload = async (req, res) => {
    try {
        const workload = await pool.query(`
            SELECT s.first_name, s.last_name, COUNT(d.id) as deliveries_completed
            FROM staff s
            LEFT JOIN delivery_details d ON s.id = d.staff_id
            GROUP BY s.id
            ORDER BY deliveries_completed DESC
        `);
        res.json(workload.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
