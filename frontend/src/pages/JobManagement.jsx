import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export default function JobManagement() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkingJob, setCheckingJob] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getJSON("/api/admin/jobs");

        setJobs(data.jobs || []);
      } catch (err) {
        console.error("Failed to load admin jobs:", err);
        setError(err.message || "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      job.title?.toLowerCase().includes(searchText) ||
      job.company?.toLowerCase().includes(searchText);

    const matchesPlatform =
      platform === "all" ||
      job.platform?.toLowerCase() === platform.toLowerCase();

    return matchesSearch && matchesPlatform;
  });

  // Get unique platforms from jobs
  const platforms = [
    ...new Set(
      jobs
        .map((job) => job.platform)
        .filter(Boolean)
        .map((item) => item.toLowerCase())
    ),
  ];

  // Delete job
  const handleDeleteJob = async () => {
    if (!checkingJob) return;

    try {
      setDeleting(true);
      setError("");

      const res = await fetch(
        `${API_URL}/api/admin/jobs/${checkingJob._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete job.");
      }

      // Remove deleted job from current table
      setJobs((currentJobs) =>
        currentJobs.filter((job) => job._id !== checkingJob._id)
      );

      // Close both popups
      setShowDeleteConfirm(false);
      setCheckingJob(null);
    } catch (err) {
      console.error("Delete job error:", err);
      setError(err.message || "Failed to delete job.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 md:px-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition mb-3"
            >
              <ArrowLeft size={16} />
              Back to Analytics
            </button>

            <h1 className="text-2xl font-bold text-neutral-900">
              Job Management
            </h1>

            <p className="text-sm text-neutral-400 mt-1">
              Manage jobs in Matchora
            </p>
          </div>

          {/* Add New Job */}
          <button
            disabled
            className="px-4 py-2.5 rounded-lg bg-neutral-200 text-neutral-400 text-sm font-medium cursor-not-allowed"
          >
            + Add New Job
          </button>
        </div>

        {/* Search + Filters */}
        <div className="mt-8 bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-3">

            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm outline-none focus:border-neutral-400"
              />

              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>

            {/* Platform */}
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-4 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white outline-none"
            >
              <option value="all">All Platforms</option>

              {platforms.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value="active"
              disabled
              className="px-4 py-2.5 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-500"
            >
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Jobs Table */}
        <div className="mt-6 bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-sm text-neutral-400">
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-10 text-center text-sm text-neutral-400">
              No jobs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500">
                      Job Title
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500">
                      Company
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500">
                      Platform
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500">
                      Location
                    </th>

                    <th className="text-right px-5 py-3 text-xs font-semibold text-neutral-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredJobs.map((job) => (
                    <tr
                      key={job._id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      {/* Job Title */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-neutral-900">
                          {job.title || "Untitled Job"}
                        </p>
                      </td>

                      {/* Company */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-neutral-700">
                          {job.company || "—"}
                        </p>
                      </td>

                      {/* Platform */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-neutral-600">
                          {job.platform || "—"}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-neutral-600">
                          {job.location || "—"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setCheckingJob(job);
                            setShowDeleteConfirm(false);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
                        >
                          Open
                          <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Result Count */}
        {!loading && (
          <p className="text-xs text-neutral-400 mt-3">
            Showing {filteredJobs.length} of {jobs.length} active jobs
          </p>
        )}
      </div>

      {/* Check Job Status Popup */}
      {checkingJob && !showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Check Job Status
            </h2>

            <p className="text-sm text-neutral-500 mt-2">
              Is everything okay with this job?
            </p>

            <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <p className="text-sm font-medium text-neutral-900">
                {checkingJob.title}
              </p>

              <p className="text-xs text-neutral-500 mt-1">
                {checkingJob.company}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {/* Keep Job */}
              <button
                onClick={() => {
                  setCheckingJob(null);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
              >
                Yes, Keep Job
              </button>

              {/* Delete */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
              >
                No, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {checkingJob && showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Delete this job?
            </h2>

            <p className="text-sm text-neutral-500 mt-2">
              This job will be permanently removed from Matchora.
            </p>

            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
              <p className="text-sm font-medium text-neutral-900">
                {checkingJob.title}
              </p>

              <p className="text-xs text-neutral-500 mt-1">
                {checkingJob.company}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {/* Cancel */}
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Confirm Delete */}
              <button
                onClick={handleDeleteJob}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}