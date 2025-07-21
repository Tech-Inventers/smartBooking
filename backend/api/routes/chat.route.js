const express = require("express");
const router = express.Router();
const { handleSmartBooking } = require("../controllers/chat.controller");
const authenticate = require("../../src/middleware/authenticate"); 

// AI smart booking endpoint 
router.post("/assistant", authenticate, handleSmartBooking);

module.exports = router;
