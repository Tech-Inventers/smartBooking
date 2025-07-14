const { sequelize } = require('../../src/models');
 
before(async function () {
  this.timeout(15000); //  increase to 15 seconds to be safe
  console.log('🔧 Syncing database...');
  await sequelize.sync({ force: true });
  console.log('DB synced.');
});
 
after(async () => {
  await sequelize.close();
});