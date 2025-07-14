// Export a function that defines the User model
module.exports = (sequelize, DataTypes) => {
  // Define the User schema using Sequelize's define method
  const User = sequelize.define('User', {
    // Required name field (string)
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Unique email field with email format validation
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: true },
    },
    // Required password field (string)
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Optional role field with default value
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
    },
  });
 
  // Return the configured model to be registered in Sequelize
  return User;
};