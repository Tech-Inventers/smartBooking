const express = require("express");
const router = express.Router();
const authenticate = require("../../src/middleware/authenticate");
const authorizeRole = require("../../src/middleware/authorizeRole");
const availabilityController = require("../controllers/availability.controller");

// Apply authentication to all routes
router.use(authenticate);

// Public routes (accessible to all authenticated users)
router.get("/", availabilityController.getAvailability);

// Provider-only routes
router.post("/", authorizeRole("provider"), availabilityController.addAvailability);

module.exports = router;