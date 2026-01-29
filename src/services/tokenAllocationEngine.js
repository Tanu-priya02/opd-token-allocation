const { Slot, Token } = require('../models');
const { NotFoundError, ConflictError } = require('../utils/errors');
const { ERROR_MESSAGES, PRIORITY_LEVELS, TOKEN_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

class TokenAllocationEngine {
  constructor() {
    this.slots = new Map(); // Use Map for O(1) lookup
  }

  addSlot(slot) {
    this.slots.set(slot.id, slot);
    logger.info(`Slot added: ${slot.id}`, { slotId: slot.id, doctorId: slot.doctorId });
  }

  getSlot(slotId) {
    const slot = this.slots.get(slotId);
    if (!slot) {
      throw new NotFoundError(ERROR_MESSAGES.SLOT_NOT_FOUND);
    }
    return slot;
  }

  bookToken(slotId, token) {
    const slot = this.getSlot(slotId);

    // Check for duplicate booking
    if (slot.getToken(token.id) || slot.waitingList.some(t => t.id === token.id)) {
      throw new ConflictError(ERROR_MESSAGES.DUPLICATE_BOOKING);
    }

    if (slot.hasCapacity()) {
      slot.addToken(token);
      logger.info(`Token booked successfully: ${token.id}`, { 
        tokenId: token.id, 
        slotId: slotId, 
        patientId: token.patientId 
      });
      return { success: true, message: 'Token booked successfully' };
    } else {
      slot.addToWaitingList(token);
      logger.info(`Token added to waiting list: ${token.id}`, { 
        tokenId: token.id, 
        slotId: slotId, 
        waitingListPosition: slot.waitingList.length 
      });
      return { success: false, message: ERROR_MESSAGES.SLOT_FULL };
    }
  }

  cancelToken(slotId, tokenId) {
    const slot = this.getSlot(slotId);

    // Try to remove from booked tokens first
    if (slot.removeToken(tokenId)) {
      // Promote next patient from waiting list
      const nextToken = slot.getNextFromWaitingList();
      if (nextToken) {
        slot.addToken(nextToken);
        logger.info(`Token promoted from waiting list: ${nextToken.id}`, { 
          tokenId: nextToken.id, 
          slotId: slotId 
        });
      }
      
      logger.info(`Token cancelled: ${tokenId}`, { tokenId, slotId });
      return { success: true, message: 'Token cancelled and waiting list updated' };
    }

    // Try to remove from waiting list
    const removedToken = slot.removeFromWaitingList(tokenId);
    if (removedToken) {
      logger.info(`Token cancelled from waiting list: ${tokenId}`, { tokenId, slotId });
      return { success: true, message: 'Token cancelled from waiting list' };
    }

    throw new NotFoundError(ERROR_MESSAGES.TOKEN_NOT_FOUND);
  }

  insertEmergencyToken(slotId, token) {
    const slot = this.getSlot(slotId);
    
    // Set token priority to emergency
    token.priority = 'emergency';

    if (!slot.hasCapacity()) {
      // Find the lowest priority token to preempt
      const tokens = slot.getAllTokens();
      let lowestPriorityToken = null;
      let lowestPriority = 0;

      tokens.forEach(t => {
        const priority = PRIORITY_LEVELS[t.priority.toUpperCase()] || PRIORITY_LEVELS.WALK_IN;
        if (priority > lowestPriority) {
          lowestPriority = priority;
          lowestPriorityToken = t;
        }
      });

      if (lowestPriorityToken && lowestPriority > PRIORITY_LEVELS.EMERGENCY) {
        slot.removeToken(lowestPriorityToken.id);
        slot.addToWaitingList(lowestPriorityToken);
        logger.info(`Token preempted for emergency: ${lowestPriorityToken.id}`, { 
          preemptedTokenId: lowestPriorityToken.id,
          emergencyTokenId: token.id,
          slotId 
        });
      }
    }

    slot.addToken(token);
    logger.info(`Emergency token inserted: ${token.id}`, { 
      tokenId: token.id, 
      slotId: slotId 
    });
    
    return { success: true, message: 'Emergency token inserted' };
  }

  getSlotStatus(slotId) {
    const slot = this.getSlot(slotId);
    
    return {
      slotId: slot.id,
      doctorId: slot.doctorId,
      capacity: slot.capacity,
      tokens: slot.getAllTokens().sort((a, b) => a.getPriorityLevel() - b.getPriorityLevel()),
      waitingList: slot.waitingList,
      availableCapacity: slot.capacity - slot.tokens.size
    };
  }

  handleDelayedSlot(slotId, delayMinutes) {
    const slot = this.getSlot(slotId);
    
    // Parse time and add delay
    const [hours, minutes] = slot.endTime.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + delayMinutes, 0, 0);
    
    slot.endTime = `${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
    logger.info(`Slot timing extended: ${slotId}`, { 
      slotId, 
      delayMinutes, 
      newEndTime: slot.endTime 
    });
    
    return { 
      success: true, 
      message: `Slot timing extended by ${delayMinutes} minutes`,
      newEndTime: slot.endTime
    };
  }

  getAllSlots() {
    return Array.from(this.slots.values());
  }

  getSlotsByDoctor(doctorId) {
    return this.getAllSlots().filter(slot => slot.doctorId === doctorId);
  }
}

module.exports = TokenAllocationEngine;