import axios from 'axios';

const PYTHON_SERVICE_URL = `${process.env.PYTHON_BACKEND}`;

export async function draftEmail(req, res) {
  try {
    const currentUser = req.user; 
    
    // Catch the session_id sent from React's JSON body
    const { raw_jd_content, raw_resume_content, receiver_email, session_id } = req.body;

    // Add session_id to the payload heading to Python
    const pythonPayload = {
      clerk_id: currentUser.clerkId,
      api_key: currentUser.API_key_Gemini,
      email_user: currentUser.email_user, 
      email_pass: currentUser.email_pass,
      raw_jd_content,
      raw_resume_content,
      session_id: session_id || null 
    };

    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/agent/draft-email`, pythonPayload);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Draft Error:", error.message);
    return res.status(500).json({ success: false, message: "AI failed to draft email." });
  }
}

export async function approveAndSendEmail(req, res) {
  try {
    const currentUser = req.user;
    
   
    const { 
      email_subject, 
      email_content, 
      sender_email, 
      receiver_email,
      session_id 
    } = req.body;

    // Add session_id to the payload heading to Python
    const pythonPayload = {
      clerk_id: currentUser.clerkId,
      api_key: currentUser.API_key_Gemini,
      email_user: currentUser.email_user,
      email_pass: currentUser.email_pass,
      email_subject,    
      email_content,    
      sender_email,    
      receiver_email,   
      approve: true,
      resume_url: currentUser.resumeUrl,
      session_id: session_id || null 
    };

    const response = await axios.post(`${PYTHON_SERVICE_URL}/api/agent/approve-send`, pythonPayload);

    return res.status(200).json({
        success: true,
        message: "Email dispatched successfully",
        details: response.data
    });
  } catch (error) {
    console.error("Approval Error:", error.response?.data || error.message);
    return res.status(500).json({ 
        success: false, 
        message: "SMTP Dispatch failed. Check App Password." 
    });
  }
}