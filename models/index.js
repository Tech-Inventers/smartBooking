// Import Sequelize core and data type definitions
const { Sequelize, DataTypes } = require('sequelize');

// Load database config (e.g. connection string)
const config = require('../config/db');

// Initialize Sequelize instance to connect with PostgreSQL
const sequelize = new Sequelize(config.databaseUrl);

// Define and organize all models in a single exportable object
const db = {};

db.sequelize = sequelize;     // Sequelize connection instance
db.Sequelize = Sequelize;     // Sequelize constructor 

// Register the User model
db.User = require('./user')(sequelize, DataTypes);

// Export the db object so other modules can access models and DB connection
module.exports = db;