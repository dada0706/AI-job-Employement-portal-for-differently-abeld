import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  resume: { type: String, default: "" },
  disability_type: [{ type: String }],
  accessibility_needs: [{ type: String }],
  assistive_technology_used: [{ type: String }],
  preferred_work_environment: { type: String },
  remote_work_preference: { type: Boolean, default: false },
  accessibility_preferences: { type: Map, of: String }
});

const User = mongoose.model("User", userSchema);

export default User;
