const db = require("../../src/models");
const { Op } = require("sequelize");


// Create a new booking
const createBooking = async (req, res) => {
  try {
    const { staffId, date, startTime, endTime, notes } = req.body;
    
    // Validate input
    if (!staffId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check staff exists and is approved provider
    const staff = await db.User.findOne({
      where: { 
        id: staffId,
        role: "provider",
        isApproved: true 
      }
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found or not approved" });
    }

    // Check availability
    const isAvailable = await db.Availability.findOne({
      where: {
        staffId,
        date,
        startTime: { [Op.lte]: startTime },
        endTime: { [Op.gte]: endTime },
        isAvailable: true
      }
    });

    if (!isAvailable) {
      return res.status(400).json({ message: "Staff is not available at this time" });
    }

    // Check for conflicting bookings
    const conflict = await db.Booking.findOne({
      where: {
        staffId,
        date,
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    // Create booking record
    const booking = await db.Booking.create({
      patientId: req.user.id,
      staffId,
      date,
      startTime,
      endTime,
      notes,
      status: "scheduled"
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: err.message });
  }
};


// Fetch bookings for provider or patient
const getBookings = async (req, res) => {
  try {
    const where = {};
    
    // Filter bookings by user role
    if (req.user.role === "provider") {
      where.staffId = req.user.id;
    } else if (req.user.role === "user") {
      where.patientId = req.user.id;
    }

    // Retrieve bookings with related user details
    const bookings = await db.Booking.findAll({
      where,
      include: [
        {
          model: db.User,
          as: "patient",
          attributes: ["id", "email"]
        },
        {
          model: db.User,
          as: "staff",
          attributes: ["id", "email"]
        }
      ],
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createBooking,
  getBookings
};