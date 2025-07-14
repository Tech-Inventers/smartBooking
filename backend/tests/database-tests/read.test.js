// Import assertion library
const { expect } = require('chai');
 
// Import User model and shared user helper
const { User } = require('../../src/models');
const { createSharedUser } = require('./shared-user');
 
// Load DB setup hooks (schema sync + teardown)
require('./setup.test');
 
// Define the Read test suite
describe('Read Test', function () {
  this.timeout(10000); // Increase timeout to ensure stable DB ops
 
  it('should read the shared user', async () => {
    // Ensure the shared user exists or is created
    const user = await createSharedUser();
 
    // Look up the user by ID in the database
    const found = await User.findByPk(user.id);
 
    // Validate retrieved user matches expected shared user
    expect(found).to.exist;
    expect(found.name).to.equal(user.name);
    expect(found.email).to.equal(user.email);
 
    // Log confirmation for visibility
    console.log(`📖 Read: Name = ${found.name}, Email = ${found.email}`);
  });
});