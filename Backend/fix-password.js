/**
 * One-time script to fix a user whose password was stored as plain text.
 * Run with: node fix-password.js
 * Delete this file after running.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const EMAIL = "sneha.iyer@test.com";
const NEW_PASSWORD = "sneha123"; // change this if you want a different password

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    image: String,
    resume: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);

async function fixPassword() {
    await mongoose.connect(process.env.DATABASE_CONNECTION_URL);
    console.log("✅ Connected to DB");

    const user = await User.findOne({ email: EMAIL });
    if (!user) {
        console.log("❌ User not found:", EMAIL);
        process.exit(1);
    }

    console.log("Found user:", user.name, "| current password field (first 10):", user.password?.substring(0, 10));

    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);
    user.password = hashed;
    await user.save();

    console.log("✅ Password hashed and saved successfully!");
    console.log("   You can now log in with:", EMAIL, "/", NEW_PASSWORD);
    process.exit(0);
}

fixPassword().catch((err) => {
    console.error(err);
    process.exit(1);
});
