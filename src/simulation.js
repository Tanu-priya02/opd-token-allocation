const { Doctor, Slot, Token } = require('./models');
const TokenAllocationEngine = require('./services/tokenAllocationEngine');
const DoctorController = require('./controllers/doctorController');
const logger = require('./utils/logger');

class OPDSimulation {
  constructor() {
    this.tokenEngine = new TokenAllocationEngine();
    this.doctorController = new DoctorController();
  }

  async initializeData() {
    logger.info('Initializing simulation data...');
    
    // Create doctors
    const doctors = [
      { id: 'DOC001', name: 'Dr. Smith' },
      { id: 'DOC002', name: 'Dr. Johnson' },
      { id: 'DOC003', name: 'Dr. Lee' }
    ];

    doctors.forEach(doctorData => {
      const doctor = new Doctor(doctorData.id, doctorData.name);
      this.doctorController.doctors.set(doctor.id, doctor);
      
      // Create slots for each doctor (9 AM to 12 PM)
      for (let hour = 9; hour < 12; hour++) {
        const slot = new Slot(
          `${doctor.id}-${hour}`,
          doctor.id,
          `${hour}:00`,
          `${hour + 1}:00`,
          5
        );
        doctor.addSlot(slot);
        this.tokenEngine.addSlot(slot);
      }
      
      logger.info(`Created doctor: ${doctor.name} with ${doctor.slots.size} slots`);
    });
  }

  async simulateBookings() {
    logger.info('Simulating token bookings...');

    const bookings = [
      { slotId: 'DOC001-9', tokenId: 'T001', patientId: 'P001', priority: 'online' },
      { slotId: 'DOC001-9', tokenId: 'T002', patientId: 'P002', priority: 'walk_in' },
      { slotId: 'DOC001-9', tokenId: 'T003', patientId: 'P003', priority: 'paid' },
      { slotId: 'DOC001-9', tokenId: 'T004', patientId: 'P004', priority: 'follow_up' },
      { slotId: 'DOC001-9', tokenId: 'T005', patientId: 'P005', priority: 'walk_in' },
      { slotId: 'DOC001-9', tokenId: 'T006', patientId: 'P006', priority: 'online' }, // Should go to waiting list
      { slotId: 'DOC001-9', tokenId: 'T007', patientId: 'P007', priority: 'paid' }    // Should go to waiting list
    ];

    for (const booking of bookings) {
      try {
        const token = new Token(booking.tokenId, booking.patientId, booking.priority);
        const result = this.tokenEngine.bookToken(booking.slotId, token);
        logger.info(`Booking result for ${booking.tokenId}:`, result);
      } catch (error) {
        logger.error(`Booking failed for ${booking.tokenId}:`, error.message);
      }
    }
  }

  async simulateCancellations() {
    logger.info('Simulating cancellations...');

    const cancellations = ['T003', 'T001']; // Cancel paid and online tokens
    
    for (const tokenId of cancellations) {
      try {
        const result = this.tokenEngine.cancelToken('DOC001-9', tokenId);
        logger.info(`Cancellation result for ${tokenId}:`, result);
      } catch (error) {
        logger.error(`Cancellation failed for ${tokenId}:`, error.message);
      }
    }
  }

  async simulateEmergency() {
    logger.info('Simulating emergency insertion...');

    try {
      const emergencyToken = new Token('T999', 'P999', 'emergency');
      const result = this.tokenEngine.insertEmergencyToken('DOC001-9', emergencyToken);
      logger.info('Emergency insertion result:', result);
    } catch (error) {
      logger.error('Emergency insertion failed:', error.message);
    }
  }

  async simulateDelayedSlot() {
    logger.info('Simulating delayed slot...');

    try {
      const result = this.tokenEngine.handleDelayedSlot('DOC001-9', 30); // 30 minutes delay
      logger.info('Delayed slot result:', result);
    } catch (error) {
      logger.error('Delayed slot handling failed:', error.message);
    }
  }

  async printFinalStatus() {
    logger.info('Final simulation status:');
    
    try {
      const slotStatus = this.tokenEngine.getSlotStatus('DOC001-9');
      
      console.log('\n=== FINAL SLOT STATUS ===');
      console.log(`Slot ID: ${slotStatus.slotId}`);
      console.log(`Doctor ID: ${slotStatus.doctorId}`);
      console.log(`Capacity: ${slotStatus.capacity}`);
      console.log(`Available Capacity: ${slotStatus.availableCapacity}`);
      
      console.log('\n--- BOOKED TOKENS ---');
      slotStatus.tokens.forEach((token, index) => {
        console.log(`${index + 1}. Token: ${token.id}, Patient: ${token.patientId}, Priority: ${token.priority}, Status: ${token.status}`);
      });
      
      console.log('\n--- WAITING LIST ---');
      slotStatus.waitingList.forEach((token, index) => {
        console.log(`${index + 1}. Token: ${token.id}, Patient: ${token.patientId}, Priority: ${token.priority}, Status: ${token.status}`);
      });
      
      console.log('\n=== SIMULATION COMPLETED ===\n');
      
    } catch (error) {
      logger.error('Failed to get final status:', error.message);
    }
  }

  async run() {
    try {
      logger.info('Starting OPD Token Allocation Simulation...');
      
      await this.initializeData();
      await this.simulateBookings();
      await this.simulateCancellations();
      await this.simulateEmergency();
      await this.simulateDelayedSlot();
      await this.printFinalStatus();
      
      logger.info('Simulation completed successfully!');
    } catch (error) {
      logger.error('Simulation failed:', error);
    }
  }
}

// Run simulation if this file is executed directly
if (require.main === module) {
  const simulation = new OPDSimulation();
  simulation.run();
}

module.exports = OPDSimulation;