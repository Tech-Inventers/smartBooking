// Import the User model from your Sequelize setup
const { User } = require('../../src/models');
 
// Store the shared user instance in memory
let sharedUser = null;
 
// Create the shared test user if it hasn't been created yet
const createSharedUser = async () => {
  if (!sharedUser) {
    sharedUser = await User.create({
      name: 'CRUDTester',                // Default test name
      email: 'cruduser@test.com',        // Shared test email
      password: 'password123',           // Plain test password (not hashed here)
      role: 'user',                      // Default role assignment
    });
    console.log(`Shared User Created: ${sharedUser.email}`);
  }
  return sharedUser; // Return the cached instance
};
 
// Reset the shared user instance (for cleanup or re-creation)
const resetSharedUser = () => {
  sharedUser = null;
};
 
// Export shared user helpers for use across tests
module.exports = {
  createSharedUser,
  resetSharedUser,
};

 