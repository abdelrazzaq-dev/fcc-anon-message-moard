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

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .get((req, res) => {
      const { board } = req.params;
      Board.findOne({ name: board })
        .select({
          "threads.delete_password": 0,
          "threads.reported": 0,
          "threads.replies.delete_password": 0,
          "threads.replies.reported": 0,
        })
        .exec((err, docs) => {
          if (err) {
            res.json({ err });
            return;
          }
          const lastBumped = docs.threads
            .sort((a, b) => b.bumped_on - a.bumped_on)
            .slice(0, 10);
          let lastReplies = [];
          lastBumped.map((item, i) => {
            lastReplies = item.replies
              .sort((a, b) => b.created_on - a.created_on)
              .slice(0, 3);
            lastBumped[i].replies = lastReplies;
          });
          docs.threads = lastBumped;

          res.json(docs);
        });
    })
    .post((req, res) => {
      const { board } = req.params;
      const { text, delete_password } = req.body;
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
        { $set: { "threads.$[elem].reported": true } },
        { arrayFilters: [{ "elem._id": thread_id }] },
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
      Board.updateOne(
        { name: board },
        { $pull: { threads: { _id: thread_id, delete_password } } },
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
      Board.find({ name: board, "threads._id": thread_id })
        .select({
          "threads.delete_password": 0,
          "threads.reported": 0,
          "threads.replies.delete_password": 0,
          "threads.replies.reported": 0,
        })
        .exec((err, docs) => {
          if (err) {
            res.json({ err });
            return;
          }
          res.json(docs);
        });
    })
    .post((req, res) => {
      const { board, thread_id, text, delete_password } = req.body;
      Board.findOneAndUpdate(
        { name: board, threads: { $elemMatch: { _id: thread_id } } },
        {
          $push: {
            "threads.$.replies": { text, delete_password },
          },
          "threads.$.bumped_on": Date.now(),
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
          res.status(300);
          res.redirect(`/b/${board}/${thread_id}`);
        }
      );
    })
    .put((req, res) => {
      const { board } = req.params;
      const { thread_id, reply_id, delete_password } = req.body;
      Board.updateOne(
        { name: board },
        {
          $set: {
            "threads.$[thread].replies.$[reply].reported": true,
          },
        },
        {
          arrayFilters: [
            { "thread._id": thread_id },
            { "reply._id": reply_id },
          ],
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
      Board.updateOne(
        { name: board },
        {
          $set: {
            "threads.$[thread].replies.$[reply].text": "deleted",
          },
        },
        {
          arrayFilters: [
            { "thread._id": thread_id },
            {
              "reply._id": reply_id,
              "reply.delete_password": delete_password,
            },
          ],
        },
        (err, doc) => {
          if (err) {
            res.send(JSON.stringify(err));
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
