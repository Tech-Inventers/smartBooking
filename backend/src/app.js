const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
 
const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
 
const authRoutes = require("../api/routes/auth.routes");
const adminRoutes = require("../api/routes/admin.routes");
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
 
app.get("/", (req, res) => res.send("Smart Booking API Running"));

// AvailabiltyRoutes
const availabilityRoutes = require("../api/routes/availability.routes");
app.use("/api/availability", availabilityRoutes);

// BookingRoutes
const bookingRoutes = require("../api/routes/booking.routes");
app.use("/api/bookings", bookingRoutes);

// BookingRoutes
const chatRoutes = require("../api/routes/chat.route");
app.use("/api/chat", chatRoutes);

module.exports = app;