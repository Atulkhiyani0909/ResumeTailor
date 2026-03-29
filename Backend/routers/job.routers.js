import express from 'express';
import { getAllJobs , getJobById , getMatchedJobs } from '../controllers/jobs.controllers.js';
import { uploadResume } from "../middleware/uploads.js";

const router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/matched-jobs', uploadResume , getMatchedJobs)

export default router;