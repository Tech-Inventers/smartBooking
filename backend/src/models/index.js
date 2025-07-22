const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/db");

// Create Sequelize instance with DB credentials
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

// Initialize models
const models = {
  User: require("./user")(sequelize, DataTypes),
  Availability: require("./availability")(sequelize, DataTypes),
  Booking: require("./booking")(sequelize, DataTypes),
};

// Call associate methods for all models that have it 
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});


module.exports = {
  sequelize,
  Sequelize,
  ...models,
};
