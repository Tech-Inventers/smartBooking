'use strict'; 
const { Model } = require('sequelize'); 
 
module.exports = (sequelize, DataTypes) => { 
 class Booking extends Model { 
  static associate(models) { 
Booking.belongsTo(models.Patient, {  
        foreignKey: 'patient_id', 
        as: 'patient' 
      }); 
      Booking.belongsTo(models.Provider, {  
        foreignKey: 'provider_id', 
        as: 'provider' 
      }); 
      Booking.belongsTo(models.Service, {  
        foreignKey: 'service_id', 
        as: 'service' 
      }); 
Booking.belongsTo(models.Availability, {  
        foreignKey: 'availability_id', 
        as: 'timeSlot' 
      }); 
      Booking.hasMany(models.Payment, {  
        foreignKey: 'booking_id', 
        as: 'payments' 
      }); 
    } 
  } 
Booking.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    availability_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'scheduled',
      validate: {
        isIn: [['scheduled', 'confirmed', 'completed', 'cancelled']]
      }
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: false
  });
  
  return Booking;
};

