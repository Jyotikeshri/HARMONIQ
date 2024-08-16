import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connect_DB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;
    console.log("MongoDb connected successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
  }
};

export default connect_DB;
