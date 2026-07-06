import mongoose from "mongoose";

const companySchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  accessibility_infrastructure: {
    wheelchair_access: { type: Boolean, default: false },
    elevator_access: { type: Boolean, default: false },
    accessible_restrooms: { type: Boolean, default: false },
    braille_signage: { type: Boolean, default: false },
    sign_language_support: { type: Boolean, default: false },
    accessible_parking: { type: Boolean, default: false },
    quiet_workspaces: { type: Boolean, default: false },
    remote_friendly: { type: Boolean, default: false }
  }
});

const Company = mongoose.model("Company", companySchema);

export default Company;
