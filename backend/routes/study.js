import express from "express";
import { getStudyResources } from "../controllers/studyController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requirePro } from "../middleware/requirePro.js";

const router = express.Router();

// GET /api/study/resources
// Pro users only
router.get("/resources", authMiddleware, requirePro, getStudyResources);

export default router;