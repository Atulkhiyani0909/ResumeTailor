import { Router } from "express";
import {get_ats_score,tailor_resume} from "../controllers/ats.controller.js";
import { uploadResume } from "../middleware/uploads.js";

const router = Router();

router.post('/analyze-resume',uploadResume,get_ats_score);
router.post('/tailor-resume',tailor_resume);

export default router;