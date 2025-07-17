const bcrypt = require("bcryptjs");
 
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "provider", "admin"),
      defaultValue: "user",
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    proof: {
      type: DataTypes.STRING, // Future usage (For now optional)
      allowNull: true,
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        // Auto-approve admins
        if (user.role === 'admin') {
          user.isApproved = true;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
    tableName: "users",
  });
 
  return User;
};