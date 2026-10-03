import { useState, useEffect, useMemo } from "react";
import {
  MapPin, ClipboardList, ExternalLink,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ;

// Matches the real status enum on the Application model
const STATUS_TABS = [
  // { key: "all", label: "All" },
  // { key: "Saved", label: "Saved" },
  { key: "Applied", label: "Applied" },
  // { key: "Viewed", label: "Viewed" },
  // { key: "Interview", label: "Interview" },
  // { key: "Offer", label: "Offer" },
  // { key: "Rejected", label: "Rejected" },
];

const STATUS_STYLES = {
  Saved: "bg-neutral-100 text-neutral-600",
  Applied: "bg-blue-50 text-blue-700",
  Viewed: "bg-purple-50 text-purple-700",
  Interview: "bg-amber-50 text-amber-700",
  Offer: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-600",
};

const PLATFORM_LABELS = {
  linkedin: "LinkedIn",
  naukri: "Naukri",
  indeed: "Indeed",
  internshala: "Internshala",
  foundit: "Foundit",
};

function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || "bg-neutral-100 text-neutral-600";
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${style}`}>
      {status || "Unknown"}
    </span>
  );
}

function ApplicationCard({ app }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-5 flex items-start gap-4">
      <div
        className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white font-medium text-sm"
        style={{ background: "#7c3aed" }}
      >
        {app.company?.[0] || "?"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium">{app.jobTitle}</h3>
            <p className="text-sm text-neutral-500 mt-0.5">{app.company}</p>
          </div>
          <StatusPill status={app.status} />
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
          {app.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {app.location}
            </span>
          )}
          {app.platform && (
            <span>{PLATFORM_LABELS[app.platform] || app.platform}</span>
          )}
          {typeof app.fitScore === "number" && app.fitScore > 0 && (
            <span>{app.fitScore}% match</span>
          )}
          {app.createdAt && (
            <span>Saved {new Date(app.createdAt).toLocaleDateString()}</span>
          )}
        </div>

        {app.jobUrl && (
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 mt-3 hover:underline"
          >
            View original listing <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

function ApplicationSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 p-5 animate-pulse flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-neutral-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-neutral-100 rounded" />
        <div className="h-3 w-1/4 bg-neutral-100 rounded" />
        <div className="h-3 w-1/2 bg-neutral-100 rounded" />
      </div>
    </div>
  );
}

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/jobs/applications`, { credentials: "include" });
        if (!res.ok) throw new Error("Could not load your applications");
        const data = await res.json();
        setApplications(data?.applications || []);
      } catch (err) {
        setError(err.message || "Something went wrong loading your applications");
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  const counts = useMemo(() => {
    const c = { all: applications.length };
    for (const tab of STATUS_TABS) {
      if (tab.key === "all") continue;
      c[tab.key] = applications.filter((a) => a.status === tab.key).length;
    }
    return c;
  }, [applications]);

  const filtered =
    activeTab === "all" ? applications : applications.filter((a) => a.status === activeTab);

  return (
    <main className="flex-1 px-10 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold leading-tight">Applications</h1>
        <p className="text-sm text-neutral-400 mt-1">Track every job you've applied to, in one place.</p>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-neutral-100 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm px-3 py-2 border-b-2 -mb-px transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-violet-600 text-violet-600 font-medium"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={`text-[11px] rounded-full px-1.5 ${
                  activeTab === tab.key ? "bg-violet-50 text-violet-600" : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 text-red-700 text-sm px-4 py-3 mb-6">
          {error}. Try refreshing the page.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {loading && (
          <>
            <ApplicationSkeleton />
            <ApplicationSkeleton />
            <ApplicationSkeleton />
          </>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-14 border border-dashed border-neutral-200 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={18} />
            </div>
            <p className="text-sm font-medium text-neutral-700">
              {activeTab === "all" ? "No applications yet" : `No ${activeTab.toLowerCase()} applications`}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Jobs you save or apply to from your recommendations will show up here.
            </p>
          </div>
        )}

        {!loading &&
          filtered.map((app) => (
            <ApplicationCard key={app._id} app={app} />
          ))}
      </div>
    </main>
  );
}