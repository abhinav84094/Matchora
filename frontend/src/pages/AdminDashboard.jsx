import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import {
  Users, UserCheck, Briefcase, ClipboardList, FileText,
  MessageSquare, Star, TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [jobsAnalytics, setJobsAnalytics] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [error, setError] = useState("");


  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getJSON("/api/admin/kpis").then((d) => setKpis(d.kpis)),
      getJSON("/api/admin/growth?days=30").then((d) => setGrowth(d.growth)),
      getJSON("/api/admin/jobs-analytics").then((d) => setJobsAnalytics(d.jobsAnalytics)),
      getJSON("/api/admin/feedback-stats").then((d) => setFeedbackStats(d.feedbackStats)),
    ]).catch((err) => setError(err.message || "Failed to load analytics."));
  }, []);

  return (
    <main className="flex-1 px-10 py-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Matchora Admin Analytics
          </h1>

          <p className="text-sm text-neutral-400 mt-1">
            Internal, admin-only view.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/jobs")}
          className="px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition"
        >
          Job Management
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        <KpiCard icon={Users} label="Total Users" value={kpis?.totalUsers} tint="bg-violet-100 text-violet-600" />
        <KpiCard icon={UserCheck} label="Active Users (30d)" value={kpis?.activeUsers30d} tint="bg-emerald-100 text-emerald-600" />
        <KpiCard icon={Briefcase} label="Total Jobs" value={kpis?.totalJobs} tint="bg-amber-100 text-amber-600" />
        <KpiCard icon={ClipboardList} label="Applications" value={kpis?.totalApplications} tint="bg-blue-100 text-blue-600" />
        <KpiCard icon={FileText} label="Resumes" value={kpis?.totalResumes} tint="bg-rose-100 text-rose-600" />
      </div>

      {/* Growth Analytics */}
      <SectionHeading icon={TrendingUp} title="Growth Analytics" subtitle="Last 30 days" />

      <div className="grid md:grid-cols-3 gap-4">
        <GrowthChart title="User Growth" data={growth?.userGrowth} color="#7c3aed" />
        <GrowthChart title="Applications Over Time" data={growth?.applicationsOverTime} color="#059669" />
        <GrowthChart title="Jobs Added Over Time" data={growth?.jobsOverTime} color="#d97706" />
      </div>

      {/* Job Analytics */}
      <SectionHeading icon={Briefcase} title="Job Analytics" />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <p className="text-sm font-semibold text-neutral-900 mb-4">Jobs by Platform</p>
          {jobsAnalytics ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={jobsAnalytics.byPlatform}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeleton />
          )}
          <p className="text-xs text-neutral-400 mt-3">
            Jobs already stored in the database appear here. No scraper is currently scheduled.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-neutral-900">Top 10 Companies</p>
            {jobsAnalytics && (
              <span className="text-xs text-neutral-400">
                {jobsAnalytics.jobsToday} jobs added today
              </span>
            )}
          </div>

          {jobsAnalytics ? (
            <div className="flex flex-col gap-2">
              {jobsAnalytics.topCompanies.map((c) => (
                <div key={c.company} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700 truncate">{c.company}</span>
                  <span className="text-neutral-400 font-medium shrink-0 ml-2">{c.count}</span>
                </div>
              ))}
              {jobsAnalytics.topCompanies.length === 0 && (
                <p className="text-sm text-neutral-400">No job data yet.</p>
              )}
            </div>
          ) : (
            <ChartSkeleton />
          )}
        </div>
      </div>

      {/* Feedback stats */}
      <SectionHeading icon={MessageSquare} title="Feedback" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KpiCard icon={MessageSquare} label="Total Feedback" value={feedbackStats?.totalFeedback} tint="bg-violet-100 text-violet-600" />
        <KpiCard icon={ClipboardList} label="Pending" value={feedbackStats?.pendingFeedback} tint="bg-amber-100 text-amber-600" />
        <KpiCard
          icon={Star}
          label="Avg Rating"
          value={feedbackStats?.avgRating != null ? feedbackStats.avgRating.toFixed(1) : undefined}
          tint="bg-emerald-100 text-emerald-600"
        />
        <KpiCard
          icon={TrendingUp}
          label="Avg NPS"
          value={feedbackStats?.avgNps != null ? feedbackStats.avgNps.toFixed(1) : undefined}
          tint="bg-blue-100 text-blue-600"
        />
      </div>
    </main>
  );
}

/* ---------------- Sub-components ---------------- */

function KpiCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tint}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-bold text-neutral-900 mt-3">
        {value !== undefined && value !== null ? value : (
          <span className="inline-block w-10 h-6 bg-neutral-100 rounded animate-pulse" />
        )}
      </p>
      <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 mt-10 mb-4">
      <Icon size={16} className="text-neutral-400" />
      <h2 className="font-semibold text-neutral-900">{title}</h2>
      {subtitle && <span className="text-xs text-neutral-400">— {subtitle}</span>}
    </div>
  );
}

function GrowthChart({ title, data, color }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 p-5">
      <p className="text-sm font-semibold text-neutral-900 mb-4">{title}</p>
      {data ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickFormatter={(d) => d.slice(5)}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ChartSkeleton />
      )}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-[180px] bg-neutral-50 rounded-lg animate-pulse" />;
}
