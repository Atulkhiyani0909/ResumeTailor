import { Router } from "express";
import {get_ats_score,tailor_resume} from "../controllers/ats.controller.js";
import { uploadResume } from "../middleware/uploads.js";
import { syncClerkUser } from '../middleware/syncUser.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'; 

const router = Router();

router.post('/analyze-resume',ClerkExpressRequireAuth(),syncClerkUser,uploadResume,get_ats_score);
router.post('/tailor-resume', ClerkExpressRequireAuth() , syncClerkUser , tailor_resume);

export default router;