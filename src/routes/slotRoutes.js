const express = require('express');
const { validateRequest, validateParams, slotSchema, slotParamsSchema } = require('../middleware/validation');
const Joi = require('joi');

const createSlotRoutes = (slotController) => {
  const router = express.Router();

  const slotIdParamsSchema = Joi.object({
    slotId: Joi.string().required()
  });

  const doctorIdParamsSchema = Joi.object({
    doctorId: Joi.string().required()
  });

  const delaySchema = Joi.object({
    delayMinutes: Joi.number().integer().min(1).max(480).required() // Max 8 hours delay
  });

  const updateSlotSchema = Joi.object({
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    capacity: Joi.number().integer().min(1).max(50).optional()
  });

  router.post('/', validateRequest(slotSchema), (req, res, next) => {
    slotController.createSlot(req, res, next);
  });

  router.get('/doctor/:doctorId', validateParams(doctorIdParamsSchema), (req, res, next) => {
    slotController.getDoctorSlots(req, res, next);
  });

  router.get('/:doctorId/:time/status', validateParams(slotParamsSchema), (req, res, next) => {
    slotController.getSlotStatus(req, res, next);
  });

  router.put('/:slotId', 
    validateParams(slotIdParamsSchema),
    validateRequest(updateSlotSchema),
    (req, res, next) => {
      slotController.updateSlot(req, res, next);
    }
  );

  router.post('/:slotId/delay', 
    validateParams(slotIdParamsSchema),
    validateRequest(delaySchema),
    (req, res, next) => {
      slotController.handleDelayedSlot(req, res, next);
    }
  );

  return router;
};

module.exports = createSlotRoutes;