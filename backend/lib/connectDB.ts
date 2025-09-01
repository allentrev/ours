// lib/connectDB.ts
import mongoose from "mongoose";
import { exit } from 'node:process';

const connectDB = async (): Promise<void> => {
    try {
        console.log("connectDB entry");

        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("MONGO_URI environment variable not set");
        }

        await mongoose.connect(mongoUri);
        console.log("Mongo DB connected");
    } catch (error: any) {
        console.error(`connectDB Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;