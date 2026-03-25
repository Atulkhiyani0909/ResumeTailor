import Job from "../models/jobs.models.js";

export const getAllJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        console.log(`Fetching jobs... Page: ${page}`);

        const jobs = await Job.find({})
            .sort({ createdAt: -1 }) 
            .skip(skip)
            .limit(limit)
            .select("-embeddings"); 

        const totalJobs = await Job.countDocuments();

        return res.status(200).json({
            success: true,
            count: jobs.length,
            total: totalJobs,
            totalPages: Math.ceil(totalJobs / limit),
            currentPage: page,
            jobs: jobs
        });

    } catch (error) {
        console.error(" Error fetching jobs:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to fetch jobs from the database.",
            error: error.message 
        });
    }
};

export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Job ID format."
            });
        }

        console.log(`Fetching details for Job ID: ${id}`);

        const job = await Job.findById(id).select("-embeddings");

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found. It may have been removed."
            });
        }

        return res.status(200).json({
            success: true,
            job: job
        });

    } catch (error) {
        console.error(" Error fetching job by ID:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error while fetching the job details.",
            error: error.message 
        });
    }
};