const express = require("express");
const router = express.Router();
const authenticate = require("../../src/middleware/authenticate");
const bookingController = require("../controllers/booking.controller");

router.use(authenticate); // Apply authentication to all booking routes

// Create a booking
router.post("/", bookingController.createBooking);

// Fetch bookings for authenticated user
router.get("/", bookingController.getBookings);

module.exports = router;