import Job from "../models/Job.js";

const getAllJobs = async (req, res) => {
  try {
    const { disabilities } = req.query;
    let query = { visible: true };

    if (disabilities) {
      const disabilityList = Array.isArray(disabilities)
        ? disabilities
        : disabilities.split(",");
      query.disability_support = { $in: disabilityList };
    }

    const jobs = await Job.find(query).populate(
      "companyId",
      "-password"
    );

    return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      jobData: jobs,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Job fetched failed",
    });
  }
};

export default getAllJobs;
