    // backend/tests/booking.test.js

    const chai = require("chai");
    const chaiHttp = require("chai-http");
    const app = require("../src/app");
    const db = require("../src/models");
    const { setupDatabase, closeDatabase } = require('./testSetup'); // Import centralized test setup
    const { generateToken } = require('../src/utils/jwtUtils'); // Assuming jwtUtils is in src/utils

    chai.use(chaiHttp);
    const { expect } = chai;

    describe("Booking System", function () {
      this.timeout(30000); // Increased timeout

      let adminToken, providerToken, userToken, providerId, userId; // Declare userId here

      // IMPORTANT: Using the centralized setupDatabase() from testSetup.js
      // This ensures a clean database for each test run.
      before(async function() {
        this.timeout(30000); // Set timeout for this specific hook
        await setupDatabase(); // This will drop and recreate all tables (User, Availability, Booking)

        // Register users and get tokens after DB is clean
        const adminRes = await chai.request(app).post("/api/auth/register").send({
          email: "admin1@example.com",
          password: "admin123",
          role: "admin" // Ensure role is specified for registration
        });
        adminToken = adminRes.body.token;

        const providerRes = await chai.request(app).post("/api/auth/register").send({
          email: "provider1@example.com",
          password: "provider123",
          role: "provider" // Ensure role is specified for registration
        });
        providerToken = providerRes.body.token;
        providerId = providerRes.body.user.id; // Get providerId from the response

        const userRes = await chai.request(app).post("/api/auth/register").send({
          email: "user1@example.com",
          password: "user123",
          role: "user" // Ensure role is specified for registration
        });
        userToken = userRes.body.token;
        userId = userRes.body.user.id; // Get userId from the response

        // Approve provider (only if your auth flow requires explicit admin approval)
        // Note: If 'admin' role auto-approves, this might not be strictly necessary,
        // but it's good for testing the approval flow.
        await chai.request(app)
          .put(`/api/admin/providers/${providerId}/approve`)
          .set("Authorization", `Bearer ${adminToken}`);

        // Add availability for the provider
        await chai.request(app)
          .post("/api/providers/availability") // Updated path to match /api/providers/availability
          .set("Authorization", `Bearer ${providerToken}`)
          .send({
            date: "2023-12-01",
            startTime: "09:00:00", // Added seconds for consistency with TIME type
            endTime: "17:00:00"    // Added seconds for consistency with TIME type
          });
      });

      // IMPORTANT: Using the centralized closeDatabase() from testSetup.js
      after(async function() {
        await closeDatabase(); // This will close the DB connection
      });

      it("should allow user to book available slot", (done) => {
        chai.request(app)
          .post("/api/bookings")
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            staffId: providerId,
            date: "2023-12-01",
            startTime: "10:00:00", // Added seconds
            endTime: "10:30:00",   // Added seconds
            notes: "Regular checkup"
          })
          .end((err, res) => {
            // Log error if present for debugging
            if (err) {
                console.error("Test error:", err);
                return done(err);
            }
            try {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property("id");
                expect(res.body).to.have.property("patientId", userId); // Verify patientId
                expect(res.body).to.have.property("staffId", providerId); // Verify staffId
                expect(res.body).to.have.property("status", "scheduled"); // Verify default status
                done();
            } catch (assertionError) {
                console.error("Assertion error:", assertionError);
                console.error("Response body:", res.body);
                done(assertionError);
            }
          });
      });

      it("should prevent double booking", (done) => {
        chai.request(app)
          .post("/api/bookings")
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            staffId: providerId,
            date: "2023-12-01",
            startTime: "10:00:00", // Added seconds
            endTime: "10:30:00"    // Added seconds
          })
          .end((err, res) => {
            // Log error if present for debugging
            if (err) {
                console.error("Test error:", err);
                return done(err);
            }
            try {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal("Time slot already booked");
                done();
            } catch (assertionError) {
                console.error("Assertion error:", assertionError);
                console.error("Response body:", res.body);
                done(assertionError);
            }
          });
      });

      it("should return user's bookings", (done) => {
        chai.request(app)
          .get("/api/bookings")
          .set("Authorization", `Bearer ${userToken}`)
          .end((err, res) => {
            // Log error if present for debugging
            if (err) {
                console.error("Test error:", err);
                return done(err);
            }
            try {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an("array");
                expect(res.body.length).to.be.greaterThan(0);
                // Verify that the returned bookings belong to the user
                expect(res.body[0]).to.have.property('patientId', userId);
                done();
            } catch (assertionError) {
                console.error("Assertion error:", assertionError);
                console.error("Response body:", res.body);
                done(assertionError);
            }
          });
      });
    });
    