require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { supabase } = require('./config/supabase');
const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const companiesRoutes = require('./routes/companies');
const contactsRoutes = require('./routes/contacts');
const dealsRoutes = require('./routes/deals');
const activitiesRoutes = require('./routes/activities');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Keep-alive interval to prevent Supabase from pausing (every 5 minutes)
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
let keepAliveInterval;

const startKeepAlive = () => {
  keepAliveInterval = setInterval(async () => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        console.error('[Keep-Alive] DB ping failed:', error.message);
      } else {
        console.log('[Keep-Alive] DB ping successful:', new Date().toISOString());
      }
    } catch (err) {
      console.error('[Keep-Alive] Error:', err.message);
    }
  }, KEEP_ALIVE_INTERVAL);
  
  console.log(`[Keep-Alive] Started - pinging DB every ${KEEP_ALIVE_INTERVAL / 60000} minutes`);
};

const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    console.log('[Keep-Alive] Stopped');
  }
};

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable for development
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/v1/leads', authenticate, leadsRoutes);
app.use('/api/v1/companies', authenticate, companiesRoutes);
app.use('/api/v1/contacts', authenticate, contactsRoutes);
app.use('/api/v1/deals', authenticate, dealsRoutes);
app.use('/api/v1/activities', authenticate, activitiesRoutes);
app.use('/api/v1/analytics', authenticate, analyticsRoutes);
app.use('/api/v1/ai', authenticate, aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  // Start keep-alive after server starts
  startKeepAlive();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  stopKeepAlive();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  stopKeepAlive();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, startKeepAlive, stopKeepAlive };