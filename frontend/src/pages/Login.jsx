import { useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileCheck2,
  FileText,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

const features = [
  {
    icon: Search,
    title: "Discover relevant jobs",
    description: "Explore recent opportunities and focus on roles worth your time.",
  },
  {
    icon: FileCheck2,
    title: "Understand your resume",
    description: "See your resume analysis, skill gaps, and practical improvements.",
  },
  {
    icon: Target,
    title: "Get personalized matches",
    description: "Prioritize jobs based on the skills and experience in your resume.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Stay organized",
    description: "Keep track of the jobs you've applied to in one place.",
  },
];

const steps = [
  { number: "01", title: "Sign in", description: "Create your account securely with Google." },
  { number: "02", title: "Add your resume", description: "Upload your resume to unlock personalized insights and matches." },
  { number: "03", title: "Find your fit", description: "Review relevant opportunities and apply on the hiring site." },
];

function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-200">
        <Sparkles size={20} aria-hidden="true" />
      </span>
      <div>
        <span className="block text-xl font-extrabold tracking-tight text-slate-950">
          Match<span className="text-violet-600">ora</span>
        </span>
        {!compact && <span className="block text-[11px] leading-tight text-slate-500">Find your next fit</span>}
      </div>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]" aria-label="Illustration of Matchora's resume matching experience">
      <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_22px_70px_-32px_rgba(56,42,115,0.3)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><Target size={18} /></span>
            <div>
              <p className="text-sm font-bold text-slate-900">Your job matches</p>
              <p className="text-xs text-slate-500">Illustrative preview</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Resume analyzed</span>
        </div>

        <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-slate-900">Backend Developer</p>
              <p className="mt-1 text-sm text-slate-600">Example opportunity · Bengaluru</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm">Strong match</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Node.js', 'Express', 'MongoDB'].map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-white px-2.5 py-1.5 text-xs font-medium text-emerald-700">
                <Check size={12} aria-hidden="true" />{skill}
              </span>
            ))}
          </div>
          <div className="mt-4 border-t border-violet-100 pt-4">
            <p className="text-xs font-medium text-slate-500">Skill to develop</p>
            <span className="mt-2 inline-block rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700">Docker</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 p-4">
            <FileText size={18} className="text-violet-600" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-slate-900">Resume insights</p>
            <p className="mt-1 text-xs text-slate-500">Skills and suggestions</p>
          </div>
          <div className="rounded-2xl border border-slate-100 p-4">
            <BriefcaseBusiness size={18} className="text-violet-600" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-slate-900">Applications</p>
            <p className="mt-1 text-xs text-slate-500">Track your progress</p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute -z-10 -inset-5 rounded-[36px] bg-violet-100/60 blur-2xl" />
    </div>
  );
}

export default function Login() {
  const { user, loading } = useAuth();
  const signInRef = useRef(null);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const scrollToSignIn = () => signInRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  async function handleGoogleSuccess(credentialResponse) {
    if (!credentialResponse?.credential) {
      setAuthError("Google did not return a sign-in credential. Please try again.");
      return;
    }
    setAuthError("");
    setSigningIn(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      if (!response.ok) throw new Error("Unable to sign in. Please try again.");
      window.location.replace("/dashboard");
    } catch {
      setAuthError("Sign-in couldn't be completed. Please check your connection and try again.");
      setSigningIn(false);
    }
  }

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white/95">
        <nav aria-label="Main navigation" className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Brand />
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/aboutMatchora" className="hidden text-sm font-medium text-slate-600 transition hover:text-violet-700 sm:inline">About</Link>
            <Link to="/pricing" className="text-sm font-medium text-slate-600 transition hover:text-violet-700">Pricing</Link>
            <button type="button" onClick={scrollToSignIn} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">Get Started</button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-violet-50/80 via-white to-white">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 sm:text-sm"><Sparkles size={15} aria-hidden="true" /> A smarter way to search for jobs</span>
              <h1 className="mt-6 text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.08] tracking-tight text-slate-950">Find jobs that <span className="text-violet-600">actually fit you.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">Discover opportunities, understand your strengths, and focus on roles that match your skills. Matchora brings your job search together in one place.</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={scrollToSignIn} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">Get Started <ArrowRight size={17} aria-hidden="true" /></button>
                <Link to="/aboutMatchora" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700">How Matchora works</Link>
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-slate-500 sm:text-sm"><ShieldCheck size={16} className="shrink-0 text-emerald-600" aria-hidden="true" /> Secure Google sign-in · Free to get started</p>
            </div>
            <ProductPreview />
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50/60 py-16 sm:py-20" aria-labelledby="features-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-violet-700">WHY MATCHORA</p>
              <h2 id="features-heading" className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Less scrolling. More relevant opportunities.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">The tools you need to make your job search clearer and more organized.</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Icon size={21} aria-hidden="true" /></span>
                  <h3 className="mt-5 text-base font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20" aria-labelledby="steps-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold text-violet-700">HOW IT WORKS</p>
              <h2 id="steps-heading" className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Start with a few simple steps</h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="rounded-2xl border border-slate-200 p-6 sm:p-7">
                  <span className="text-sm font-bold text-violet-600">{step.number}</span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={signInRef} id="login-section" className="scroll-mt-8 bg-violet-50/70 py-16 sm:py-20" aria-labelledby="signin-heading">
          <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
            <div className="rounded-[26px] border border-violet-100 bg-white px-5 py-9 shadow-sm sm:px-10 sm:py-11">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><LockKeyhole size={22} aria-hidden="true" /></span>
              <h2 id="signin-heading" className="mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Your next opportunity starts here</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">Sign in with Google to get started with Matchora.</p>
              <div className="mt-7 flex min-h-12 items-center justify-center">
                {signingIn ? (
                  <span role="status" className="text-sm font-medium text-violet-700">Signing you in…</span>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setAuthError("Google sign-in failed. Please try again.")}
                    theme="outline"
                    shape="pill"
                    text="continue_with"
                  />
                )}
              </div>
              {authError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</p>}
              <p className="mt-6 text-xs leading-5 text-slate-500">By continuing, you can review our <Link to="/privacy" className="font-semibold text-violet-700 underline underline-offset-2">Privacy Policy</Link>.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Brand compact />
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
            <Link to="/aboutMatchora" className="hover:text-violet-700">About</Link>
            <Link to="/pricing" className="hover:text-violet-700">Pricing</Link>
            <Link to="/privacy" className="hover:text-violet-700">Privacy</Link>
          </nav>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Matchora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
