const db = require("../../src/models");
const { Op } = require("sequelize");

const addAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, slotDuration } = req.body;
    
    // Validate input
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: "Date, start time, and end time are required" });
    }

    // Check for overlapping availabilities
    const existing = await db.Availability.findOne({
      where: {
        staffId: req.user.id,
        date,
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ message: "This time slot overlaps with existing availability" });
    }

    const availability = await db.Availability.create({
      staffId: req.user.id,
      date,
      startTime,
      endTime,
      slotDuration: slotDuration || 30
    });

    res.status(201).json(availability);
  } catch (err) {
    console.error("Add availability error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { staffId, date } = req.query;
    
    const where = {};
    if (staffId) where.staffId = staffId;
    if (date) where.date = date;

    const availability = await db.Availability.findAll({
      where,
      include: [{
        model: db.User,
        as: "staff",
        attributes: ["id", "email", "role"],
        where: { role: "provider", isApproved: true }
      }]
    });

    res.status(200).json(availability);
  } catch (err) {
    console.error("Get availability error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addAvailability,
  getAvailability
};