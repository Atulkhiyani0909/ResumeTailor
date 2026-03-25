import express from 'express';
import { getAllJobs, getJobById } from '../controllers/jobs.controllers.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/:id', getJobById);

export default router;