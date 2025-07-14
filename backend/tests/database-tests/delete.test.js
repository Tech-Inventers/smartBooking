// Import assertion library
const { expect } = require('chai');

// Import Sequelize model and shared user helpers
const { User } = require('../../src/models');
const { createSharedUser, resetSharedUser } = require('./shared-user');

// Load database setup hooks (sync and teardown)
require('./setup.test');

// Define the Delete test suite
describe('Delete Test', function () {
  this.timeout(10000); // Allow extra time for async DB operations

  it('should delete the shared user', async () => {
    // Ensure shared user exists or is created
    const user = await createSharedUser();

    // Delete the user by ID
    await User.destroy({ where: { id: user.id } });

    // Verify the user no longer exists in the DB
    const deletedUser = await User.findByPk(user.id);
    expect(deletedUser).to.be.null;

    // Log deletion confirmation
    console.log(`🗑️ Deleted: Name = ${user.name}, Email = ${user.email}`);

    // Reset shared user cache so it can be re-created in future tests
    resetSharedUser();
  });
});

