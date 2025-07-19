const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/app");
const db = require("../src/models");
 
chai.use(chaiHttp);
const { expect } = chai;
 
describe("POST /api/auth/login", function () {
  this.timeout(30000); // Increased timeout
 
  before(async function() {
    this.timeout(30000); // Set timeout for this specific hook
   
    try {
      console.log("Starting DB sync for login test...");
     
      // Test database connection first
      await db.sequelize.authenticate();
      console.log("Database connection established successfully.");
     
      // Force sync with cascade to handle foreign key constraints
      await db.sequelize.sync({ force: true, cascade: true });
      console.log("DB synced. Creating test user...");
 
      // Create user with plain password - let the model's beforeCreate hook handle hashing
      const user = await db.User.create({
        email: "testuser@example.com",
        password: "password123", // Plain password - will be hashed by model hook
        role: "user",
      });
     
      console.log("Test user created successfully");
      console.log("User ID:", user.id);
     
      // Verify user was saved correctly
      const savedUser = await db.User.findOne({ where: { email: "testuser@example.com" } });
      console.log("Retrieved user from DB:", savedUser ? "Found" : "Not found");
     
      // Test bcrypt compare with saved hash
      const bcrypt = require("bcryptjs");
      const compareResult = await bcrypt.compare("password123", savedUser.password);
      console.log("Password verification in setup:", compareResult);
     
      if (!compareResult) {
        throw new Error("Password verification failed in test setup!");
      }
     
    } catch (error) {
      console.error("Database setup failed:", error);
      throw error;
    }
  });
 
  it("should login an existing user and return a token", (done) => {
    chai
      .request(app)
      .post("/api/auth/login")
      .send({
        email: "testuser@example.com",
        password: "password123",
      })
      .end((err, res) => {
        if (err) {
          console.error("Test error:", err);
          return done(err);
        }
       
        try {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("token");
          expect(res.body.user).to.have.property("email", "testuser@example.com");
          expect(res.body.user).to.have.property("role", "user");
          expect(res.body.user).to.not.have.property("password");
          done();
        } catch (assertionError) {
          console.error("Assertion error:", assertionError);
          console.error("Response body:", res.body);
          done(assertionError);
        }
      });
  });
 
  it("should not login with incorrect password", (done) => {
    chai
      .request(app)
      .post("/api/auth/login")
      .send({
        email: "testuser@example.com",
        password: "wrongpassword",
      })
      .end((err, res) => {
        if (err) return done(err);
       
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("message", "Invalid credentials");
        done();
      });
  });
 
  it("should not login with non-existent email", (done) => {
    chai
      .request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "password123",
      })
      .end((err, res) => {
        if (err) return done(err);
       
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("message", "Invalid credentials");
        done();
      });
  });
 
  it("should not login without password", (done) => {
    chai
      .request(app)
      .post("/api/auth/login")
      .send({
        email: "testuser@example.com",
      })
      .end((err, res) => {
        if (err) return done(err);
       
        expect(res).to.have.status(400);
        done();
      });
  });
});