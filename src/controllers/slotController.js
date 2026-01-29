const { Slot } = require('../models');
const { NotFoundError } = require('../utils/errors');
const { ERROR_MESSAGES } = require('../utils/constants');
const logger = require('../utils/logger');

class SlotController {
  constructor(doctorController, tokenEngine) {
    this.doctorController = doctorController;
    this.tokenEngine = tokenEngine;
  }

  async createSlot(req, res, next) {
    try {
      const { id, doctorId, startTime, endTime, capacity } = req.body;
      
      const doctor = this.doctorController.getDoctor(doctorId);
      if (!doctor) {
        throw new NotFoundError(ERROR_MESSAGES.DOCTOR_NOT_FOUND);
      }

      const slot = new Slot(id, doctorId, startTime, endTime, capacity);
      doctor.addSlot(slot);
      this.tokenEngine.addSlot(slot);
      
      logger.info(`Slot created: ${slot.id}`, { 
        slotId: slot.id, 
        doctorId, 
        startTime, 
        endTime, 
        capacity 
      });

      res.status(201).json({
        status: 'success',
        message: 'Slot added successfully',
        data: { slot }
      });
    } catch (error) {
      next(error);
    }
  }

  async getSlotStatus(req, res, next) {
    try {
      const { doctorId, time } = req.params;
      
      const doctor = this.doctorController.getDoctor(doctorId);
      if (!doctor) {
        throw new NotFoundError(ERROR_MESSAGES.DOCTOR_NOT_FOUND);
      }

      const slot = doctor.getAllSlots().find(s => s.startTime === time);
      if (!slot) {
        throw new NotFoundError(ERROR_MESSAGES.SLOT_NOT_FOUND);
      }

      const status = this.tokenEngine.getSlotStatus(slot.id);
      
      res.status(200).json({
        status: 'success',
        data: status
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctorSlots(req, res, next) {
    try {
      const { doctorId } = req.params;
      
      const doctor = this.doctorController.getDoctor(doctorId);
      if (!doctor) {
        throw new NotFoundError(ERROR_MESSAGES.DOCTOR_NOT_FOUND);
      }

      const slots = doctor.getAllSlots().map(slot => ({
        ...slot,
        tokensCount: slot.tokens.size,
        waitingListCount: slot.waitingList.length,
        availableCapacity: slot.capacity - slot.tokens.size
      }));

      res.status(200).json({
        status: 'success',
        results: slots.length,
        data: { slots }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSlot(req, res, next) {
    try {
      const { slotId } = req.params;
      const { startTime, endTime, capacity } = req.body;
      
      const slot = this.tokenEngine.getSlot(slotId);
      
      if (startTime) slot.startTime = startTime;
      if (endTime) slot.endTime = endTime;
      if (capacity) slot.capacity = capacity;
      
      logger.info(`Slot updated: ${slotId}`, { slotId, startTime, endTime, capacity });

      res.status(200).json({
        status: 'success',
        message: 'Slot updated successfully',
        data: { slot }
      });
    } catch (error) {
      next(error);
    }
  }

  async handleDelayedSlot(req, res, next) {
    try {
      const { slotId } = req.params;
      const { delayMinutes } = req.body;
      
      const result = this.tokenEngine.handleDelayedSlot(slotId, delayMinutes);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SlotController;