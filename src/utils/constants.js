const PRIORITY_LEVELS = {
  PAID: 1,
  EMERGENCY: 2,
  FOLLOW_UP: 3,
  ONLINE: 4,
  WALK_IN: 5
};

const TOKEN_STATUS = {
  BOOKED: 'booked',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show'
};

const ERROR_MESSAGES = {
  DOCTOR_NOT_FOUND: 'Doctor not found',
  DOCTOR_ALREADY_EXISTS: 'Doctor already exists',
  SLOT_NOT_FOUND: 'Slot not found',
  TOKEN_NOT_FOUND: 'Token not found',
  DUPLICATE_BOOKING: 'Duplicate booking not allowed',
  INVALID_PRIORITY: 'Invalid priority level',
  SLOT_FULL: 'Slot is full, added to waiting list'
};

module.exports = {
  PRIORITY_LEVELS,
  TOKEN_STATUS,
  ERROR_MESSAGES
};