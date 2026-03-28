import express from 'express';
import { analyzeGaps, tailorResume } from '../controllers/jdmatch.controller.js';
import { uploadResume } from "../middleware/uploads.js";

const router = express.Router();


router.post('/analyze',uploadResume ,analyzeGaps);
router.post('/tailor', tailorResume);

export default router;