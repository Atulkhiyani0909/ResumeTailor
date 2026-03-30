import { User } from '../models/user.model.js'; 
import cloudinary from '../config/cloudinary.js';

export const updateUserProfile = async (req, res) => {
    try {
        const currentUser = req.user;

        
        const { API_key_Gemini, email_user, email_pass } = req.body;
        let updateData = {};

        if (API_key_Gemini) {
            updateData.API_key_Gemini = API_key_Gemini;
        }
        
       
        if (email_user) {
            updateData.email_user = email_user;
        }
        if (email_pass) {
            updateData.email_pass = email_pass;
        }

      
        if (req.file) {
            console.log(`[UPLOAD] Processing new resume: ${req.file.originalname}`);

            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;

            const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
                resource_type: "auto",
                folder: "resumes"
            });
            const securePdfUrl = cloudinaryResponse.secure_url;

            updateData.resumeUrl = securePdfUrl;
            updateData.vectorized_resume_content = [];
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "No data provided to update." });
        }

      
        const updatedUser = await User.findOneAndUpdate(
            currentUser._id, 
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found in database." });
        }

     
        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user: {
                resumeUrl: updatedUser.resumeUrl,
                API_key_Gemini: updatedUser.API_key_Gemini,
                email_user: updatedUser.email_user 
            }
        });

    } catch (error) {
        console.error("[USER UPDATE ERROR]:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const currentUser = req.user;

        
        res.status(200).json({
            success: true,
            user: {
                resumeUrl: currentUser.resumeUrl || null,
                API_key_Gemini: currentUser.API_key_Gemini || '',
                email_user: currentUser.email_user || '', 
            }
        });
    } catch (error) {
        console.error("[GET PROFILE ERROR]:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};