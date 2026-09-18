import { useState, useEffect, useRef } from "react";
import { useResume } from "../hooks/useResume";
import { Sparkles } from "lucide-react";
import JobCard from "../components/JobCard.jsx"



const API_URL = import.meta.env.VITE_API_URL;

/* ---------------- Skeleton card (shown while loading) ---------------- */
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-neutral-200 p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-neutral-100 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-neutral-100 rounded w-2/5" />
          <div className="h-3 bg-neutral-100 rounded w-1/4" />
          <div className="h-3 bg-neutral-100 rounded w-1/3" />
        </div>
        <div className="w-11 h-11 rounded-full bg-neutral-100 shrink-0" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
        <div className="h-3 bg-neutral-100 rounded w-20" />
        <div className="h-8 bg-neutral-100 rounded-lg w-24" />
      </div>
    </div>
  );
}

/* ---------------- Engaging loading state ---------------- */
const loadingMessages = [
  "Reading your resume...",
  "Pulling out your top skills...",
  "Matching you against live job postings...",
  "Scoring each role against your profile...",
  "Checking experience requirements...",
  "Almost there, ranking your best matches...",
];

function LoadingState({ role }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % loadingMessages.length);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 rounded-xl border border-violet-100 bg-violet-50 px-5 py-4">
        <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center shrink-0 animate-pulse">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-violet-700 transition-opacity duration-300">
            {loadingMessages[msgIndex]}
          </p>
          {role && (
            <p className="text-xs text-violet-500 mt-0.5">
              Finding roles like "{role}" that fit your resume
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

/* ---------------- Main page ---------------- */
// Key used to match a recommended job against an existing application
const jobKeyOf = (job) => `${job.platform}:${job.jobKey}`;

export default function Recommendations() {
  const [pendingApplication, setPendingApplication] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { resume, loading: resumeLoading } = useResume();
  const [activeRole, setActiveRole] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalJobs: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [isPro, setIsPro] = useState(false);

  // Load existing applications once so we can mark already-applied jobs
  // as "Applied" even after a refresh, instead of re-fetching per card.
  const appliedKeysRef = useRef(new Set());

  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await fetch(`${API_URL}/api/jobs/applications`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          const keys = new Set(
            data.applications.map((a) => `${a.platform}:${a.jobId}`)
          );
          appliedKeysRef.current = keys;
        }
      } catch {
        // Non-fatal — cards will just default to "not applied" until clicked
      }
    }
    fetchApplications();
  }, []);

  const markApplied = (job) => {
    appliedKeysRef.current = new Set(appliedKeysRef.current).add(jobKeyOf(job));

    setJobs((prev) => {
      const next = prev.filter((j) => jobKeyOf(j) !== jobKeyOf(job));

      // If removing this job emptied the current page and another page
      // exists, move to it automatically instead of showing a dead end.
      if (next.length === 0 && pagination.hasNextPage) {
        setPage((p) => p + 1);
      }

      return next;
    });
  };

  // Automatically drive the search from the resume — no manual query entry
  useEffect(() => {
    if (resume?.preferredRoles?.length > 0 && !hasFetched.current) {
      hasFetched.current = true;
      setActiveRole(resume.preferredRoles[0]);
      setPage(1);
    }
  }, [resume]);

  useEffect(() => {
    if (!activeRole) return;
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_URL}/api/jobs/recommendations?page=${page}&limit=${PAGE_SIZE}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success) {
          const filteredJobs = data.jobs.filter(
            (job) => !appliedKeysRef.current.has(jobKeyOf(job))
          );
          setJobs(filteredJobs);
          setIsPro(data.isPro);   
          setPagination({
            totalJobs: data.totalJobs,
            totalPages: data.totalPages,
            hasNextPage: data.hasNextPage,
            hasPreviousPage: data.hasPreviousPage,
          });
        } else {
          setError("Couldn't load jobs right now.");
          setJobs([]);
        }
      } catch {
        setError("Something went wrong. Please try again.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
    // Intentionally NOT depending on appliedKeys — applying to a job
    // updates local state only (see markApplied) and must not
    // re-trigger a recommendations fetch.
  }, [activeRole, page]);


const handleApplied = async () => {
    if (!pendingApplication) return;

    try {
        const res = await fetch(`${API_URL}/api/jobs/applications`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                resume: resume?._id,
                jobId: pendingApplication.jobKey,
                company: pendingApplication.company,
                jobTitle: pendingApplication.title,
                location: pendingApplication.location,
                platform: pendingApplication.platform,
                jobUrl: pendingApplication.jobUrl,
                fitScore: pendingApplication.skillScore,
                aiReason: pendingApplication.aiReason,
            }),
        });

        const data = await res.json();

        if (!data.success) return;

        markApplied(pendingApplication);

        setPendingApplication(null);
        setShowConfirmModal(false);

    } catch (err) {
        console.error(err);
    }
};

const handleNotYet = () => {
  setPendingApplication(null);
  setShowConfirmModal(false);
};

  return (
    <main className="flex-1 px-10 py-8 max-w-3xl">
      <p className="text-sm text-neutral-500 mb-6">
        {loading
          ? "Finding jobs that match your resume..."
          : `${pagination.totalJobs} jobs matched to your resume`}
      </p>

      {/* Role chips — purely derived from the resume, not a free-text search */}
      {/* {resume?.preferredRoles?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {resume.preferredRoles.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              disabled={loading}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                activeRole === role
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      )} */}

      {resumeLoading && (
        <p className="text-sm text-neutral-400 py-8 text-center">Loading your resume...</p>
      )}

      {!resumeLoading && !resume && (
        <p className="text-sm text-neutral-400 py-8 text-center">
          Upload your resume first to get job recommendations.
        </p>
      )}

      {loading && <LoadingState role={activeRole} />}

      {!loading && error && <p className="text-sm text-red-500 py-8 text-center">{error}</p>}

      {!loading && !error && resume && jobs.length === 0 && (
        <p className="text-sm text-neutral-400 py-8 text-center">No jobs found for this role right now.</p>
      )}

      {!loading && (
        <div className="flex flex-col gap-3">
            {jobs.map((job) => (
            <JobCard
              key={jobKeyOf(job)}
              job={job}
              onApplicationCreated={({ job }) => {
                  setPendingApplication(job);
                  setShowConfirmModal(true);
              }}
            />
          ))}
        </div>
      )}

      {!loading && !isPro && jobs.length >= 5 && (
      <div className="mt-6 rounded-xl border border-violet-200 
                      bg-violet-50 p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-violet-100 
                        flex items-center justify-center mx-auto mb-3">
          <Sparkles size={18} className="text-violet-600" />
        </div>
        <h3 className="font-semibold text-violet-800 mb-1">
          You've seen your free recommendations!
        </h3>
        <p className="text-sm text-violet-600 mb-4">
          Upgrade to Pro to unlock unlimited job matches, 
          all platforms and study support.
        </p>
        <div className="flex flex-col items-center gap-2">
          <a  
            href="/pricing"
            className="bg-violet-600 text-white px-6 py-2.5 
                      rounded-lg text-sm font-semibold 
                      hover:bg-violet-700 transition-colors"
          >
            Upgrade to Pro — ₹59/month
          </a>
          <p className="text-xs text-violet-400">
            Or ₹399/year — save 43%
          </p>
        </div>
      </div>
    )}

      {/* Only show pagination for Pro users */}
    {!loading && !error && jobs.length > 0 && 
    pagination.totalPages > 1 && isPro && (  
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!pagination.hasPreviousPage}
          className="text-sm font-medium px-4 py-2 rounded-lg 
                    border border-neutral-200 disabled:opacity-40 
                    disabled:cursor-not-allowed hover:border-neutral-300"
        >
          Previous
        </button>
        <span className="text-xs text-neutral-400">
          Page {page} of {pagination.totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!pagination.hasNextPage}
          className="text-sm font-medium px-4 py-2 rounded-lg 
                    border border-neutral-200 disabled:opacity-40 
                    disabled:cursor-not-allowed hover:border-neutral-300"
        >
          Next
        </button>
      </div>
    )}

      {showConfirmModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl w-[420px] p-6 shadow-xl">

      <h2 className="text-xl font-semibold">
        Did you submit your application?
      </h2>

      <p className="text-neutral-500 text-sm mt-2">
        We'll update your application tracker based on your answer.
      </p>

      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={handleNotYet}
          className="border rounded-lg px-4 py-2 hover:bg-neutral-50"
        >
          Not Yet
        </button>

        <button
          onClick={handleApplied}
          className="bg-violet-600 text-white rounded-lg px-4 py-2 hover:bg-violet-700"
        >
          Yes
        </button>

      </div>

    </div>
  </div>
)}


  


    </main>
  );
}