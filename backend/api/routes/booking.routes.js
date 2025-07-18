const express = require("express");
const router = express.Router();
const authenticate = require("../../src/middleware/authenticate");
const bookingController = require("../controllers/booking.controller");
 
router.use(authenticate);
 
router.post("/", bookingController.createBooking);
router.get("/", bookingController.getBookings);
 
module.exports = router;
 