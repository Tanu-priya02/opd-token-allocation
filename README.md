# OPD Token Allocation Engine

A robust, production-ready backend service for managing token allocation in hospital outpatient departments (OPD). Built with Node.js, Express, and modern best practices.

## 🚀 Features

- **Optimized Performance**: Uses Maps and efficient data structures for O(1) lookups
- **Priority-Based Allocation**: Smart token allocation with 5-tier priority system
- **Dynamic Reallocation**: Automatic waiting list promotion on cancellations
- **Emergency Handling**: Preemptive emergency token insertion
- **Comprehensive Validation**: Request validation with Joi schemas
- **Security First**: Helmet, CORS, rate limiting, and input sanitization
- **Production Ready**: Structured logging, error handling, and graceful shutdown
- **Developer Friendly**: ESLint, Jest testing setup, and comprehensive documentation

## 🏗️ Architecture

```
src/
├── config/           # Configuration management
├── controllers/      # Request handlers
├── middleware/       # Custom middleware
├── models/          # Data models
├── routes/          # API routes
├── services/        # Business logic
└── utils/           # Utilities and helpers
```

## 📋 Priority System

1. **Paid Priority** (Level 1) - Highest priority
2. **Emergency** (Level 2) - Can preempt lower priorities
3. **Follow-up** (Level 3) - Return patients
4. **Online Booking** (Level 4) - Pre-booked patients
5. **Walk-in** (Level 5) - Lowest priority

## 🛠️ Installation & Setup

### Prerequisites
- Node.js >= 16.0.0
- Yarn package manager

### Quick Start

1. **Clone and install dependencies:**
   ```bash
   yarn install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   yarn dev
   ```

4. **Run simulation:**
   ```bash
   yarn simulation
   ```

## 📚 API Documentation

### Base URL: `http://localhost:3000/api/v1`

### Health Check
```http
GET /health
```

### Doctor Management

#### Create Doctor
```http
POST /doctors
Content-Type: application/json

{
  "name": "Dr. Smith"
}
```

#### Get All Doctors
```http
GET /doctors
```

#### Get Doctor by ID
```http
GET /doctors/{doctorId}
```

### Slot Management

#### Create Slot
```http
POST /slots
Content-Type: application/json

{
  "doctorId": "DOC001",
  "startTime": "9:00",
  "endTime": "10:00",
  "capacity": 5
}
```

#### Get Slot Status
```http
GET /slots/{doctorId}/{time}/status
```

#### Handle Delayed Slot
```http
POST /slots/{slotId}/delay
Content-Type: application/json

{
  "delayMinutes": 30
}
```

### Token Management

#### Book Token
```http
POST /tokens/book
Content-Type: application/json

{
  "slotId": "DOC001-9",
  "patientId": "P001",
  "priority": "online"
}
```

#### Cancel Token
```http
POST /tokens/cancel
Content-Type: application/json

{
  "slotId": "DOC001-9",
  "tokenId": "T001"
}
```

#### Emergency Token
```http
POST /tokens/emergency
Content-Type: application/json

{
  "slotId": "DOC001-9",
  "patientId": "P999"
}
```

#### Get Token Status
```http
GET /tokens/{tokenId}/status
```

## 🧪 Testing & Development

### Available Scripts

```bash
# Development
yarn dev              # Start with nodemon
yarn start           # Production start

# Testing
yarn test            # Run Jest tests
yarn lint            # ESLint check
yarn lint:fix        # Fix ESLint issues

# Simulation
yarn simulation      # Run OPD simulation
```

### Running Tests
```bash
yarn test
```

### Code Quality
```bash
yarn lint
yarn lint:fix
```

## 🔧 Configuration

### Environment Variables

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Joi schema validation
- **Error Handling**: Structured error responses

## 📊 Performance Optimizations

- **Map Data Structures**: O(1) lookup time for doctors, slots, and tokens
- **Priority Queues**: Efficient waiting list management
- **Memory Management**: Optimized object creation and cleanup
- **Request Validation**: Early validation to prevent processing invalid requests

## 🚦 Error Handling

The system uses structured error handling with custom error classes:

- `ValidationError` (400): Invalid request data
- `NotFoundError` (404): Resource not found
- `ConflictError` (409): Duplicate or conflicting operations
- `AppError`: Base error class for operational errors

## 📝 Logging

Comprehensive logging with Winston:
- **Development**: Console output with colors
- **Production**: File-based logging (error.log, combined.log)
- **Structured**: JSON format with metadata

## 🔄 Migration from Old Code

The refactored version addresses these issues from the original code:

1. ✅ **Performance**: Maps instead of arrays for O(1) lookups
2. ✅ **Security**: Added helmet, CORS, rate limiting
3. ✅ **Validation**: Comprehensive input validation
4. ✅ **Error Handling**: Structured error responses
5. ✅ **Logging**: Production-ready logging system
6. ✅ **Code Structure**: Proper separation of concerns
7. ✅ **Priority System**: Fixed string-based priority comparison
8. ✅ **Package Management**: Yarn with proper dependency management
9. ✅ **Testing**: Jest setup with coverage
10. ✅ **Code Quality**: ESLint configuration

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure proper log levels
3. Set up process manager (PM2 recommended)
4. Configure reverse proxy (Nginx)
5. Set up monitoring and health checks

### Recommended PM2 Configuration
```json
{
  "name": "opd-token-engine",
  "script": "src/server.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.