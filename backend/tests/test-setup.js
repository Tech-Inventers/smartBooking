const db = require('../src/models');

before(async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: true });
    console.log('Test DB authenticated and synced');
  } catch (error) {
    console.error('Test DB setup failed:', error);
    process.exit(1);
  }
});

after(async () => {
  try {
    await db.sequelize.close();
    console.log('Database connection closed after tests');
  } catch (error) {
    console.error('Error closing DB connection:', error);
  }
});
