const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/db");
 
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false,
  }
);
 
// Import models and initialize them with sequelize
const User = require("./user")(sequelize, DataTypes);
 
// Export sequelize and models
module.exports = {
  sequelize,
  Sequelize,
  User,
};