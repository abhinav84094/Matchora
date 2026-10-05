import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  verifyAdmin,
  getKPIs,
  getGrowth,
  getJobsAnalytics,
  getFeedbackStats,
  deleteJob,
  getAdminJobs
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/verify", verifyAdmin);
router.get("/kpis", getKPIs);
router.get("/growth", getGrowth);
router.get("/jobs-analytics", getJobsAnalytics);
router.get("/feedback-stats", getFeedbackStats);
router.delete("/jobs/:id", deleteJob);
router.get("/jobs", getAdminJobs);



export default router;
