const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log(
      "🥭  MongoDB connected",
      `DB Name: ${mongoose.connection.db.databaseName}`
    );
  } catch (e) {
    console.log(e);
  }
};

connectDB();
