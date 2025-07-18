const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/app");
const db = require("../src/models");
 
chai.use(chaiHttp);
const { expect } = chai;
 
describe("Admin Registration", function () {
  this.timeout(30000);
 
  it("should auto-approve pre-approved admin email", (done) => {
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "admin1@example.com",
        password: "admin123",
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(201);
        expect(res.body.user.role).to.equal("admin");
        expect(res.body.user.isApproved).to.be.true;
        done();
      });
  });
 
  it("should force user role for non-pre-approved emails (ignoring requested admin role)", (done) => {
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "regularuser@example.com",
        password: "password123",
        role: "admin"
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(201);
        expect(res.body.user.role).to.equal("user");
        expect(res.body.user.isApproved).to.be.false;
        done();
      });
  });
 
  it("should allow second admin registration", (done) => {
    chai
      .request(app)
      .post("/api/auth/register")
      .send({
        email: "admin2@example.com",
        password: "admin123",
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(201);
        expect(res.body.user.role).to.equal("admin");
        done();
      });
  });
});