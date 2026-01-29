const express = require('express');
const createDoctorRoutes = require('./doctorRoutes');
const createSlotRoutes = require('./slotRoutes');
const createTokenRoutes = require('./tokenRoutes');

const createRoutes = (controllers) => {
  const router = express.Router();
  
  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'OPD Token Allocation Engine is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // API routes
  router.use('/doctors', createDoctorRoutes(controllers.doctorController));
  router.use('/slots', createSlotRoutes(controllers.slotController));
  router.use('/tokens', createTokenRoutes(controllers.tokenController));

  return router;
};

module.exports = createRoutes;