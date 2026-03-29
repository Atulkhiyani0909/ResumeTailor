import Job from "../models/jobs.models.js";
import mongoose from "mongoose";
import cloudinary from '../config/cloudinary.js';
import axios from 'axios'

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
        console.log(id);


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

export const getMatchedJobs = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No resume file provided" });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;


        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
            resource_type: "auto",
            folder: "resumes"
        });
        const securePdfUrl = cloudinaryResponse.secure_url;

        console.log(securePdfUrl);

        const pythonResponse = await axios.post('http://127.0.0.1:8000/api/matched-jobs', {
            resume_url: securePdfUrl
        });
        console.log(pythonResponse);

        const matched_jobs = pythonResponse.data;

        return res.status(200).json({
            success: true,
            matched_jobs: matched_jobs
        });

    } catch (err) {
        console.error("Controller Error :", err);
        return res.status(500).json({
            success: false,
            message: "Server error during Matching process",
            error: err.message
        });
    }
}