const Joi = require('joi');
const { ValidationError } = require('../utils/errors');
const { PRIORITY_LEVELS } = require('../utils/constants');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }
    next();
  };
};

// Validation schemas
const doctorSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(2).max(100).required()
});

const slotSchema = Joi.object({
  id: Joi.string().optional(),
  doctorId: Joi.string().required(),
  startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  capacity: Joi.number().integer().min(1).max(50).required()
});

const tokenBookingSchema = Joi.object({
  slotId: Joi.string().required(),
  tokenId: Joi.string().optional(),
  patientId: Joi.string().required(),
  priority: Joi.string().valid(...Object.keys(PRIORITY_LEVELS).map(k => k.toLowerCase())).required()
});

const tokenCancellationSchema = Joi.object({
  slotId: Joi.string().required(),
  tokenId: Joi.string().required()
});

const emergencyTokenSchema = Joi.object({
  slotId: Joi.string().required(),
  tokenId: Joi.string().optional(),
  patientId: Joi.string().required()
});

const slotParamsSchema = Joi.object({
  doctorId: Joi.string().required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
});

module.exports = {
  validateRequest,
  validateParams,
  doctorSchema,
  slotSchema,
  tokenBookingSchema,
  tokenCancellationSchema,
  emergencyTokenSchema,
  slotParamsSchema
};