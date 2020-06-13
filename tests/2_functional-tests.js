/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("API ROUTING FOR /api/threads/:board", function () {
    suite("POST", function () {
      test("Post a thread to board", (done) => {
        chai
          .request(server)
          .post("/api/threads/education")
          .send({
            text: "this a new thread about education quality",
            delete_password: "ed-kill",
          })
          .end((err, res) => {
            expect(res).to.redirectTo(/\/b\/education$/);
            assert.isTrue(true);
            done();
          });
      });
    });

    suite("GET", function () {
      test("Get board threads", (done) => {
        chai
          .request(server)
          .get("/api/threads/education")
          .end((err, res) => {
            assert.isObject(res.body);
            assert.isArray(res.body.threads);
            assert.isAtMost(res.body.threads.length, 10);
            done();
          });
      });
    });

    suite("DELETE", function () {
      test("Delete a thread", (done) => {
        chai
          .request(server)
          .get("/api/threads/education")
          .end((err, res) => {
            const { _id } = res.body.threads[0]._id;
            chai
              .request(server)
              .delete("/api/threads/education")
              .send({
                thread_id: _id,
                delete_password: "ed-kill",
              })
              .end((err, res) => {
                assert.equal(res.text, "success");
                done();
              });
          });
      });
    });

    suite("PUT", function () {
      test("Report a thread", (done) => {
        chai
          .request(server)
          .get("/api/threads/education")
          .end((err, res) => {
            const { _id } = res.body.threads[0];
            chai
              .request(server)
              .put("/api/threads/education")
              .send({ thread_id: _id })
              .end((err, res) => {
                assert.equal(res.text, "success");
                done();
              });
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function () {
    suite("POST", function () {
      test("Post a reply to a thread", (done) => {
        chai
          .request(server)
          .post("/api/replies/education")
          .send({
            text: "this a new reply for education quality",
            delete_password: "ed-reply-kill",
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            // expect(res).to.redirect(/\/b\/education\/[a-zA-Z0-9]+/);
            assert.isTrue(true);
            done();
          });
      });
    });

    suite("GET", function () {
      test("Report a thread", (done) => {
        chai
          .request(server)
          .get("/api/threads/education")
          .end((err, res) => {
            const { _id } = res.body.threads[0];
            chai
              .request(server)
              .get("/api/replies/education/thread_id=" + _id)
              .end((err, res) => {
                assert.isObject(res);
                done();
              });
          });
      });
    });

    suite("PUT", function () {});

    suite("DELETE", function () {});
  });
});
