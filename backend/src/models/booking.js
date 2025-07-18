module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define("Booking", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // ✅ must match tableName in user.js
        key: 'id'
      }
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: "bookings",
    indexes: [
      {
        fields: ['staffId', 'date', 'startTime'],
        unique: true
      }
    ]
  });
 
  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: "patientId",
      as: "patient"
    });
    Booking.belongsTo(models.User, {
      foreignKey: "staffId",
      as: "staff"
    });
  };
 
  return Booking;
};