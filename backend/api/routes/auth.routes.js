const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Register a new user
router.post("/register", authController.register);

// Log in existing user
router.post("/login", authController.login);

module.exports = router;
