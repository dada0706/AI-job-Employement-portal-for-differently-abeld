import express from "express";
import getAllJobs from "../controllers/jobController.js";
import { aiSearchJobs } from "../controllers/jobSearchController.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/ai-search", aiSearchJobs);

export default router;
