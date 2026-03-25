import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    company_name: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        default: "Not Specified" 
    },
    description: { 
        type: String, 
        required: true 
    },
    source_from: { 
        type: String, 
        requried:true
    },
    apply_link: { 
        type: String, 
        required: true 
    },
    recuriter_email: { 
        type: String,
        default: null 
    },
    embeddings: { 
        type: [Number], 
        select: false   
    },
    posted_on: { 
        type: Date 
    }
}, {
    timestamps: true
});


const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

export default Job;