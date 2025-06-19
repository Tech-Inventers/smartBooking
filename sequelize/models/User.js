'use strict'; 
const { Model } = require('sequelize'); 
 
module.exports = (sequelize, DataTypes) => { 
  class User extends Model { 
    static associate(models) { 
      User.hasOne(models.Patient, {  
        foreignKey: 'user_id', 
        as: 'patientProfile' 
      }); 
      User.hasOne(models.Provider, {  
        foreignKey: 'user_id', 
        as: 'providerProfile' 
      }); 
      User.hasOne(models.Admin, {  
        foreignKey: 'user_id', 
        as: 'adminProfile' 
      }); 
    } 
  } 
   
  User.init({ 
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    }, 
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true, 
      validate: { 
        isEmail: true 
      } 
    }, 
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    }, 
    role: { 
      type: DataTypes.ENUM('patient', 'provider', 'admin'), 
      allowNull: false 
    }, 
    createdAt: { 
      field: 'created_at', 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    } 
  }, { 
    sequelize, 
    modelName: 'User', 
    tableName: 'users', 
    timestamps: false 
  }); 
   
  return User; 
};