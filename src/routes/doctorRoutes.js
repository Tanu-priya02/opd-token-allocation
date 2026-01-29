const express = require('express');
const { validateRequest, validateParams, doctorSchema } = require('../middleware/validation');
const Joi = require('joi');

const createDoctorRoutes = (doctorController) => {
  const router = express.Router();

  const doctorParamsSchema = Joi.object({
    doctorId: Joi.string().required()
  });

  const updateDoctorSchema = Joi.object({
    name: Joi.string().min(2).max(100).required()
  });

  router.post('/', validateRequest(doctorSchema), (req, res, next) => {
    doctorController.createDoctor(req, res, next);
  });

  router.get('/', (req, res, next) => {
    doctorController.getDoctors(req, res, next);
  });

  router.get('/:doctorId', validateParams(doctorParamsSchema), (req, res, next) => {
    doctorController.getDoctor(req, res, next);
  });

  router.put('/:doctorId', 
    validateParams(doctorParamsSchema),
    validateRequest(updateDoctorSchema),
    (req, res, next) => {
      doctorController.updateDoctor(req, res, next);
    }
  );

  router.delete('/:doctorId', validateParams(doctorParamsSchema), (req, res, next) => {
    doctorController.deleteDoctor(req, res, next);
  });

  return router;
};

module.exports = createDoctorRoutes;