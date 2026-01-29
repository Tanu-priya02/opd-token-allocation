const { Token } = require('../models');
const logger = require('../utils/logger');

class TokenController {
  constructor(tokenEngine) {
    this.tokenEngine = tokenEngine;
  }

  async bookToken(req, res, next) {
    try {
      const { slotId, tokenId, patientId, priority } = req.body;
      const token = new Token(tokenId, patientId, priority);

      const result = this.tokenEngine.bookToken(slotId, token);
      
      const statusCode = result.success ? 200 : 202; // 202 for waiting list
      
      res.status(statusCode).json({
        status: result.success ? 'success' : 'partial_success',
        data: {
          ...result,
          token: {
            id: token.id,
            patientId: token.patientId,
            priority: token.priority,
            status: token.status,
            createdAt: token.createdAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelToken(req, res, next) {
    try {
      const { slotId, tokenId } = req.body;
      const result = this.tokenEngine.cancelToken(slotId, tokenId);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async insertEmergencyToken(req, res, next) {
    try {
      const { slotId, tokenId, patientId } = req.body;
      const token = new Token(tokenId, patientId, 'emergency');

      const result = this.tokenEngine.insertEmergencyToken(slotId, token);

      res.status(200).json({
        status: 'success',
        data: {
          ...result,
          token: {
            id: token.id,
            patientId: token.patientId,
            priority: token.priority,
            status: token.status,
            createdAt: token.createdAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTokenStatus(req, res, next) {
    try {
      const { tokenId } = req.params;
      
      // Search through all slots to find the token
      const allSlots = this.tokenEngine.getAllSlots();
      let tokenInfo = null;
      let slotInfo = null;

      for (const slot of allSlots) {
        const token = slot.getToken(tokenId);
        if (token) {
          tokenInfo = token;
          slotInfo = {
            id: slot.id,
            doctorId: slot.doctorId,
            startTime: slot.startTime,
            endTime: slot.endTime
          };
          break;
        }

        // Check waiting list
        const waitingToken = slot.waitingList.find(t => t.id === tokenId);
        if (waitingToken) {
          tokenInfo = waitingToken;
          slotInfo = {
            id: slot.id,
            doctorId: slot.doctorId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            waitingListPosition: slot.waitingList.indexOf(waitingToken) + 1
          };
          break;
        }
      }

      if (!tokenInfo) {
        return res.status(404).json({
          status: 'fail',
          message: 'Token not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          token: tokenInfo,
          slot: slotInfo
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTokenStatus(req, res, next) {
    try {
      const { tokenId } = req.params;
      const { status } = req.body;
      
      // Find and update token status
      const allSlots = this.tokenEngine.getAllSlots();
      let updated = false;

      for (const slot of allSlots) {
        const token = slot.getToken(tokenId);
        if (token) {
          token.updateStatus(status);
          updated = true;
          logger.info(`Token status updated: ${tokenId}`, { tokenId, status });
          break;
        }
      }

      if (!updated) {
        return res.status(404).json({
          status: 'fail',
          message: 'Token not found'
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Token status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TokenController;