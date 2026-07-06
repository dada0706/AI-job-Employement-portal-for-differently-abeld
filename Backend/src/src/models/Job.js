import mongoose from "mongoose";

const jobSchema = mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  level: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: Number, required: true },
  category: { type: String, required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  date: { type: Number, required: true },
  visible: { type: Boolean, default: true },
  required_skills: [{ type: String }],
  remote_option: { type: Boolean, default: false },
  accessibility_features: [{ type: String }],
  accessibility_score: { type: Number, default: 0 },
  workplace_barriers: [{ type: String }],
  inclusive_hiring_policy: { type: String },
  accommodations_available: [{ type: String }],
  disability_support: [{ type: String }]
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
