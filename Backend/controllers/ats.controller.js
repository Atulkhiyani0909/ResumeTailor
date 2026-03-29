import axios from 'axios';
import cloudinary from '../config/cloudinary.js';

export  async function get_ats_score(req, res) {
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
    
    const pythonResponse = await axios.post('http://127.0.0.1:8000/api/calculate-score', {
      resume_url: securePdfUrl
    });

    console.log(pythonResponse);
    
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

export  async function tailor_resume(req,res){
 try {
  const {user_choice} = req.body;
  if(!user_choice){
    return res.status(400).json({ success: false, message: "Need User Choice" });
  }

   const pythonResponse = await axios.post('http://127.0.0.1:8000/api/tailor-resume', {
      user_choice : user_choice
    });

    console.log(pythonResponse);
    
    const tailored_resume = pythonResponse.data;

    return res.status(200).json({
      success: true,
      tailored_resume : tailored_resume
    });

 } catch (error) {
  console.error("Controller Error :", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during Tailoring Resume ",
      error: error.message
    });
 }
}