/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const expect = require("chai").expect;
const Board = require("../models/board.js");

module.exports = function(app) {
  app
    .route("/api/threads/:board")
    .get((req, res) => {
      const { board } = req.params;
      Board.find({ name: board })
        .sort({ "threads.bumped_on": -1 })
        .limit(10)
        .select({
          "threads.delete_password": 0,
          "threads.reported": 0,
          "threads.replies.delete_password": 0,
          "threads.replies.reported": 0
        })
        .exec((err, docs) => {
          if (err) {
            res.json({ err });
            return;
          }
          console.log(docs);
          res.json(docs);
        });
    })
    .post((req, res) => {
      const { board, text, delete_password } = req.body;
      Board.findOneAndUpdate(
        { name: board },
        { $push: { threads: { text, delete_password } } },
        { upsert: true },
        (err, doc) => {
          if (err) {
            res.json({ err });
            return;
          }
          res.redirect(`/b/${board}`);
        }
      );
    })
    .put((req, res) => {
      const { board } = req.params;
      const { thread_id } = req.body;
      Board.findOneAndUpdate(
        { name: board },
        {
          $set: { "threads.$[elem].reported": true },
          arrayFilter: [{ "elem._id": thread_id }]
        },
        (err, doc) => {
          if (err) {
            res.json({ err });
            return;
          }
          if (doc) {
            res.send("success");
            return;
          }
          res.send("no thread was found");
        }
      );
    })
    .delete((req, res) => {
      const { board } = req.params;
      const { thread_id, delete_password } = req.body;
      Board.findOneAndUpdate(
        { name: board },
        { $pull: { threads: { id: thread_id, delete_password } } },
        (err, doc) => {
          if (err) {
            res.json({ err });
            return;
          }
          if (doc) {
            res.send("success");
            return;
          }
          res.send("incorrect password");
        }
      );
    });

  app
    .route("/api/replies/:board")
    .get((req, res) => {
      const { board } = req.params;
      const { thread_id } = req.query;
      Board.find({ name: board, "threads.id": thread_id })
        .select({
          "threads.delete_password": 0,
          "threads.reported": 0,
          "threads.replies.delete_password": 0,
          "threads.replies.reported": 0
        })
        .exec((err, docs) => {
          if (err) {
            res.json({ err });
            return;
          }
          console.log(docs);
          res.json(docs);
        });
    })
    .post((req, res) => {
      const { board, thread_id, text, delete_password } = req.body;
      Board.findOneAndUpdate(
        { name: board, threads: { $elemMatch: { _id: thread_id } } },
        {
          $push: {
            "threads.$.replies": { text, delete_password }
          },
          "threads.$.bumped_on": Date.now()
        },
        (err, doc) => {
          if (err) {
            res.json({ err });
            return;
          }
          if (doc === null) {
            res.json({ errors: "no thread founded" });
            return;
          }
          res.redirect(`/b/${board}/${thread_id}`);
        }
      );
    })
    .put((req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;
      Board.findOneAndUpdate(
        { name: board },
        {
          $set: {
            "threads.$[thread].replies.$[reply].reported": true
          },
          arrayFilters: [{ "thread._id": thread_id }, { "reply._id": reply_id }]
        },
        (err, doc) => {
          if (err) {
            res.json({ err });
            return;
          }
          if (doc) {
            res.send("success");
            return;
          }
          res.send("no reply was found");
        }
      );
    })
    .delete((req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;
      Board.findOneAndUpdate(
        { name: board },
        {
          $set: {
            "threads.$[thread].replies.$[reply].text": "deleted"
          },
          arrayFilters: [
            { "thread._id": thread_id },
            {
              "reply._id": reply_id,
              "reply.delete_password": delete_password
            }
          ]
        },
        (err, doc) => {
          console.log(doc);
          if (err) {
            console.log(err);
            res.json({ err });
            return;
          }
          if (doc) {
            res.send("success");
            return;
          }
          res.send("incorrect password");
        }
      );
    });
};
