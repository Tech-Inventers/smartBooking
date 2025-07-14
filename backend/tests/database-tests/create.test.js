// Import assertion library
const { expect } = require('chai');

// Import shared user creation helper
const { createSharedUser } = require('./shared-user');

// Load DB setup hooks (sync + teardown)
require('./setup.test');

// Create Test Suite
describe('Create Test', function () {
  this.timeout(10000); // Extend timeout to avoid race conditions during DB operations

  it('should create the shared user', async () => {
    // Create or fetch the shared test user
    const user = await createSharedUser();

    // Basic existence checks
    expect(user).to.exist;
    expect(user.name).to.exist;
    expect(user.email).to.exist;

    // Log what was created for test visibility
    console.log(`✅ Created: Name = ${user.name}, Email = ${user.email}`);
  });
});
