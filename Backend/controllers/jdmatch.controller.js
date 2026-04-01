import axios from 'axios';
import cloudinary from '../config/cloudinary.js';

const PYTHON_AI_SERVICE_URL = `${process.env.PYTHON_BACKEND}`;

export const analyzeGaps = async (req, res) => {
  try {
    // Catch the session_id sent from React's FormData
    const { jd_content, session_id } = req.body;
    
    const currentUser = req.user; 
    let securePdfUrl = null;

    if (!jd_content) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required field: jd_content is required." 
      });
    }

    if (req.file) {
      console.log("[NODE] New file uploaded. Processing to Cloudinary...");
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "resumes" 
      });
      securePdfUrl = cloudinaryResponse.secure_url;
    } 
    else if (currentUser && currentUser.resumeUrl) {
      console.log("[NODE] No file uploaded. Using saved Base Resume from profile...");
      securePdfUrl = currentUser.resumeUrl;
    } 
    else {
      return res.status(400).json({ 
        success: false, 
        message: "Please upload a resume or save a Base Resume in your Secrets profile." 
      });
    }

    console.log(`[NODE] Forwarding Analysis Request to Python AI for: ${securePdfUrl}`);

    // Add session_id to the payload heading to Python
    const pythonPayload = {
      resume_url: securePdfUrl,
      api_key: currentUser?.API_key_Gemini || null,
      clerk_id: currentUser?.clerkId || "anonymous_user",
      jd_content: jd_content,
      session_id: session_id || null
    };

    const pythonResponse = await axios.post(`${PYTHON_AI_SERVICE_URL}/api/jd-matcher/analyze`, pythonPayload);

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
    const currentUser = req.user;
    
    // Catch the session_id sent from React's JSON body
    const { action, feedback, session_id } = req.body;

    if (!action) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required field: action (start_tailoring, rewrite, accept)." 
      });
    }

    console.log(`[NODE] Forwarding Tailor Request (${action}) to Python AI...`);

    // Add session_id to the payload heading to Python
    const pythonPayload = {
      action: action,
      api_key: currentUser?.API_key_Gemini || null,
      clerk_id: currentUser?.clerkId || "anonymous_user",
      feedback: feedback || null,
      session_id: session_id || null
    };

    const pythonResponse = await axios.post(`${PYTHON_AI_SERVICE_URL}/api/jd-matcher/tailor`, pythonPayload);

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