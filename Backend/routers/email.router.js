import express from 'express';
import { draftEmail, approveAndSendEmail } from '../controllers/email.controller.js';
import { syncClerkUser } from '../middleware/syncUser.js'; 
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();


router.post('/draft-email', ClerkExpressRequireAuth() ,syncClerkUser, draftEmail);
router.post('/approve-send',ClerkExpressRequireAuth() ,syncClerkUser, approveAndSendEmail);

export default router;