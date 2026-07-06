import mongoose from "mongoose";
import "dotenv/config";
import Job from "./src/models/Job.js";
import connectDB from "./src/db/connectDB.js";

const locationMap = {
    "Dhaka": "Bangalore",
    "Chattogram": "Hyderabad",
    "Khulna": "Chennai",
    "Rajshahi": "Mumbai",
    "Barishal": "Pune",
    "Sylhet": "Delhi",
    "Rangpur": "Kolkata",
    "Mymensingh": "Ahmedabad",
};

const updateLocations = async () => {
    try {
        await connectDB();
        console.log("Connected to MongoDB...");

        for (const [oldLoc, newLoc] of Object.entries(locationMap)) {
            const result = await Job.updateMany(
                { location: oldLoc },
                { $set: { location: newLoc } }
            );
            console.log(`Updated ${result.modifiedCount} jobs from ${oldLoc} to ${newLoc}`);
        }
        console.log("Location migration completed successfully.");
    } catch (error) {
        console.error("Error updating locations:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

updateLocations();
