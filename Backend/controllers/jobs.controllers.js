import Job from "../models/jobs.models.js";
import mongoose from "mongoose";
import cloudinary from '../config/cloudinary.js';
import axios from 'axios'


export const getAllJobs = async (req, res) => {
    try {
        

        const jobs = await Job.find({})
            .select("-embeddings");

        const totalJobs = await Job.countDocuments();

        return res.status(200).json({
            success: true,
            count: jobs.length,
            total: totalJobs,
            jobs: jobs
        });

    } catch (error) {
        console.error("Error fetching jobs:", error);
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
        console.log(`Fetching details for Job ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Job ID format."
            });
        }

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
        console.error("Error fetching job by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching the job details.",
            error: error.message
        });
    }
};

export const getMatchedJobs = async (req, res) => {
    try {
        
        const currentUser = req.user; 
        let securePdfUrl = null;

        
        if (req.file) {
            console.log("New file uploaded. Processing to Cloudinary...");
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;

            const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
                resource_type: "auto",
                folder: "resumes"
            });
            securePdfUrl = cloudinaryResponse.secure_url;
        } 
       
        else if (currentUser && currentUser.resumeUrl) {
            console.log("No file uploaded. Using saved Base Resume from profile...");
            securePdfUrl = currentUser.resumeUrl;
        } 
        
        else {
            return res.status(400).json({ 
                success: false, 
                message: "Please upload a resume or save a Base Resume in your Secrets profile." 
            });
        }

        console.log(`Executing match against: ${securePdfUrl}`);

       
        const pythonPayload = {
            resume_url: securePdfUrl,
            api_key: currentUser?.API_key_Gemini || null
        };

         
        console.log(`${process.env.PYTHON_BACKEND}/api/matched-jobs`);
        
        const pythonResponse = await axios.post(`${process.env.PYTHON_BACKEND}/api/matched-jobs`, pythonPayload);
        
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
};