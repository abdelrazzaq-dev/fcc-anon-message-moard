const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema(
  {
    text: {
      type: String,
      required: true
    },
    delete_password: {
      type: String,
      requried: true
    },
    reported: Boolean
  },
  { timestamps: { createAt: "created_on" } }
);

const threadSchema = new Schema(
  {
    text: {
      type: String,
      required: true
    },
    delete_password: {
      type: String,
      requried: true
    },
    bumped_on: {
      type: Date,
      default: Date.now()
    },
    reported: Boolean,
    replies: [replySchema]
  },
  { timestamps: { createAt: "created_on" } }
);

const boardSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  threads: [threadSchema]
});

module.exports = mongoose.model("board", boardSchema);
