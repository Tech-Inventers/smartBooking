const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/app");
const db = require("../src/models");
 
chai.use(chaiHttp);
const { expect } = chai;
 
describe("Provider Registration", function () {
  this.timeout(30000);
  let adminToken;
 
  before(async function() {
    this.timeout(30000);
    await db.sequelize.sync({ force: true });
   
    // Register an admin first
    await chai.request(app)
      .post("/api/auth/register")
      .send({
        email: "admin1@example.com",
        password: "admin123"
      });
   
    // Login admin to get token
    const res = await chai.request(app)
      .post("/api/auth/login")
      .send({
        email: "admin1@example.com",
        password: "admin123"
      });
   
    adminToken = res.body.token;
  });
 
  after(async function() {
    await db.sequelize.close();
  });
 
  it("should register pre-approved provider but not auto-approve", (done) => {
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "provider1@example.com",
        password: "provider123"
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(201);
        expect(res.body.user.role).to.equal("provider");
        expect(res.body.user.isApproved).to.be.false;
        done();
      });
  });
 
  it("should allow admin to approve provider", (done) => {
    // First register a provider
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "provider2@example.com",
        password: "provider123"
      })
      .end((err, registerRes) => {
        if (err) return done(err);
       
        // Then approve the provider
        chai
          .request(app)
          .put(`/api/admin/providers/${registerRes.body.user.id}/approve`)
          .set("Authorization", `Bearer ${adminToken}`)
          .end((err, approveRes) => {
            if (err) return done(err);
            expect(approveRes).to.have.status(200);
            expect(approveRes.body.user.isApproved).to.be.true;
            done();
          });
      });
  });
 
  it("should not allow non-admin to approve providers", (done) => {
    // First register a regular user
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "regular@example.com",
        password: "regular123"
      })
      .end((err, registerRes) => {
        if (err) return done(err);
       
        // Login as regular user
        chai
          .request(app)
          .post("/api/auth/login")
          .send({
            email: "regular@example.com",
            password: "regular123"
          })
          .end((err, loginRes) => {
            if (err) return done(err);
           
            // Try to approve provider (should fail)
            chai
              .request(app)
              .put(`/api/admin/providers/${registerRes.body.user.id}/approve`)
              .set("Authorization", `Bearer ${loginRes.body.token}`)
              .end((err, approveRes) => {
                expect(approveRes).to.have.status(403);
                done();
              });
          });
      });
  });
});