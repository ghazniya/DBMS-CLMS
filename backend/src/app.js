const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const residentRoutes = require('./routes/residentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resident', residentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
