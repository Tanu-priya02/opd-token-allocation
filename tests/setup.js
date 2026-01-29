// Test setup file
const logger = require('../src/utils/logger');

// Suppress logs during testing
logger.transports.forEach((t) => (t.silent = true));