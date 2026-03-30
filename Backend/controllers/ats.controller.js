import axios from 'axios';
import cloudinary from '../config/cloudinary.js';

export async function get_ats_score(req, res) {
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

    console.log(`Executing ATS check against: ${securePdfUrl}`);
    
   
   const pythonPayload = {
      resume_url: securePdfUrl,
      api_key: currentUser?.API_key_Gemini || null,
      clerk_id: currentUser?.clerkId || "anonymous_user" 
    };

    const pythonResponse = await axios.post('http://127.0.0.1:8000/api/calculate-score', pythonPayload);

    const atsData = pythonResponse.data;

    return res.status(200).json({
      success: true,
      resume_url: securePdfUrl,
      ats_data: atsData
    });

  } catch (error) {
    console.error("Controller Error (analyzeAndScoreResume):", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during ATS processing",
      error: error.message
    });
  }
}

export async function tailor_resume(req, res) {
  try {
    const currentUser = req.user; 
    const { user_choice } = req.body;
    
   
    if (user_choice === undefined || user_choice === null) {
      return res.status(400).json({ success: false, message: "Need User Choice" });
    }

    
    const pythonPayload = {
      resume_url: securePdfUrl,
      api_key: currentUser?.API_key_Gemini || null,
      clerk_id: currentUser?.clerkId || "anonymous_user" 
    };

    const pythonResponse = await axios.post('http://127.0.0.1:8000/api/tailor-resume', pythonPayload);
    
    const tailored_resume = pythonResponse.data;

    return res.status(200).json({
      success: true,
      tailored_resume: tailored_resume
    });

  } catch (error) {
    console.error("Controller Error (tailor_resume):", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during Tailoring Resume",
      error: error.message
    });
  }
}