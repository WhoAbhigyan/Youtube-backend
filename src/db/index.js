import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

export const connectDB = async () => {
    try {
         const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Connected to MongoDB: ${connectionInstance.connection.host}`);
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
};
export default connectDB;