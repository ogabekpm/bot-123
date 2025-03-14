const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: String,
    full_name: String,
    phone: String,
    balance: {
        type: Number,
        default: 0,
    },
    isVote: {
        type: String,
        enum: ["pending", "voted", "not_voted"],
    },
    telegram: {},
});

module.exports = mongoose.model("User", userSchema);
