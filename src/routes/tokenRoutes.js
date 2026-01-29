const express = require('express');
const { 
  validateRequest, 
  validateParams, 
  tokenBookingSchema, 
  tokenCancellationSchema, 
  emergencyTokenSchema 
} = require('../middleware/validation');
const Joi = require('joi');

const createTokenRoutes = (tokenController) => {
  const router = express.Router();

  const tokenParamsSchema = Joi.object({
    tokenId: Joi.string().required()
  });

  const tokenStatusSchema = Joi.object({
    status: Joi.string().valid('booked', 'cancelled', 'completed', 'no_show').required()
  });

  router.post('/book', validateRequest(tokenBookingSchema), (req, res, next) => {
    tokenController.bookToken(req, res, next);
  });

  router.post('/cancel', validateRequest(tokenCancellationSchema), (req, res, next) => {
    tokenController.cancelToken(req, res, next);
  });

  router.post('/emergency', validateRequest(emergencyTokenSchema), (req, res, next) => {
    tokenController.insertEmergencyToken(req, res, next);
  });

  router.get('/:tokenId/status', validateParams(tokenParamsSchema), (req, res, next) => {
    tokenController.getTokenStatus(req, res, next);
  });

  router.put('/:tokenId/status', 
    validateParams(tokenParamsSchema),
    validateRequest(tokenStatusSchema),
    (req, res, next) => {
      tokenController.updateTokenStatus(req, res, next);
    }
  );

  return router;
};

module.exports = createTokenRoutes;