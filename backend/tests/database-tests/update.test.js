// Import assertion library
const { expect } = require('chai');

// Import Sequelize User model and shared user creator
const { User } = require('../../src/models');
const { createSharedUser } = require('./shared-user');

// Load DB setup hooks (sync schema and teardown)
require('./setup.test');

// Define the Update test suite
describe('Update Test', function () {
  this.timeout(10000); // Extend timeout for potential DB latency

  it('should update the user name', async () => {
    // Ensure the shared user exists or create them
    const user = await createSharedUser();

    // Generate a new name by prefixing the existing one
    const newName = 'Updated_' + user.name;

    // Perform the update on the shared user
    await User.update({ name: newName }, { where: { id: user.id } });

    // Fetch the updated user to verify the change
    const updated = await User.findByPk(user.id);

    // Confirm the name update was successful
    expect(updated.name).to.equal(newName);

    // Log both old and new name for context
    console.log(`✏️ Updated: Old Name = ${user.name}, New Name = ${updated.name}`);
  });
});
