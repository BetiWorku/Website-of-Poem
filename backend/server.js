const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize the app
const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Load Routes
console.log('📦 LOADING ROUTES...');
const authRoutes = require('./routes/authRoutes');
const poemRoutes = require('./routes/poemRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const contactRoutes = require('./routes/contactRoutes');
console.log('✅ ROUTES LOADED.');

// Detailed Request Logging
app.use((req, res, next) => {
    console.log(`📡 [REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});

// Test API connectivity
app.get('/api/test', (req, res) => res.json({ status: 'API IS ALIVE!' }));

// Test routing
app.get('/api/raw-transactions', (req, res) => res.json({ message: 'Raw Transaction Route Working' }));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/poems', poemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/contact', contactRoutes);

// Static Asset Folder (for direct video streaming)
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Global Error Handler for debugging
app.use((err, req, res, next) => {
    console.error('💥 SERVER ERROR:', err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Poetry Platform API is running...');
});

// Catch-all for 404 (Route Not Found)
app.use((req, res) => {
    console.log(`❌ [404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route ${req.originalUrl} not found on this server.` });
});

// Configure the port and start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 [ANTIGRAVITY-v2] Server started on http://localhost:${PORT}`);
    });
}

// Export app for serverless deployment (Netlify/Vercel)
module.exports = app;
