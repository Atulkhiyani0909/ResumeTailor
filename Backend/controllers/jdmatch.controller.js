import axios from 'axios';
import cloudinary from '../config/cloudinary.js';

const PYTHON_AI_SERVICE_URL = 'http://127.0.0.1:8000';


export const analyzeGaps = async (req, res) => {
  try {
    const {  jd_content } = req.body;

      if (!req.file) {
      return res.status(400).json({ success: false, message: "No resume file provided" });
    }

    if (!jd_content) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: resume_url and jd_content are required." 
      });
    }
    
     const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
        
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
          resource_type: "auto",
          folder: "resumes" 
        });
        const securePdfUrl = cloudinaryResponse.secure_url;
    
        console.log(securePdfUrl);

    console.log(`[NODE] Forwarding Analysis Request to Python AI...`);


    const pythonResponse = await axios.post(`${PYTHON_AI_SERVICE_URL}/api/jd-matcher/analyze`, {
      resume_url:securePdfUrl,
      jd_content
    });

   
    return res.status(200).json(pythonResponse.data);

  } catch (error) {
    console.error("[NODE] Error in analyzeGaps:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze resume gaps.",
      error: error.response?.data || error.message
    });
  }
};


export const tailorResume = async (req, res) => {
  try {
    const { action, feedback } = req.body;

    if (!action) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required field: action (start_tailoring, rewrite, accept)." 
      });
    }

    console.log(`[NODE] Forwarding Tailor Request (${action}) to Python AI...`);

    
    const pythonResponse = await axios.post(`${PYTHON_AI_SERVICE_URL}/api/jd-matcher/tailor`, {
      action,
      feedback: feedback || null
    });

    
    return res.status(200).json(pythonResponse.data);

  } catch (error) {
    console.error("[NODE] Error in tailorResume:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to tailor resume.",
      error: error.response?.data || error.message
    });
  }
};