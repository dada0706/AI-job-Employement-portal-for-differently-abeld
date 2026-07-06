import bcrypt from "bcrypt";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res.json({ success: false, message: "Enter your name" });
    }

    if (!email) {
      return res.json({ success: false, message: "Enter your email" });
    }

    if (!password) {
      return res.json({ success: false, message: "Enter your password" });
    }

    if (!imageFile) {
      return res.json({ success: false, message: "Upload your image" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store local path as a URL served by Express static middleware
    const imageUrl = `/uploads/${imageFile.filename}`;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    await user.save();

    const token = await generateToken(user._id);

    return res.json({
      success: true,
      message: "Registration successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Registration failed",
    });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[loginUser] attempt for:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("[loginUser] user not found:", email);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Temporary detailed debug logging — REMOVE before production
    console.log("[loginUser] user found id:", user._id);
    console.log("[loginUser] password received (length):", password?.length, "| repr:", JSON.stringify(password));
    console.log("[loginUser] stored hash (length):", user.password?.length, "| first 10 chars:", user.password?.substring(0, 10));

    let isMatch = false;
    if (user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password.trim(), user.password);
    } else {
      isMatch = password.trim() === user.password;
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password.trim(), salt);
        await user.save();
        console.log(`[loginUser] Migrated password for user ${user._id} to hashed version`);
      }
    }

    console.log("[loginUser] password compare result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: "Login successful",
      userData: {
        id: user._id,
        name: user.name,
        email: user.email,
        // include other public fields as needed
      },
      token,
    });
  } catch (error) {
    console.error("[loginUser] error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchUserData = async (req, res) => {
  try {
    const userData = req.userData;

    return res.status(200).json({
      success: true,
      message: "user data fetched successfully",
      userData,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "user data fetched failed",
      userData,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.userData._id;

    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Job ID are required",
      });
    }

    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });

    if (isAlreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const jobApplication = new JobApplication({
      jobId,
      userId,
      companyId: jobData.companyId,
      date: new Date(),
    });

    await jobApplication.save();

    return res.status(201).json({
      success: true,
      message: "Job applied successfully",
      jobApplication,
    });
  } catch (error) {
    console.error("Job application error:", error);

    return res.status(500).json({
      success: false,
      message: "Job application failed",
    });
  }
};

export const getUserAppliedJobs = async (req, res) => {
  try {
    const userId = req.userData._id;

    const application = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Jobs application fetched successfully",
      jobApplications: application,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs application",
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const userId = req.userData._id;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required",
      });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Store resume locally
    userData.resume = `/uploads/${resumeFile.filename}`;

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: userData.resume,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload resume",
    });
  }
};
