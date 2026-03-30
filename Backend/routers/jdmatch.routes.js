import express from 'express';
import { analyzeGaps, tailorResume } from '../controllers/jdmatch.controller.js';
import { uploadResume } from "../middleware/uploads.js";
import { syncClerkUser } from '../middleware/syncUser.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'; 

const router = express.Router();


router.post('/analyze',ClerkExpressRequireAuth(),syncClerkUser,uploadResume ,analyzeGaps);
router.post('/tailor', ClerkExpressRequireAuth(),syncClerkUser,tailorResume);

export default router;