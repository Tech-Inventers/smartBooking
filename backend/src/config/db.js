 // Load environment variables from .env file
require('dotenv').config();
 
// Destructure database-related variables from process.env
const {
  DB_HOST,       // Hostname of the PostgreSQL server
  DB_PORT,       // Port number (usually 5432 for Postgres)
  DB_NAME,       // Name of the target database
  DB_USER,       // Username used for authentication
  DB_PASSWORD,   // Password for the database user
} = process.env;
 
// Construct a PostgreSQL connection URL using the env variables
const databaseUrl = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
 
// Export the connection URL for use by Sequelize
module.exports = {
  databaseUrl,
};