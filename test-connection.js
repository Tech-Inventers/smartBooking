require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: process.env.DATABASE_URL,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT version()');
    console.log('PostgreSQL Version:', results[0].version);
    
    // Test table creation
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Test table created successfully');
    
    // Insert test data
    await sequelize.query(`
      INSERT INTO test_table (name) VALUES ('Test Record')
    `);
    console.log('Test data inserted');
    
    // Query test data
    const [testData] = await sequelize.query('SELECT * FROM test_table LIMIT 1');
    console.log('Test data retrieved:', testData[0]);
    
    // Clean up
    await sequelize.query('DROP TABLE test_table');
    console.log('Test table cleaned up');
    
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  } finally {
    await sequelize.close();
    console.log('Connection closed');
  }
}

testConnection();
 
