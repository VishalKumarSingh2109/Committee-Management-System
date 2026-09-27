const express = require('express');
const cors = require('cors');
const config = require('./config/config');

const app = express();

// ── Core middleware ──────────────────────────────────────────
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Committee Management API is running' });
});

// ── Public club info (name + UPI ID for the QR payment page) ──
app.get('/api/club', (req, res) => {
  res.json({ success: true, data: config.club });
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/statistics', require('./routes/statisticsRoutes'));
// app.use('/api/statistics', require('./routes/statisticsRoutes')); // Stage 7

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Centralized error handler ───────────────────────────────
// Catches anything that slips past individual controllers — most notably
// malformed JSON bodies, which express.json() throws before any route runs.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON.' });
  }

  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
