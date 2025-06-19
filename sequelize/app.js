require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, User, Patient, Booking } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Sync models (creates tables if they don't exist)
    // await sequelize.sync({ alter: true }); // Use only in development
    
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Healthcare System API', 
    status: 'running',
    database: 'PostgreSQL (Online)'
  });
});

// Test database route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await sequelize.query('SELECT NOW() as current_time, version() as db_version');
    res.json({
      success: true,
      data: result[0][0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt'] // Exclude password
    });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const user = await User.create({
      email,
      password, // In production, hash this password
      role
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get patient bookings
app.get('/api/patients/:id/bookings', async (req, res) => {
  try {
    const patientId = req.params.id;
    
    const bookings = await Booking.findAll({
      where: { patient_id: patientId },
      include: [
        { model: Patient, as: 'patient' },
        { model: Provider, as: 'provider' }
      ]
    });
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  initDatabase();
});
 
