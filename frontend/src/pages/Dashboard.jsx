import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JobCard from "../components/JobCard.jsx";
import FeedbackModal from "../components/FeedbackModal.jsx";

import {
  Bell,
  Briefcase,
  ShieldCheck,
  Flame,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Send,
  FileText,
  Upload,
  CheckCircle2,
  TrendingUp,
  X,
  Mail,
  AlertCircle,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const WHATSAPP_SUPPORT_NUMBER =
  import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER;

const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL;

/* =========================================================
   SCORE RING
========================================================= */

function ScoreRing({ score = 0, size = 60 }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  const safeScore = Math.min(
    100,
    Math.max(0, Number(score) || 0)
  );

  const offset =
    circumference -
    (safeScore / 100) * circumference;

  const color =
    safeScore >= 85
      ? "#059669"
      : safeScore >= 70
      ? "#d97706"
      : "#dc2626";

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f0ee"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>

      <span className="absolute text-xs font-bold text-neutral-800">
        {safeScore}
      </span>
    </div>
  );
}

/* =========================================================
   JOB SKELETON
========================================================= */

function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-neutral-200" />

        <div className="min-w-0 flex-1">
          <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />

          <div className="mb-2 h-3 w-1/2 rounded bg-neutral-200" />

          <div className="h-3 w-2/5 rounded bg-neutral-200" />
        </div>

        <div className="hidden h-12 w-12 shrink-0 rounded-full bg-neutral-200 sm:block" />
      </div>

      <div className="mt-5 flex gap-2">
        <div className="h-7 w-20 rounded-lg bg-neutral-200" />

        <div className="h-7 w-24 rounded-lg bg-neutral-200" />
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  description,
  loading,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-neutral-50 transition-transform duration-300 group-hover:scale-125" />

      <div className="relative">
        <div
          className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>

        <p className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {loading ? "--" : value}
        </p>

        <p className="mt-1 text-sm font-medium text-neutral-700">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-[11px] leading-4 text-neutral-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const [jobs, setJobs] = useState([]);

  const [applications, setApplications] =
    useState([]);

  const [resumeScore, setResumeScore] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [pendingApplication, setPendingApplication] =
    useState(null);

  const [showConfirmModal, setShowConfirmModal] =
    useState(false);

  const [showFeedbackModal, setShowFeedbackModal] =
    useState(false);

  /* =========================================================
     APPLICATION SUBMIT STATE
  ========================================================= */

  const [applicationSubmitting, setApplicationSubmitting] =
    useState(false);

  const [applicationError, setApplicationError] =
    useState("");

  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        /* -----------------------------------------------------
           USER
        ----------------------------------------------------- */

        const meRes = await fetch(
          `${API_BASE}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        if (!meRes.ok) {
          throw new Error(
            "Please login again."
          );
        }

        const meData =
          await meRes.json();

        setUser(meData.user);

        /* -----------------------------------------------------
           APPLICATIONS
        ----------------------------------------------------- */

        const applicationsRes =
          await fetch(
            `${API_BASE}/api/jobs/applications`,
            {
              credentials: "include",
            }
          );

        if (!applicationsRes.ok) {
          throw new Error(
            "Unable to load applications."
          );
        }

        const applicationsData =
          await applicationsRes.json();

        const loadedApplications =
          applicationsData.applications || [];

        setApplications(
          loadedApplications
        );

        const appliedKeys =
          new Set(
            loadedApplications.map(
              (application) =>
                `${application.platform}:${application.jobId}`
            )
          );

        /* -----------------------------------------------------
           RECOMMENDED JOBS
        ----------------------------------------------------- */

        const jobsRes =
          await fetch(
            `${API_BASE}/api/jobs/recommendations`,
            {
              credentials: "include",
            }
          );

        if (!jobsRes.ok) {
          throw new Error(
            "Unable to load recommendations."
          );
        }

        const jobsData =
          await jobsRes.json();

        const filteredJobs =
          (jobsData.jobs || []).filter(
            (job) =>
              !appliedKeys.has(
                `${job.platform}:${job.jobKey}`
              )
          );

        setJobs(filteredJobs);

        /* -----------------------------------------------------
           RESUME
        ----------------------------------------------------- */

        try {
          const resumeRes =
            await fetch(
              `${API_BASE}/api/user/resume`,
              {
                credentials: "include",
              }
            );

          if (resumeRes.ok) {
            const resumeData =
              await resumeRes.json();

            setResumeScore(
              resumeData?.resume?.atsScore ??
                null
            );
          }
        } catch (resumeError) {
          console.log(
            "Resume loading error:",
            resumeError
          );

          setResumeScore(null);
        }
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================================================
     STATS
  ========================================================= */

  const topJobs = jobs.slice(0, 3);

  const appliedCount =
    applications.filter(
      (application) =>
        application.status === "Applied"
    ).length;

  const highMatchCount =
    jobs.filter(
      (job) =>
        (job.fitScore || job.skillScore || 0) >=
        90
    ).length;

  /* =========================================================
     APPLICATION HANDLER
  ========================================================= */

  const handleApplied = async () => {
    if (
      !pendingApplication ||
      applicationSubmitting
    ) {
      return;
    }

    try {
      setApplicationSubmitting(true);
      setApplicationError("");

      const payload = {
        jobId:
          pendingApplication.jobKey,

        company:
          pendingApplication.company,

        jobTitle:
          pendingApplication.title,

        location:
          pendingApplication.location,

        platform:
          pendingApplication.platform,

        jobUrl:
          pendingApplication.jobUrl,

        fitScore:
          pendingApplication.skillScore,

        aiReason:
          pendingApplication.aiReason,
      };

      console.log(
        "Creating application:",
        payload
      );

      const res = await fetch(
        `${API_BASE}/api/jobs/applications`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      /* -------------------------------------------------------
         TRY TO READ JSON RESPONSE
      ------------------------------------------------------- */

      let data = null;

      try {
        data = await res.json();
      } catch (jsonError) {
        console.warn(
          "Response was not JSON:",
          jsonError
        );
      }

      console.log(
        "Application API response:",
        {
          status: res.status,
          ok: res.ok,
          data,
        }
      );

      /* -------------------------------------------------------
         HTTP ERROR
      ------------------------------------------------------- */

      if (!res.ok) {
        setApplicationError(
          data?.message ||
            data?.error ||
            `Failed to create application (${res.status}).`
        );

        return;
      }

      /* -------------------------------------------------------
         BACKEND success:false
      ------------------------------------------------------- */

      if (data?.success === false) {
        setApplicationError(
          data?.message ||
            data?.error ||
            "Failed to create application."
        );

        return;
      }

      /* -------------------------------------------------------
         SUCCESS
      ------------------------------------------------------- */

      const createdApplication =
        data?.application || {
          jobId:
            pendingApplication.jobKey,

          platform:
            pendingApplication.platform,

          status: "Applied",
        };

      /* -------------------------------------------------------
         UPDATE APPLICATIONS
      ------------------------------------------------------- */

      setApplications((prev) => {
        const alreadyExists =
          prev.some(
            (application) =>
              application.jobId ===
                pendingApplication.jobKey &&
              application.platform ===
                pendingApplication.platform
          );

        if (alreadyExists) {
          return prev;
        }

        return [
          ...prev,
          createdApplication,
        ];
      });

      /* -------------------------------------------------------
         REMOVE JOB FROM RECOMMENDATIONS
      ------------------------------------------------------- */

      setJobs((prev) =>
        prev.filter(
          (job) =>
            !(
              job.platform ===
                pendingApplication.platform &&
              job.jobKey ===
                pendingApplication.jobKey
            )
        )
      );

      /* -------------------------------------------------------
         CLOSE MODAL
      ------------------------------------------------------- */

      setPendingApplication(null);

      setShowConfirmModal(false);

      setApplicationError("");
    } catch (err) {
      console.error(
        "Failed to create application:",
        err
      );

      setApplicationError(
        err?.message ||
          "Unable to create application. Please try again."
      );
    } finally {
      setApplicationSubmitting(false);
    }
  };

  /* =========================================================
     NOT YET
  ========================================================= */

  const handleNotYet = () => {
    if (applicationSubmitting) {
      return;
    }

    setPendingApplication(null);

    setShowConfirmModal(false);

    setApplicationError("");
  };

  /* =========================================================
     RESUME STATUS
  ========================================================= */

  const resumeStatus =
    resumeScore == null
      ? null
      : resumeScore >= 85
      ? {
          title: "Excellent",
          subtitle:
            "Your resume is highly competitive.",
          className:
            "text-emerald-600",
        }
      : resumeScore >= 70
      ? {
          title: "Good",
          subtitle:
            "A few improvements can make it stronger.",
          className:
            "text-amber-600",
        }
      : {
          title: "Needs Improvement",
          subtitle:
            "Improve your ATS score to get better matches.",
          className:
            "text-red-600",
        };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-[#fafafa] lg:flex-row">
        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 xl:px-10">
          {/* HEADER */}

          <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Your dashboard
                </p>
              </div>

              <h1 className="text-[22px] font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl">
                Welcome back
                {user?.name
                  ? `, ${user.name.split(" ")[0]}`
                  : ""}
                .
                <br />

                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Your next dream job is closer.
                </span>
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-5 text-neutral-500 sm:text-[15px]">
                Discover opportunities that
                match your skills, experience,
                and career goals.
              </p>
            </div>

            <button
              title="Notifications coming soon"
              disabled
              className="flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-300 shadow-sm sm:h-11 sm:w-11"
            >
              <Bell size={17} />
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-600">
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

              <p>{error}</p>
            </div>
          )}

          {/* QUICK INSIGHT */}

          {!loading && jobs.length > 0 && (
            <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 p-4 text-white shadow-lg shadow-violet-100 sm:mb-8 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {jobs.length} opportunities match
                    your profile
                  </p>

                  <p className="mt-0.5 text-xs text-violet-100">
                    We've selected these jobs
                    based on your resume and
                    skills.
                  </p>
                </div>

                <Link
                  to="/recommendations"
                  className="hidden shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-violet-600 transition hover:bg-violet-50 sm:flex"
                >
                  Explore
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

          {/* STATS */}

          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mb-10">
            <StatCard
              label="Matching Jobs"
              value={jobs.length}
              icon={Briefcase}
              iconClass="bg-violet-50 text-violet-600"
              description="Jobs matching your profile"
              loading={loading}
            />

            <StatCard
              label="Applied Jobs"
              value={appliedCount}
              icon={ShieldCheck}
              iconClass="bg-emerald-50 text-emerald-600"
              description="Applications in your tracker"
              loading={loading}
            />

            <StatCard
              label="High Match"
              value={highMatchCount}
              icon={Flame}
              iconClass="bg-orange-50 text-orange-600"
              description="90%+ compatibility"
              loading={loading}
            />
          </div>

          {/* RECOMMENDATIONS HEADER */}

          <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 sm:text-lg">
                  Top Recommendations
                </h2>

                <span className="hidden rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600 sm:inline-flex">
                  AI MATCHED
                </span>
              </div>

              <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                Personalized based on your resume
              </p>
            </div>

            <Link
              to="/recommendations"
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-violet-600 transition hover:text-violet-700 sm:text-sm"
            >
              View All
              <ChevronRight size={15} />
            </Link>
          </div>

          {/* JOB LIST */}

          <div className="space-y-3 sm:space-y-4">
            {loading && (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            )}

            {!loading &&
              jobs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-12 text-center sm:py-16">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                    <Briefcase size={24} />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-neutral-900 sm:text-lg">
                    No recommendations yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-5 text-neutral-500">
                    Upload your resume or update
                    your profile to receive
                    personalized job
                    recommendations.
                  </p>

                  <Link
                    to="/resume"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700"
                  >
                    <Upload size={15} />
                    Upload Resume
                  </Link>
                </div>
              )}

            {!loading &&
              topJobs.map((job) => (
                <JobCard
                  key={`${job.platform}:${job.jobKey}`}
                  job={job}
                  onApplicationCreated={({
                    job,
                  }) => {
                    setApplicationError("");

                    setApplicationSubmitting(
                      false
                    );

                    setPendingApplication(
                      job
                    );

                    setShowConfirmModal(
                      true
                    );
                  }}
                />
              ))}
          </div>

          {/* VIEW ALL */}

          {!loading && jobs.length > 0 && (
            <Link
              to="/recommendations"
              className="group mt-5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50/30 py-3.5 text-sm font-semibold text-violet-600 transition hover:border-violet-400 hover:bg-violet-50 sm:mt-6"
            >
              <Sparkles
                size={15}
                className="transition-transform group-hover:rotate-12"
              />

              View All Recommendations

              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </main>

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside className="w-full shrink-0 border-t border-neutral-200 bg-white px-4 py-5 sm:px-6 sm:py-6 lg:w-80 lg:border-l lg:border-t-0 lg:px-6 lg:py-8">
          {/* RESUME CARD */}

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  Resume Strength
                </p>

                <p className="mt-0.5 text-xs text-neutral-400">
                  ATS compatibility
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FileText size={17} />
              </div>
            </div>

            {resumeScore == null ? (
              <>
                <div className="rounded-xl bg-neutral-50 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-neutral-400 shadow-sm">
                    <Upload size={17} />
                  </div>

                  <p className="text-sm font-semibold text-neutral-800">
                    No resume uploaded
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Upload your resume to unlock
                    personalized matching.
                  </p>
                </div>

                <Link
                  to="/resume"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700"
                >
                  <Upload size={15} />
                  Upload Resume
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
                  <ScoreRing
                    score={resumeScore}
                    size={64}
                  />

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold ${resumeStatus.className}`}
                    >
                      {resumeStatus.title}
                    </p>

                    <p className="mt-1 text-xs leading-4 text-neutral-400">
                      ATS Resume Score
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-neutral-500">
                  {resumeStatus.subtitle}
                </p>

                <Link
                  to="/resume"
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700"
                >
                  <TrendingUp size={15} />
                  Improve Resume
                </Link>
              </>
            )}
          </div>

          {/* HELP */}

          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <p className="text-sm font-bold text-neutral-900">
                Need help?
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                We're here if you need anything.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* FEEDBACK */}

              <button
                onClick={() =>
                  setShowFeedbackModal(true)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50"
              >
                <MessageSquare size={15} />
                Share Feedback
              </button>

              {/* WHATSAPP */}

              {WHATSAPP_SUPPORT_NUMBER && (
                <a
                  href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 py-2.5 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <Send size={15} />
                  Chat on WhatsApp
                </a>
              )}

              {/* EMAIL */}

              {SUPPORT_EMAIL && (
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50/60 py-2.5 text-sm font-semibold text-violet-700 transition-all hover:border-violet-300 hover:bg-violet-50"
                >
                  <Mail size={15} />
                  Contact Support
                </a>
              )}
            </div>
          </div>

          {/* TRUST CARD */}

          <div className="mt-4 hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 lg:block">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
              <CheckCircle2 size={17} />
            </div>

            <p className="mt-4 text-sm font-bold text-neutral-900">
              Apply smarter
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Focus your time on jobs where your
              profile has the strongest match.
            </p>
          </div>
        </aside>
      </div>

      {/* =======================================================
          APPLICATION CONFIRMATION MODAL
      ======================================================= */}

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-[2px]"
          onClick={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !applicationSubmitting
            ) {
              handleNotYet();
            }
          }}
        >
          <div className="w-full max-w-[525px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <CheckCircle2 size={19} />
                </div>

                <h2 className="text-lg font-bold text-neutral-900">
                  Did you submit your application?
                </h2>
              </div>

              <button
                onClick={handleNotYet}
                disabled={
                  applicationSubmitting
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* BODY */}

            <div className="px-5 py-5 sm:px-6">
              <p className="text-sm leading-5 text-neutral-500">
                We'll update your application
                tracker based on your answer.
              </p>

              {/* JOB */}

              {pendingApplication?.title && (
                <div className="mt-4 rounded-xl bg-neutral-50 p-4">
                  <p className="truncate text-sm font-semibold text-neutral-800">
                    {pendingApplication.title}
                  </p>

                  {pendingApplication.company && (
                    <p className="mt-1 truncate text-xs text-neutral-400">
                      {pendingApplication.company}
                    </p>
                  )}

                  {pendingApplication.platform && (
                    <p className="mt-2 text-[11px] font-medium text-neutral-400">
                      {pendingApplication.platform}
                    </p>
                  )}
                </div>
              )}

              {/* APPLICATION ERROR */}

              {applicationError && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-red-600">
                      Failed to create application.
                    </p>

                    <p className="mt-1 break-words text-xs leading-5 text-red-500">
                      {applicationError}
                    </p>
                  </div>
                </div>
              )}

              {/* BUTTONS */}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  onClick={handleNotYet}
                  disabled={
                    applicationSubmitting
                  }
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Not Yet
                </button>

                <button
                  onClick={handleApplied}
                  disabled={
                    applicationSubmitting
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {applicationSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                      Saving...
                    </>
                  ) : (
                    "Yes, I Applied"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          FEEDBACK MODAL
      ======================================================= */}

      {showFeedbackModal && (
        <FeedbackModal
          onClose={() =>
            setShowFeedbackModal(false)
          }
        />
      )}
    </>
  );
}