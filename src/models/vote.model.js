const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  isVote: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("Vote", voteSchema);
