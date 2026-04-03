CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('resident', 'staff', 'admin')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20)
);

CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20)
);

CREATE TABLE administrators (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL
);

CREATE TABLE charge (
    laundry_type VARCHAR(100) PRIMARY KEY,
    rate_per_item DECIMAL(10, 2) NOT NULL CHECK (rate_per_item >= 0)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    laundry_type VARCHAR(100) REFERENCES charge(laundry_type),
    no_of_items INT NOT NULL CHECK (no_of_items > 0),
    notes TEXT,
    order_status VARCHAR(50) CHECK (order_status IN ('Pending', 'In Progress', 'Ready', 'Delivered')) DEFAULT 'Pending',
    payment_status VARCHAR(50) CHECK (payment_status IN ('Pending', 'Paid', 'Waived')) DEFAULT 'Pending',
    total_charge DECIMAL(10, 2) NOT NULL CHECK (total_charge >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_details (
    id SERIAL PRIMARY KEY,
    order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    staff_id INT REFERENCES staff(id) ON DELETE SET NULL,
    delivery_time TIMESTAMP DEFAULT NULL,
    status VARCHAR(50) CHECK (status IN ('Pending', 'Completed')) DEFAULT 'Completed',
    notes TEXT
);


