const pool = require('./src/config/db');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  try {
    const check = await pool.query("SELECT * FROM users WHERE email = 'admin@hlms.com'");
    if (check.rows.length > 0) {
      console.log('Admin already exists.');
      process.exit(0);
    }
    const hash = await bcrypt.hash('admin123', 10);
    const res = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('admin@hlms.com', $1, 'admin') RETURNING id",
      [hash]
    );
    const userId = res.rows[0].id;
    await pool.query(
      "INSERT INTO administrators (user_id, first_name, last_name) VALUES ($1, 'System', 'Admin')",
      [userId]
    );
    console.log('Successfully created admin user (admin@hlms.com / admin123)');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
