import express from 'express';
import { getAllJobs , getJobById , getMatchedJobs } from '../controllers/jobs.controllers.js';
import { uploadResume } from "../middleware/uploads.js";
import { syncClerkUser } from '../middleware/syncUser.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'; 

const router = express.Router();

router.get('/', ClerkExpressRequireAuth(),syncClerkUser,getAllJobs);
router.get('/:id', ClerkExpressRequireAuth(),syncClerkUser,getJobById);
router.post('/matched-jobs',ClerkExpressRequireAuth(),syncClerkUser ,uploadResume , getMatchedJobs)

export default router;