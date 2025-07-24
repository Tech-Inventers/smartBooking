module.exports = (sequelize, DataTypes) => {
  // Define Availability model
  const Availability = sequelize.define("Availability", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
   references: {
  model: 'users', // lowercase table name (Postgres is case-sensitive)
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
    slotDuration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 30
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: "availabilities",
    indexes: [
      {
        unique: true,
        fields: ['staffId', 'date', 'startTime']
      }
    ]
  });

  Availability.associate = (models) => {
    Availability.belongsTo(models.User, {
      foreignKey: "staffId",
      as: "staff"
    });
  };

  return Availability;
};