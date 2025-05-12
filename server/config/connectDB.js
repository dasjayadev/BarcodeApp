const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`MongoDB Connected to : ${conn.connection.db.databaseName}`);
  }
  catch (err) {
    console.error("MongoDB connection error",err.message);
    process.exit(1);
  }
}
module.exports = connectDB;