import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User, Mail, Calendar, FileText, Bell, LogOut, Loader2,
  Crown, Clock, ShieldCheck, AlertTriangle, Check,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Pricing from "./Pricing.jsx";


const API_BASE = import.meta.env.VITE_API_URL;
const DAY_MS = 24 * 60 * 60 * 1000;

/* ---------------- Helpers ---------------- */

function formatDate(value, withTime = false) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(
    undefined,
    withTime
      ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }
      : { day: "numeric", month: "short", year: "numeric" }
  );
}

/** Works out the Pro state from whatever the backend sends. */
function getPlan(user) {
  const expiresAt = user?.planExpiresAt 
    ? new Date(user.planExpiresAt) 
    : null;

  // ← no startedAt in your model, use createdAt as fallback
  const startedAt = user?.createdAt 
    ? new Date(user.createdAt) 
    : null;

  const hasExpiry = expiresAt && !Number.isNaN(expiresAt.getTime());
  const msLeft    = hasExpiry ? expiresAt.getTime() - Date.now() : null;
  const expired   = hasExpiry && msLeft <= 0;

  // ← use plan field directly
  const isPro = user?.plan === "pro" && !expired;

  const daysLeft = hasExpiry && !expired 
    ? Math.ceil(msLeft / DAY_MS) 
    : null;

  let progress = null;
  if (hasExpiry && startedAt && !Number.isNaN(startedAt.getTime())) {
    const total = expiresAt - startedAt;
    if (total > 0) {
      progress = Math.min(
        100,
        Math.max(0, ((Date.now() - startedAt) / total) * 100)
      );
    }
  }

  return {
    isPro,
    expired:    user?.plan === "pro" && expired,
    hasExpiry,
    expiresAt,
    startedAt,
    daysLeft,
    progress,
  };
}

/* ---------------- Small UI pieces ---------------- */

function SectionCard({ icon: Icon, title, action, children }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Icon size={16} />
          </div>
          <h2 className="font-medium text-neutral-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 py-3 last:border-0">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
      <Crown size={11} /> Pro
    </span>
  );
}

/* ---------------- Plan card ---------------- */

function PlanCard({ plan }) {
  const { isPro, expired, hasExpiry, expiresAt, startedAt, daysLeft, progress } = plan;
  const expiringSoon = isPro && daysLeft !== null && daysLeft <= 1;

  // Free (or lapsed) users: show what they would get
  if (!isPro) {
    return (
      <SectionCard icon={Crown} title="Plan">
        {expired && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>
              Your Pro plan ended on {formatDate(expiresAt)}. Renew to get your Pro benefits back.
            </span>
          </div>
        )}

        <p className="text-base font-semibold text-neutral-900">Free plan</p>
        <p className="mt-1 text-sm text-neutral-500">
          Includes 1 resume upload. Replacing it needs Pro.
        </p>

        <div className="mt-5 border-t border-neutral-100 pt-4">
          <p className="text-sm font-medium text-neutral-900">With Pro you get:</p>

          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            {[
              "Unlimited job recommendations",
              "Unlimited resume uploads",
              "Basic application tracker",
              "Skill gap analysis",
              "All platforms",
              // "Study support for skill gaps",
              "Priority support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={15} className="shrink-0 text-violet-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/pricing"
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
        >
          {expired ? "Renew Pro" : "Upgrade to Pro"}
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={Crown}
      title="Plan"
      action={<ProBadge />}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-base font-semibold text-neutral-900">Pro plan</p>
        <p className="flex items-center gap-1.5 text-sm text-emerald-700">
          <ShieldCheck size={14} /> Active
        </p>
      </div>

      {hasExpiry ? (
        <>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Expires on</p>
              <p className="mt-0.5 text-lg font-semibold text-neutral-900">{formatDate(expiresAt)}</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold tabular-nums ${expiringSoon ? "text-amber-600" : "text-violet-700"}`}>
                {daysLeft}
              </p>
              <p className="text-xs text-neutral-500">{daysLeft === 1 ? "day left" : "days left"}</p>
            </div>
          </div>

          {/* {progress !== null && (
            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-violet-100"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Pro plan time used"
            >
              <div
                className={`h-full rounded-full ${expiringSoon ? "bg-amber-500" : "bg-violet-600"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )} */}

          {/* {startedAt && (
            <p className="mt-2 text-xs text-neutral-500">Started on {formatDate(startedAt)}</p>
          )} */}

          {expiringSoon && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="flex items-center gap-2 text-sm text-amber-800">
                <Clock size={15} className="shrink-0" />
                Your Pro plan ends soon.
              </p>
              <Link
                to="/pricing"
                className="text-sm font-semibold text-violet-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                Renew Pro
              </Link>
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-neutral-500">Your Pro plan has no end date.</p>
      )}
    </SectionCard>
  );
}

/* ---------------- Page ---------------- */

export default function Profile() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const meRes = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
        if (!meRes.ok) throw new Error("Not authenticated");
        const meData = await meRes.json();
        setUser(meData?.user ?? null);
        if (typeof meData?.notifyEmail === "boolean") {
          setNotifyEmail(meData.notifyEmail);
        }

        try {
          const resumeRes = await fetch(`${API_BASE}/api/user/resume`, { credentials: "include" });
          if (resumeRes.ok) {
            const resumeData = await resumeRes.json();
            setResume(resumeData?.resume ?? null);
          }
        } catch {
          setResume(null);
        }
      } catch (err) {
        setError(err.message || "Could not load your profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="flex max-w-3xl flex-1 items-center gap-2 px-4 py-8 text-sm text-neutral-400 sm:px-10">
        <Loader2 size={16} className="animate-spin" />
        Loading your profile...
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-3xl flex-1 px-4 py-8 sm:px-10">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}. Try signing in again.
        </div>
      </main>
    );
  }

  const plan = getPlan(user);
  
  const signInMethod =
    user?.provider === "google" ? "Google" : user?.provider ? user.provider : null;

  return (
    <main className="max-w-3xl flex-1 px-4 py-6 sm:px-10 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900">Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your account, plan, and resume.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Identity */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div
              className={`shrink-0 rounded-full p-0.5 ${
                plan.isPro ? "bg-gradient-to-br from-violet-500 to-fuchsia-400" : "bg-neutral-200"
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-violet-600 text-xl font-medium text-white">
                {user?.picture ? (
                  <img src={user.picture} alt={user?.name || "User"} className="h-full w-full object-cover" />
                ) : (
                  (user?.name?.[0] || "U").toUpperCase()
                )}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-lg font-semibold text-neutral-900">{user?.name || "—"}</p>
                {plan.isPro && <ProBadge />}
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 break-all text-sm text-neutral-500">
                <Mail size={13} className="shrink-0" /> {user?.email || "—"}
              </p>
              {user?.createdAt && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                  <Calendar size={12} className="shrink-0" />
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Plan */}
        <PlanCard plan={plan} />

        {/* Account details */}
        {/* <SectionCard icon={User} title="Account details">
          <dl>
            <DetailRow label="Full name" value={user?.name} />
            <DetailRow label="Email" value={user?.email} />
            <DetailRow label="Signed in with" value={signInMethod} />
            <DetailRow label="Plan" value={plan.isPro ? "Pro" : "Free"} />
            <DetailRow label="Joined" value={formatDate(user?.createdAt)} />
            <DetailRow label="Last login" value={formatDate(user?.lastLoginAt, true)} />
          </dl>
        </SectionCard> */}

        {/* Resume summary */}
        <SectionCard icon={FileText} title="Resume">
          {resume ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-neutral-900">{resume.fileName}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Uploaded {formatDate(resume.uploadedAt)} · ATS score {resume.atsScore}/100
                </p>
                {resume.nextUploadAt && new Date(resume.nextUploadAt) > new Date() && (
                  <p className="mt-1 text-xs text-amber-700">
                    Next re-upload available on {formatDate(resume.nextUploadAt, true)}
                  </p>
                )}
              </div>
              <Link
                to="/resume"
                className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-medium text-violet-600 transition-colors hover:bg-violet-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                View / replace
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">No resume uploaded yet.</p>
              <Link
                to="/resume"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
              >
                Upload resume
              </Link>
            </div>
          )}
        </SectionCard>

        {/* Notifications */}
        {/* <SectionCard icon={Bell} title="Notifications">
          <label className="flex cursor-not-allowed items-center justify-between gap-4 opacity-60">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                Email alerts for new matches
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-600">
                  Coming soon
                </span>
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">Get notified when a high-fit job is found.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyEmail}
              disabled
              className="h-4 w-4 cursor-not-allowed accent-violet-600"
            />
          </label>
        </SectionCard> */}

        {/* Account actions */}
        <SectionCard icon={LogOut} title="Account actions">
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <LogOut size={14} /> Log out
          </button>
        </SectionCard>
      </div>
    </main>
  );
}