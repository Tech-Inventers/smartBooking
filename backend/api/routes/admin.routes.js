const express = require("express");
const router = express.Router();
const authenticate = require("../../src/middleware/authenticate");
const authorizeRole = require("../../src/middleware/authorizeRole");
const adminController = require("../controllers/admin.controller");
 
// Verify admin role for all admin routes
router.use(authenticate);
router.use(authorizeRole("admin"));
 
// Approve a provider account
router.put("/providers/:userId/approve", adminController.approveProvider);
 
module.exports = router;