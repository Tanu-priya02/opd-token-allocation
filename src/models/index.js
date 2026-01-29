const { v4: uuidv4 } = require('uuid');
const { PRIORITY_LEVELS, TOKEN_STATUS } = require('../utils/constants');

class Doctor {
  constructor(id, name) {
    this.id = id || uuidv4();
    this.name = name;
    this.slots = new Map(); // Use Map for O(1) lookup
    this.createdAt = new Date();
  }

  addSlot(slot) {
    this.slots.set(slot.id, slot);
  }

  removeSlot(slotId) {
    return this.slots.delete(slotId);
  }

  getSlot(slotId) {
    return this.slots.get(slotId);
  }

  getAllSlots() {
    return Array.from(this.slots.values());
  }
}

class Slot {
  constructor(id, doctorId, startTime, endTime, capacity) {
    this.id = id || uuidv4();
    this.doctorId = doctorId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.capacity = capacity;
    this.tokens = new Map(); // Use Map for O(1) lookup
    this.waitingList = []; // Priority queue for waiting list
    this.createdAt = new Date();
  }

  addToken(token) {
    this.tokens.set(token.id, token);
  }

  removeToken(tokenId) {
    return this.tokens.delete(tokenId);
  }

  getToken(tokenId) {
    return this.tokens.get(tokenId);
  }

  getAllTokens() {
    return Array.from(this.tokens.values());
  }

  hasCapacity() {
    return this.tokens.size < this.capacity;
  }

  addToWaitingList(token) {
    // Insert token in priority order
    const insertIndex = this.waitingList.findIndex(
      waitingToken => PRIORITY_LEVELS[token.priority.toUpperCase()] < PRIORITY_LEVELS[waitingToken.priority.toUpperCase()]
    );
    
    if (insertIndex === -1) {
      this.waitingList.push(token);
    } else {
      this.waitingList.splice(insertIndex, 0, token);
    }
  }

  removeFromWaitingList(tokenId) {
    const index = this.waitingList.findIndex(token => token.id === tokenId);
    if (index !== -1) {
      return this.waitingList.splice(index, 1)[0];
    }
    return null;
  }

  getNextFromWaitingList() {
    return this.waitingList.shift();
  }
}

class Token {
  constructor(id, patientId, priority, status = TOKEN_STATUS.BOOKED) {
    this.id = id || uuidv4();
    this.patientId = patientId;
    this.priority = priority.toLowerCase();
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  getPriorityLevel() {
    return PRIORITY_LEVELS[this.priority.toUpperCase()] || PRIORITY_LEVELS.WALK_IN;
  }
}

class PatientQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(patient) {
    this.queue.push(patient);
  }

  dequeue() {
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  size() {
    return this.queue.length;
  }
}

module.exports = { Doctor, Slot, Token, PatientQueue };