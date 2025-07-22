const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/app");
const db = require("../src/models");

chai.use(chaiHttp);
const { expect } = chai;

describe("Booking System", function () {
  this.timeout(30000);
  let adminToken, providerToken, userToken, providerId;

  before(async function() {
  

    // Register users
    await chai.request(app).post("/api/auth/register").send({
      email: "admin1@example.com",
      password: "admin123"
    });
    await chai.request(app).post("/api/auth/register").send({
      email: "provider1@example.com",
      password: "provider123"
    });
    await chai.request(app).post("/api/auth/register").send({
      email: "user1@example.com",
      password: "user123"
    });

    // Login and get tokens
    adminToken = (await chai.request(app).post("/api/auth/login").send({
      email: "admin1@example.com",
      password: "admin123"
    })).body.token;
    providerToken = (await chai.request(app).post("/api/auth/login").send({
      email: "provider1@example.com",
      password: "provider123"
    })).body.token;
    userToken = (await chai.request(app).post("/api/auth/login").send({
      email: "user1@example.com",
      password: "user123"
    })).body.token;

    // Approve provider and get ID
    const provider = (await chai.request(app).post("/api/auth/login").send({
      email: "provider1@example.com",
      password: "provider123"
    })).body.user;
    providerId = provider.id;
    await chai.request(app)
      .put(`/api/admin/providers/${providerId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);

    // Add availability
    await chai.request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({
        date: "2023-12-01",
        startTime: "09:00",
        endTime: "17:00"
      });
  });

  it("should allow user to book available slot", (done) => {
    chai.request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        staffId: providerId,
        date: "2023-12-01",
        startTime: "10:00",
        endTime: "10:30",
        notes: "Regular checkup"
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("id");
        done();
      });
  });

  it("should prevent double booking", (done) => {
    chai.request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        staffId: providerId,
        date: "2023-12-01",
        startTime: "10:00",
        endTime: "10:30"
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal("Time slot already booked");
        done();
      });
  });

  it("should return user's bookings", (done) => {
    chai.request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.greaterThan(0);
        done();
      });
  });
});
