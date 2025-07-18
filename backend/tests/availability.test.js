const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/app");
const db = require("../src/models");
 
chai.use(chaiHttp);
const { expect } = chai;
 
describe("Availability Management", function () {
  this.timeout(30000);
  let adminToken, providerToken, userToken;
 
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
 
    // Approve provider
    const provider = (await chai.request(app).post("/api/auth/login").send({
      email: "provider1@example.com",
      password: "provider123"
    })).body.user;
    await chai.request(app)
      .put(`/api/admin/providers/${provider.id}/approve`)
      .set("Authorization", `Bearer ${adminToken}`);
  });
 
  it("should allow provider to add availability", (done) => {
    chai.request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({
        date: "2025-07-20",
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 60
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property("id");
        done();
      });
  });
 
  it("should prevent overlapping availability", (done) => {
    chai.request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({
        date: "2025-07-20",
        startTime: "16:00",
        endTime: "18:00",
        slotDuration: 60
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.equal("This time slot overlaps with existing availability");
        done();
      });
  });
 
  it("should allow users to view availability", (done) => {
    chai.request(app)
      .get("/api/availability")
      .set("Authorization", `Bearer ${userToken}`)  // <-- Added authorization here
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.greaterThan(0);
        expect(res.body[0]).to.have.property("date", "2025-07-20");
        done();
      });
  });
});