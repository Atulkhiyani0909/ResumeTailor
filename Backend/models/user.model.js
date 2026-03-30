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
  }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);