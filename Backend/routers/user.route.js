import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'; 
import { updateUserProfile , getUserProfile } from '../controllers/user.controller.js';
import { uploadResume } from '../middleware/uploads.js';
import { syncClerkUser } from '../middleware/syncUser.js';

const router = express.Router();


router.patch('/profile', ClerkExpressRequireAuth(), syncClerkUser , uploadResume, updateUserProfile);
router.get('/profile',ClerkExpressRequireAuth(), syncClerkUser, getUserProfile);

export default router;