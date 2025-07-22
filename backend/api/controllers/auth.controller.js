const db = require("../../src/models"); // Import database models
const bcrypt = require("bcryptjs"); // For password hashing
const jwt = require("jsonwebtoken"); // For token generation

const validRoles = ["user", "provider", "admin"];
const preApprovedEmails = { // Pre-set role mappings for approved emails [adminns and providers]
  "admin1@example.com": "admin",
  "admin2@example.com": "admin",
  "provider1@example.com": "provider",
  "provider2@example.com": "provider"
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    // Validate input
    if ((!email || email.trim() === "") && (!password || password.trim() === "")) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password || password.trim() === "") {
      return res.status(400).json({ message: "Password is required" });
    }

    // Check for existing user
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Determine role and approval status
    let roleFromMap = preApprovedEmails[email];
    let role = "user";
    let isApproved = false;

    if (roleFromMap) {
      role = roleFromMap;
      isApproved = (role === "admin");
    }

    // Create user
    const user = await db.User.create({ 
      email, 
      password, 
      role,
      isApproved 
    });

    // Generate JWT with role
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send registration success response
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        proof: user.proof
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Log in existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if ((!email || email.trim() === "") && (!password || password.trim() === "")) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password || password.trim() === "") {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find user
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT with role
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send login success response
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        proof: user.proof
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login };