import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useResume } from "../hooks/useResume";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Upload,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

/* ---------------- Helpers ---------------- */

function validateFile(file) {
  if (!/\.pdf$/i.test(file.name)) {
    return "Please upload a PDF file.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "File size must be 5 MB or less.";
  }
  return "";
}

function ScoreRing({ score = 0, size = 72 }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  const color =
    score >= 85 ? "#059669" : score >= 65 ? "#d97706" : "#dc2626";

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
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
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      <span className="absolute text-lg font-semibold">{score}</span>
    </div>
  );
}

/* ---------------- Upload Zone (first upload) ---------------- */

function UploadZone({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file || uploading) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${API_URL}/api/user/upload-resume`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        onUploaded(data.resume, data.isPro);
        return;
      }

      setError(data.message || "Upload failed.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 sm:p-10 text-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
        <Upload size={20} />
      </div>

      <p className="text-base font-medium text-neutral-900">
        {uploading ? "Analyzing your resume..." : "Drag & drop your resume here"}
      </p>

      <p className="text-sm text-neutral-500 mt-2">PDF only • Max 5 MB</p>

      <p className="text-xs text-neutral-400 mt-1">
        Free plan includes 1 resume upload.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600 mt-3">
          {error}
        </p>
      )}

      <label
        className={`inline-block mt-5 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
          uploading
            ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
            : "bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
        }`}
      >
        {uploading ? "Analyzing..." : "Browse Files"}

        <input
          type="file"
          accept=".pdf"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

/* ---------------- Main Page ---------------- */

export default function Resume() {
  const { resume, loading, setResume, isPro, setIsPro } = useResume();

  const [uploading, setUploading] = useState(false);
  const [nextUploadAt, setNextUploadAt] = useState(
    resume?.nextUploadAt || null
  );
  const [remainingTime, setRemainingTime] = useState("");
  const [error, setError] = useState("");

  // Free users: 1 upload only, so once a resume exists they are locked
  const freeUploadLocked = Boolean(resume) && !isPro;

  useEffect(() => {
    setNextUploadAt(resume?.nextUploadAt || null);
  }, [resume]);

  // Countdown (only matters for Pro users)
  useEffect(() => {
    if (!nextUploadAt) {
      setRemainingTime("");
      return;
    }

    function tick() {
      const diff = new Date(nextUploadAt).getTime() - Date.now();

      if (diff <= 0) {
        setNextUploadAt(null);
        setRemainingTime("");
        return true;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = (n) => String(n).padStart(2, "0");

      setRemainingTime(`${pad(h)}:${pad(m)}:${pad(s)}`);
      return false;
    }

    if (tick()) return;

    const timer = setInterval(() => {
      if (tick()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [nextUploadAt]);

  async function reUpload(file) {
    if (!file || uploading) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${API_URL}/api/user/upload-resume`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResume(data.resume);
        setNextUploadAt(data.resume?.nextUploadAt || null);
        if (typeof data.isPro === "boolean") setIsPro(data.isPro);
        return;
      }

      setError(data.message || "Upload failed.");

      if (res.status === 429 && data.nextUploadAt) {
        setNextUploadAt(data.nextUploadAt);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 px-4 sm:px-10 py-8 max-w-3xl flex items-center gap-3 text-neutral-500 text-base">
        <Loader2 size={18} className="animate-spin" />
        Loading your resume...
      </main>
    );
  }

  if (!resume) {
    return (
      <main className="flex-1 px-4 sm:px-10 py-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-3">
          Resume
        </h1>

        <p className="text-base leading-7 text-neutral-600 mb-8">
          Upload your resume to receive an ATS score and personalized job
          recommendations.
        </p>

        <UploadZone
          onUploaded={(uploadedResume, uploadedIsPro) => {
            setResume(uploadedResume);
            if (typeof uploadedIsPro === "boolean") {
              setIsPro(uploadedIsPro);
            }
          }}
        />
      </main>
    );
  }

  const atsScore = resume.atsScore ?? 0;

  const scoreLabel =
    atsScore >= 85 ? "Excellent" : atsScore >= 65 ? "Good" : "Needs work";

  const scoreColor =
    atsScore >= 85
      ? "text-emerald-600"
      : atsScore >= 65
      ? "text-amber-600"
      : "text-red-600";

  return (
    <main className="flex-1 px-4 sm:px-10 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Resume
        </h1>

        <p className="text-sm text-neutral-500 mt-2 break-words">
          {resume.fileName}
        </p>
      </div>

      {/* Score + re-upload */}
      <div className="rounded-xl border border-neutral-200 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
        <ScoreRing score={atsScore} />

        <div className="flex-1 min-w-0">
          <p className={`text-base font-semibold ${scoreColor}`}>
            {scoreLabel}
          </p>

          <p className="text-sm text-neutral-600 mt-1">
            ATS Compatibility Score
          </p>

          {isPro && nextUploadAt && (
            <p className="text-sm text-amber-700 mt-2">
              Re-upload available in{" "}
              <span className="font-semibold tabular-nums">
                {remainingTime || "..."}
              </span>
            </p>
          )}

          {freeUploadLocked && (
            <p className="text-sm text-neutral-500 mt-2">
              Free plan includes 1 resume upload. Replacing it needs Pro.
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600 mt-2">
              {error}
            </p>
          )}
        </div>

        {freeUploadLocked ? (
          <Link
            to="/pricing"
            className="rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Upgrade to Pro
          </Link>
        ) : (
          <label
            className={`text-center text-sm font-semibold rounded-lg px-4 py-2.5 transition ${
              uploading || nextUploadAt
                ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
                : "border border-neutral-200 hover:border-neutral-300 cursor-pointer"
            }`}
          >
            {uploading ? "Uploading..." : nextUploadAt ? "Locked" : "Re-upload"}

            <input
              type="file"
              className="hidden"
              accept=".pdf"
              disabled={uploading || !!nextUploadAt}
              onChange={(e) => {
                reUpload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-emerald-600" />

            <p className="text-base font-semibold text-neutral-900">
              Skills Found ({(resume.skills || []).length})
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(resume.skills || []).map((skill) => (
              <span
                key={skill}
                className="text-sm px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />

            <p className="text-base font-semibold text-neutral-900">
              Suggested Skills ({(resume.missingSkills || []).length})
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(resume.missingSkills || []).map((skill) => (
              <span
                key={skill}
                className="text-sm px-2.5 py-1 rounded-md bg-amber-50 text-amber-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths */}
      {resume.strengths?.length > 0 && (
        <div className="rounded-xl border border-neutral-200 p-5 mb-6">
          <p className="text-base font-semibold text-neutral-900 mb-3">
            Strengths
          </p>

          <ul className="space-y-3">
            {resume.strengths.map((item, index) => (
              <li
                key={index}
                className="flex gap-3 text-sm leading-6 text-neutral-700"
              >
                <CheckCircle2
                  size={16}
                  className="text-emerald-600 mt-1 shrink-0"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {resume.suggestions?.length > 0 && (
        <div className="rounded-xl border border-neutral-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-violet-600" />

            <p className="text-base font-semibold text-neutral-900">
              Suggestions
            </p>
          </div>

          <ul className="space-y-3">
            {resume.suggestions.map((item, index) => (
              <li
                key={index}
                className="text-sm leading-6 text-neutral-700"
              >
                {String(item).replace(/\*\*/g, "")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <div className="rounded-xl border border-neutral-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={18} className="text-neutral-700" />

            <p className="text-base font-semibold text-neutral-900">
              Experience
            </p>
          </div>

          {resume.experience.map((exp, index) => (
            <div key={exp._id || index} className="mb-6 last:mb-0">
              <p className="text-base font-semibold text-neutral-900">
                {exp.title}
              </p>

              <p className="text-sm text-neutral-600 mt-1">
                {exp.company}
                {exp.location ? ` • ${exp.location}` : ""}
              </p>

              {(exp.startDate || exp.endDate) && (
                <p className="text-sm text-neutral-500 mt-1">
                  {exp.startDate} — {exp.endDate || "Present"}
                </p>
              )}

              {exp.description?.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {exp.description.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm leading-6 text-neutral-700"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {resume.projects?.length > 0 && (
        <div className="rounded-xl border border-neutral-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FolderGit2 size={18} className="text-neutral-700" />

            <p className="text-base font-semibold text-neutral-900">
              Projects
            </p>
          </div>

          {resume.projects.map((project, index) => (
            <div key={project._id || index} className="mb-6 last:mb-0">
              <p className="text-base font-semibold text-neutral-900">
                {project.title}
              </p>

              {project.technologies?.length > 0 && (
                <p className="text-sm text-neutral-600 mt-1">
                  {project.technologies.join(", ")}
                </p>
              )}

              {project.description?.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {project.description.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm leading-6 text-neutral-700"
                    >
                      • {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <div className="rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={18} className="text-neutral-700" />

            <p className="text-base font-semibold text-neutral-900">
              Education
            </p>
          </div>

          {resume.education.map((edu, index) => (
            <div key={edu._id || index} className="mb-4 last:mb-0">
              <p className="text-base font-semibold text-neutral-900">
                {edu.degree}
              </p>

              <p className="text-sm text-neutral-600 mt-1">
                {edu.institution}
                {edu.location ? ` • ${edu.location}` : ""}
              </p>

              {(edu.startDate || edu.endDate) && (
                <p className="text-sm text-neutral-500 mt-1">
                  {edu.startDate} — {edu.endDate || "Present"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}