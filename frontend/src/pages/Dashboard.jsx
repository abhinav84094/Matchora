import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, FileText, GraduationCap, Mail, MessageSquare,
  ScanSearch, Send, Sparkles, Target, Trophy, Upload,
  RefreshCw, AlertCircle, TrendingUp,
} from "lucide-react";
import FeedbackModal from "../components/FeedbackModal.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;
const WHATSAPP_SUPPORT_NUMBER = import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER;

function OpportunitySection() {
  const opportunities = [
    { icon: Trophy, title: "Hackathons", description: "Upcoming coding events and challenges" },
    { icon: GraduationCap, title: "Career Programs", description: "Inhouse programs and hiring challenges" },
  ];

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-bold tracking-tight text-neutral-900">Beyond job applications</h2>
      <p className="mt-1 text-sm text-neutral-500">More ways to grow your career</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {opportunities.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><Icon size={21} /></div>
            <h3 className="mt-4 text-sm font-semibold text-neutral-900">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
            <span className="mt-4 inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-500 ring-1 ring-neutral-200">Coming soon</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function NoResumeContent() {
  const steps = [
    { icon: FileText, title: "Upload", description: "Add your resume" },
    { icon: ScanSearch, title: "Analyze", description: "Understand your skills" },
    { icon: Target, title: "Match", description: "Find best-fit jobs" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="rounded-2xl bg-[#141414] p-5 text-white sm:p-7 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">Get started</p>
        <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2.1rem]">Your next opportunity starts with your resume.</h1>
        <p className="mt-4 text-sm leading-6 text-neutral-400 sm:text-base">Upload your resume and let Matchora identify jobs aligned with your skills, projects, and experience.</p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link to="/resume" className="inline-flex min-h-12 w-full flex-1 items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400">
            <Upload size={18} /> Upload Your Resume <ArrowRight size={18} />
          </Link>
          <div className="shrink-0 text-center sm:text-left">
            <p className="text-xs text-neutral-400">Don't have a resume?</p>
            <p className="mt-1 text-sm font-semibold text-violet-400">Create Resume <span aria-hidden="true">↗</span></p>
            <p className="mt-1 text-xs text-neutral-500">Coming soon</p>
          </div>
        </div>
        <p className="mt-5 text-xs text-neutral-400">PDF only · Max 5 MB · AI-powered resume analysis</p>
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-bold text-neutral-900">How Matchora works</h2>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-6">
          {steps.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex min-w-0 flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Icon size={22} /></div>
              <h3 className="mt-3 text-sm font-semibold text-neutral-900">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{description}</p>
            </div>
          ))}
        </div>
      </section>
      <OpportunitySection />
    </div>
  );
}

function ResumeScore({ score }) {
  if (score == null) return null;
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const label = value >= 85 ? "Excellent" : value >= 70 ? "Good" : "Room to improve";
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <span className="text-xl font-bold">{value}</span><span className="text-[10px]">/ 100</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Resume ATS score</p>
          <h3 className="mt-1 text-lg font-bold text-neutral-900">{label}</h3>
          <p className="mt-1 text-xs text-neutral-500">Review your analysis and discover ways to strengthen your resume.</p>
        </div>
      </div>
      <Link to="/resume" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800"><TrendingUp size={16} /> View resume insights <ArrowRight size={15} /></Link>
    </section>
  );
}

function ResumeContent({ resumeScore }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Sparkles size={22} /></span>
          <div className="min-w-0">
            <h2 className="font-bold text-neutral-900">Your personalized matches</h2>
            <p className="mt-1 text-sm text-neutral-500">See the full list of recommended opportunities.</p>
          </div>
        </div>
        <Link to="/recommendations" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700">View matches <ArrowRight size={16} /></Link>
      </section>
      <ResumeScore score={resumeScore} />
      <OpportunitySection />
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeError, setResumeError] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function loadProfile() {
      setResumeLoading(true);
      setResumeError("");
      try {
        const meRes = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include", signal });
        if (!meRes.ok) throw new Error("Please sign in again to view your dashboard.");
        const meData = await meRes.json();
        if (signal.aborted) return;
        setUser(meData.user || null);

        const resumeRes = await fetch(`${API_BASE}/api/user/resume`, { credentials: "include", signal });
        if (resumeRes.status === 404) {
          if (!signal.aborted) setResume(null);
        } else if (!resumeRes.ok) {
          throw new Error("Unable to load your resume. Please try again.");
        } else {
          const resumeData = await resumeRes.json();
          if (!signal.aborted) setResume(resumeData?.resume || null);
        }
      } catch (err) {
        if (!signal.aborted) setResumeError(err.message || "Unable to load your dashboard.");
      } finally {
        if (!signal.aborted) setResumeLoading(false);
      }
    }
    loadProfile();
    return () => controller.abort();
  }, [refreshKey]);

  const hasResume = Boolean(resume) && !resumeLoading && !resumeError;

  return (
    <>
      <div className="min-h-full w-full bg-[#fafafa]">
        <div className={`mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:gap-8 lg:px-8 xl:px-10 ${hasResume ? "lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_280px]" : ""}`}>
          <main className="min-w-0">
            {(resumeLoading || resumeError || resume) && (
              <header className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700"><Sparkles size={13} /> Your workspace</div>
                  <h1 className="text-[clamp(1.7rem,3vw,2.5rem)] font-bold leading-tight tracking-tight text-neutral-900">{user?.name ? `Hello, ${user.name.split(" ")[0]}!` : "Welcome to Matchora"}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">{resume ? "Your job search, organized around opportunities that fit your profile." : "Your job search starts here. Add your resume to unlock personalized matches."}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setRefreshKey((n) => n + 1)} disabled={resumeLoading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-60" aria-label="Refresh dashboard">
                    <RefreshCw size={17} className={resumeLoading ? "animate-spin" : ""} /><span className="sm:hidden">Refresh</span>
                  </button>
                </div>
              </header>
            )}
            {resumeLoading ? (
              <div role="status" className="space-y-4"><div className="h-64 animate-pulse rounded-2xl bg-neutral-100" /><div className="h-44 animate-pulse rounded-2xl bg-neutral-100" /></div>
            ) : resumeError ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                <div className="flex items-start gap-2"><AlertCircle size={18} className="shrink-0" /><p>{resumeError}</p></div>
                <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="mt-4 font-semibold underline">Retry</button>
              </div>
            ) : resume ? (
              <ResumeContent resumeScore={resume.atsScore ?? null} />
            ) : (
              <NoResumeContent />
            )}
          </main>
          {hasResume && (
            <aside className="min-w-0 space-y-4 lg:pt-20" aria-label="Dashboard tools">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-neutral-900">Need help?</h2>
                <p className="mt-1 text-xs text-neutral-500">Questions or feedback? We're here.</p>
                <div className="mt-4 space-y-2">
                  <button type="button" onClick={() => setShowFeedbackModal(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"><MessageSquare size={15} /> Share feedback</button>
                  {WHATSAPP_SUPPORT_NUMBER && <a href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700"><Send size={15} /> WhatsApp support</a>}
                  {SUPPORT_EMAIL && <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-sm font-medium text-violet-700"><Mail size={15} /> Email support</a>}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}
    </>
  );
}
