import mongoose from "mongoose";

export const Db_connect = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is undefined — check your .env file");
        }

        console.log("Connecting to:", process.env.MONGO_URL.replace(/:([^@]+)@/, ':****@'));

        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('Connected Successfully to DB');

    } catch (error) {
        console.error("DB Connection Failed:", error.message);
    }
};