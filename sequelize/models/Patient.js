'use strict'; 
const { Model } = require('sequelize'); 
 
module.exports = (sequelize, DataTypes) => { 
  class Patient extends Model { 
    static associate(models) { 
      Patient.belongsTo(models.User, {  
        foreignKey: 'user_id', 
        as: 'user' 
      }); 
      Patient.hasMany(models.Booking, {  
        foreignKey: 'patient_id', 
        as: 'bookings' 
      }); 
      Patient.hasMany(models.Prescription, {  
        foreignKey: 'patient_id', 
        as: 'prescriptions' 
      }); 
    } 
  } 
   
  Patient.init({ 
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    }, 
    user_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      references: { 
        model: 'users', 
        key: 'id' 
      } 
    }, 
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    }, 
    phone: { 
      type: DataTypes.STRING, 
      validate: { 
        len: [10, 15] 
      } 
    }, 
    dob: { 
      type: DataTypes.DATE 
    } 
  }, { 
    sequelize, 
    modelName: 'Patient', 
    tableName: 'patients', 
    timestamps: false 
  }); 
   
  return Patient; 
}; 
  