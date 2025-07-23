const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/app");
const db = require("../src/models");

chai.use(chaiHttp);
const { expect } = chai;

describe("NLP Chat Assistant Booking", function () {
  this.timeout(30000);
  let adminToken, providerToken, userToken, providerId;

  before(async function () {
    await db.sequelize.sync({ force: true }); // Reset database

    // Register admin, provider, and user accounts
    await chai.request(app).post("/api/auth/register").send({
      email: "admin1@example.com", password: "admin123"
    });
    await chai.request(app).post("/api/auth/register").send({
      email: "provider1@example.com", password: "provider123"
    });
    await chai.request(app).post("/api/auth/register").send({
      email: "user1@example.com", password: "user123"
    });

    // Login and store tokens
    adminToken = (await chai.request(app).post("/api/auth/login").send({
      email: "admin1@example.com", password: "admin123"
    })).body.token;

    providerToken = (await chai.request(app).post("/api/auth/login").send({
      email: "provider1@example.com", password: "provider123"
    })).body.token;

    userToken = (await chai.request(app).post("/api/auth/login").send({
      email: "user1@example.com", password: "user123"
    })).body.token;

    // Get provider user ID
    providerId = (await chai.request(app).post("/api/auth/login").send({
      email: "provider1@example.com", password: "provider123"
    })).body.user.id;

    // Approve provider via admin
    await chai.request(app)
      .put(`/api/admin/providers/${providerId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    // Add availability for July 25
    await chai.request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({
        date: "2025-07-25",
        startTime: "10:00",
        endTime: "13:00"
      });

    // Add availability for July 26 (for rescheduling test)
    await chai.request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({
        date: "2025-07-26",
        startTime: "10:00",
        endTime: "13:00"
      });
  });

  it("should process message and create booking", (done) => {
    chai.request(app)
      .post("/api/chat/assistant")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        message: "Please book provider1@example.com on July 25 2025 at 10:00 to 10:30"
      })
      .end((err, res) => {
        console.log("AI Response:", res.body.reply); 
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("message", "Booking confirmed");
        expect(res.body.booking).to.have.property("staffId", providerId);
        expect(res.body.booking).to.have.property("status", "scheduled");
        done();
      });
  });

  it("should respond with available slots", (done) => {
    chai.request(app)
      .post("/api/chat/assistant")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        message: "Is provider1@example.com available on July 25?"
      })
      .end((err, res) => {
        console.log("Availability Response:", res.body.reply);
        expect(res).to.have.status(200);
        expect(res.body.reply).to.include("Available slots");
        done();
      });
  });

  it("should reschedule an existing booking", (done) => {
    chai.request(app)
      .post("/api/chat/assistant")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        message: "Reschedule my appointment with provider1@example.com from July 25 2025 at 10:00 to 10:30 to July 26 2025 at 11:00 to 11:30"
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal("Booking rescheduled");
        expect(res.body.booking.date).to.equal("2025-07-26");
        done();
      });
  });

  it("should cancel the rescheduled booking", (done) => {
    chai.request(app)
      .post("/api/chat/assistant")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        message: "Cancel my appointment with provider1@example.com on July 26 2025 at 11:00 to 11:30"
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equal("Booking cancelled");
        expect(res.body.booking.status).to.equal("cancelled");
        done();
      });
  });

 it("should return user's upcoming bookings", (done) => {
  chai.request(app)
    .post("/api/chat/assistant")
    .set("Authorization", `Bearer ${userToken}`)
    .send({
      message: "Show me my upcoming bookings"
    })
    .end((err, res) => {
      console.log("View Response:", res.body.reply);
      expect(res).to.have.status(200);
      expect(res.body.reply).to.satisfy(reply =>
        reply.includes("Here are your upcoming bookings") ||
        reply.includes("no upcoming bookings")
      );
      done();
    });
  });
});
