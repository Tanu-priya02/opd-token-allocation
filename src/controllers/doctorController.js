const { Doctor } = require('../models');
const { ConflictError, NotFoundError } = require('../utils/errors');
const { ERROR_MESSAGES } = require('../utils/constants');
const logger = require('../utils/logger');

class DoctorController {
  constructor() {
    this.doctors = new Map(); // Use Map for O(1) lookup
  }

  async createDoctor(req, res, next) {
    try {
      const { id, name } = req.body;
      
      if (id && this.doctors.has(id)) {
        throw new ConflictError(ERROR_MESSAGES.DOCTOR_ALREADY_EXISTS);
      }

      const doctor = new Doctor(id, name);
      this.doctors.set(doctor.id, doctor);
      
      logger.info(`Doctor created: ${doctor.id}`, { doctorId: doctor.id, name });
      
      res.status(201).json({
        status: 'success',
        message: 'Doctor added successfully',
        data: {
          doctor: {
            id: doctor.id,
            name: doctor.name,
            createdAt: doctor.createdAt,
            slotsCount: doctor.slots.size
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctors(req, res, next) {
    try {
      const doctors = Array.from(this.doctors.values()).map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        createdAt: doctor.createdAt,
        slotsCount: doctor.slots.size
      }));

      res.status(200).json({
        status: 'success',
        results: doctors.length,
        data: { doctors }
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      const doctor = this.doctors.get(doctorId);
      
      if (!doctor) {
        throw new NotFoundError(ERROR_MESSAGES.DOCTOR_NOT_FOUND);
      }

      res.status(200).json({
        status: 'success',
        data: {
          doctor: {
            id: doctor.id,
            name: doctor.name,
            createdAt: doctor.createdAt,
            slots: doctor.getAllSlots()
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { name } = req.body;
      
      const doctor = this.doctors.get(doctorId);
      if (!doctor) {
        throw new NotFoundError(ERROR_MESSAGES.DOCTOR_NOT_FOUND);
      }

      doctor.name = name;
      logger.info(`Doctor updated: ${doctorId}`, { doctorId, name });

      res.status(200).json({
        status: 'success',
        message: 'Doctor updated successfully',
        data: { doctor }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      
      if (!this.doctors.has(doctorId)) {
        throw new NotFoundError(ERROR_MESSAGES.DOCTOR_NOT_FOUND);
      }

      this.doctors.delete(doctorId);
      logger.info(`Doctor deleted: ${doctorId}`, { doctorId });

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  getDoctor(doctorId) {
    return this.doctors.get(doctorId);
  }
}

module.exports = DoctorController;