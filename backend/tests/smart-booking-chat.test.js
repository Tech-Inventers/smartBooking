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

    // Add availability slot for provider
    await chai.request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({
        date: "2025-07-25",
        startTime: "10:00",
        endTime: "13:00"
      });
  });

   // Test NLP chat-based booking creation
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
});
