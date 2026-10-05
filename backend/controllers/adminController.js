import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Resume from "../models/Resume.js";
import Feedback from "../models/Feedback.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// GET /api/admin/verify
// Lightweight check the frontend can call to decide whether to render
// the admin route at all. adminMiddleware has already run by this point,
// so reaching this handler means the user is an admin.
export const verifyAdmin = (req, res) => {
  res.status(200).json({ success: true, isAdmin: true });
};

// GET /api/admin/kpis
export const getKPIs = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * DAY_MS);

    const [
      totalUsers,
      activeUsers30d,
      totalJobs,
      totalApplications,
      totalResumes,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } }),
      Job.countDocuments({ status: "active" }),
      Application.countDocuments(),
      Resume.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      kpis: {
        totalUsers,
        activeUsers30d,
        totalJobs,
        totalApplications,
        totalResumes,
      },
    });
  } catch (err) {
    console.error("getKPIs error:", err);
    res.status(500).json({ success: false, message: "Failed to load KPIs." });
  }
};

// Groups documents of a model by day over the last `days` days, using the
// given date field (defaults to createdAt). Returns a dense array — every
// day in the range is present, even if the count is 0.
async function countByDay(Model, days, dateField = "createdAt") {
  const since = new Date(Date.now() - days * DAY_MS);

  const rows = await Model.aggregate([
    { $match: { [dateField]: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const byDate = new Map(rows.map((r) => [r._id, r.count]));

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: byDate.get(key) || 0 });
  }

  return result;
}

// GET /api/admin/growth?days=30
export const getGrowth = async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 90);

    const [userGrowth, applicationsOverTime, jobsOverTime] = await Promise.all([
      countByDay(User, days),
      countByDay(Application, days),
      countByDay(Job, days),
    ]);

    res.status(200).json({
      success: true,
      growth: { userGrowth, applicationsOverTime, jobsOverTime },
    });
  } catch (err) {
    console.error("getGrowth error:", err);
    res.status(500).json({ success: false, message: "Failed to load growth analytics." });
  }
};

// GET /api/admin/jobs-analytics
export const getJobsAnalytics = async (req, res) => {
  try {
    const [byPlatform, topCompanies, jobsToday] = await Promise.all([
      Job.aggregate([
        { $group: { _id: "$platform", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Job.aggregate([
        { $group: { _id: "$company", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Job.countDocuments({ createdAt: { $gte: new Date(Date.now() - DAY_MS) } }),
    ]);

    res.status(200).json({
      success: true,
      jobsAnalytics: {
        byPlatform: byPlatform.map((p) => ({ platform: p._id, count: p.count })),
        topCompanies: topCompanies.map((c) => ({ company: c._id, count: c.count })),
        jobsToday,
      },
    });
  } catch (err) {
    console.error("getJobsAnalytics error:", err);
    res.status(500).json({ success: false, message: "Failed to load job analytics." });
  }
};

// GET /api/admin/feedback-stats
export const getFeedbackStats = async (req, res) => {
  try {
    const [totalFeedback, pendingFeedback, ratingAgg, npsAgg] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: "New" }),
      Feedback.aggregate([
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Feedback.aggregate([
        { $group: { _id: null, avgNps: { $avg: "$npsScore" }, avgRating: { $avg: "$rating" } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      feedbackStats: {
        totalFeedback,
        pendingFeedback,
        ratingDistribution: ratingAgg.map((r) => ({ rating: r._id, count: r.count })),
        avgRating: npsAgg[0]?.avgRating ?? null,
        avgNps: npsAgg[0]?.avgNps ?? null,
      },
    });
  } catch (err) {
    console.error("getFeedbackStats error:", err);
    res.status(500).json({ success: false, message: "Failed to load feedback stats." });
  }
};





// GET /api/admin/jobs
export const getAdminJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: "active" })
      .sort({ postedDate: -1 })
      .select(
        "_id title company location platform jobUrl postedDate requiredSkills requiredExperienceMonths status"
      )
      .lean();

    res.status(200).json({
      success: true,
      jobs,
    });
  } catch (err) {
    console.error("getAdminJobs error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load jobs.",
    });
  }
};

// DELETE /api/admin/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedJob = await Job.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
      jobId: deletedJob._id,
    });
  } catch (err) {
    console.error("deleteJob error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete job.",
    });
  }
};