const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/app");
const db = require("../src/models");

chai.use(chaiHttp);
const { expect } = chai;

describe("POST /api/auth/register", function () {
  this.timeout(30000); // Increased timeout

  before(async function() {
    
    try {
      console.log("Starting DB sync for register test...");

      // Test database connection first
      await db.sequelize.authenticate();
      console.log("Database connection established successfully.");

      // Force sync with cascade to handle foreign key constraints
      await db.sequelize.sync({ force: true, cascade: true });
      console.log("DB synced for register test.");

    } catch (error) {
      console.error("Database setup failed:", error);
      throw error;
    }
  });

  it("should register a new user and return a token", (done) => {
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "testuser@example.com",
        password: "password123",
        role: "user",
      })
      .end((err, res) => {
        if (err) {
          console.error("Test error:", err);
          return done(err);
        }

        try {
          expect(res).to.have.status(201);
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

  it("should not register a user with duplicate email", (done) => {
    // First, register a user
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "duplicate@example.com",
        password: "password123",
        role: "user",
      })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(201);

        // Now try to register with the same email
        chai
          .request(app)
          .post("/api/auth/register")
          .send({
            email: "duplicate@example.com",
            password: "password456",
            role: "user",
          })
          .end((err, res) => {
            if (err) return done(err);

            expect(res).to.have.status(400);
            expect(res.body).to.have.property("message", "Email already exists");
            done();
          });
      });
  });

  it("should not register a user without email", (done) => {
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "", // Empty email
        password: "password123",
        role: "user",
      })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message", "Email is required");
        done();
      });
  });

  it("should not register a user without password", (done) => {
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "nopassword@example.com",
        password: "", // Empty password
        role: "user",
      })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message", "Password is required");
        done();
      });
  });

  it("should not register a user without email or password", (done) => {
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "", // missing email
        password: "", // missing password
        role: "user",
      })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message", "Email and password are required");
        done();
      });
  });
});
