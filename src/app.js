const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const logger = require('./utils/logger');
const globalErrorHandler = require('./middleware/errorHandler');
const createRoutes = require('./routes');

// Controllers
const DoctorController = require('./controllers/doctorController');
const SlotController = require('./controllers/slotController');
const TokenController = require('./controllers/tokenController');
const TokenAllocationEngine = require('./services/tokenAllocationEngine');

const createApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/', limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    next();
  });

  // Initialize services and controllers
  const tokenEngine = new TokenAllocationEngine();
  const doctorController = new DoctorController();
  const slotController = new SlotController(doctorController, tokenEngine);
  const tokenController = new TokenController(tokenEngine);

  const controllers = {
    doctorController,
    slotController,
    tokenController
  };

  // Routes
  app.use('/api/v1', createRoutes(controllers));

  // Handle undefined routes
  app.all('*', (req, res, next) => {
    res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server!`
    });
  });

  // Global error handling middleware
  app.use(globalErrorHandler);

  return { app, controllers, tokenEngine };
};

module.exports = createApp;