import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String,
    default: "Anonymous"
  },
  resumeUrl:{
    type:String
  },
  vectorized_resume_content:{
    type:[Number],
    select:false
  },
  API_key_Gemini:{
    type:String
  },
  email_user: {
    type: String,
    description: "The Gmail address used for SMTP login"
  },
  email_pass: {
    type: String,
    description: "The 16-digit Google App Password"
  }
  
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);