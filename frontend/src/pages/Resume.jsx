
import { useState, useEffect } from "react";
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

function ScoreRing({ score = 0, size = 72 }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  const color =
    score >= 85
      ? "#059669"
      : score >= 65
      ? "#d97706"
      : "#dc2626";

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

      <span className="absolute text-lg font-semibold">
        {score}
      </span>
    </div>
  );
}

function UploadZone({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [nextUploadAt, setNextUploadAt] = useState(null);
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    if (!nextUploadAt) return;

    const timer = setInterval(() => {
      const diff =
        new Date(nextUploadAt).getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        setNextUploadAt(null);
        setRemainingTime("");
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setRemainingTime(
        `${h.toString().padStart(2, "0")}:${m
          .toString()
          .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [nextUploadAt]);

  async function handleFile(file) {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(
        `${API_URL}/api/user/upload-resume`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        onUploaded(data.resume);
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

  return (
    <div
      className="border-2 border-dashed border-neutral-200 rounded-2xl p-10 text-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();

        if (nextUploadAt) return;

        const file = e.dataTransfer.files?.[0];

        if (file) handleFile(file);
      }}
    >
      <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
        <Upload size={20} />
      </div>

      <p className="text-base font-medium text-neutral-900">
        {uploading
          ? "Analyzing your resume..."
          : "Drag & Drop your resume here"}
      </p>

      <p className="text-sm text-neutral-500 mt-2">
        PDF or DOCX • Max 5 MB
      </p>

      {error && (
        <p className="text-sm text-red-600 mt-3">
          {error}
        </p>
      )}

      <label
        className={`inline-block mt-5 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors
        ${
          nextUploadAt
            ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
            : "bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
        }`}
      >
        {uploading
          ? "Analyzing..."
          : nextUploadAt
          ? `Available in ${remainingTime}`
          : "Browse Files"}

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          disabled={uploading || !!nextUploadAt}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {nextUploadAt && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-base font-semibold text-amber-800">
            Resume uploaded recently
          </p>

          <p className="text-sm text-amber-700 mt-2">
            You can upload another resume after the countdown finishes.
          </p>

          <p className="text-xl font-bold text-amber-800 mt-3">
            {remainingTime}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Resume() {
  const { resume, loading, setResume } = useResume();

  const [uploading, setUploading] = useState(false);
  const [nextUploadAt, setNextUploadAt] = useState(
    resume?.nextUploadAt || null
  );
  const [remainingTime, setRemainingTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resume?.nextUploadAt) return;
    setNextUploadAt(resume.nextUploadAt);
  }, [resume]);

  useEffect(() => {
    if (!nextUploadAt) return;

    const timer = setInterval(() => {
      const diff =
        new Date(nextUploadAt).getTime() - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        setNextUploadAt(null);
        setRemainingTime("");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor(
        (diff % (1000 * 60)) / 1000
      );

      setRemainingTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [nextUploadAt]);

  async function reUpload(file) {
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(
        `${API_URL}/api/user/upload-resume`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setResume(data.resume);
        return;
      }

      setError(data.message);

      if (res.status === 429) {
        setNextUploadAt(data.nextUploadAt);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 px-10 py-8 max-w-3xl flex items-center gap-3 text-neutral-500 text-base">
        <Loader2 size={18} className="animate-spin" />
        Loading your resume...
      </main>
    );
  }

  if (!resume) {
    return (
      <main className="flex-1 px-10 py-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-3">
          Resume
        </h1>

        <p className="text-base leading-7 text-neutral-600 mb-8">
          Upload your resume to receive an ATS score
          and personalized job recommendations.
        </p>

        <UploadZone onUploaded={setResume} />
      </main>
    );
  }

  const atsScore = resume.atsScore ?? 0;

  const scoreLabel =
    atsScore >= 85
      ? "Excellent"
      : atsScore >= 65
      ? "Good"
      : "Needs work";

  const scoreColor =
    atsScore >= 85
      ? "text-emerald-600"
      : atsScore >= 65
      ? "text-amber-600"
      : "text-red-600";

  return (
    <main className="flex-1 px-10 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Resume
          </h1>

          <p className="text-sm text-neutral-500 mt-2">
            {resume.fileName}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 p-6 flex items-center gap-6 mb-6">
        <ScoreRing score={atsScore} />

        <div className="flex-1">
          <p className={`text-base font-semibold ${scoreColor}`}>
            {scoreLabel}
          </p>

          <p className="text-sm text-neutral-600 mt-1">
            ATS Compatibility Score
          </p>

          {nextUploadAt && (
            <p className="text-sm text-amber-700 mt-2">
              Re-upload available in{" "}
              <span className="font-semibold">
                {remainingTime}
              </span>
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-2">
              {error}
            </p>
          )}
        </div>

        <label
          className={`text-sm font-semibold rounded-lg px-4 py-2.5 transition
          ${
            nextUploadAt
              ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
              : "border border-neutral-200 hover:border-neutral-300 cursor-pointer"
          }`}
        >
          {uploading
            ? "Uploading..."
            : nextUploadAt
            ? "Locked"
            : "Re-upload"}

          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            disabled={uploading || !!nextUploadAt}
            onChange={(e) => reUpload(e.target.files?.[0])}
          />
        </label>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2
              size={18}
              className="text-emerald-600"
            />

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
            <AlertTriangle
              size={18}
              className="text-amber-600"
            />

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
            <Lightbulb
              size={18}
              className="text-violet-600"
            />

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
                {item.replace(/\*\*/g, "")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Experience */}
      {resume.experience?.length > 0 && (
        <div className="rounded-xl border border-neutral-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase
              size={18}
              className="text-neutral-700"
            />

            <p className="text-base font-semibold text-neutral-900">
              Experience
            </p>
          </div>

          {resume.experience.map((exp, index) => (
            <div
              key={exp._id || index}
              className="mb-6 last:mb-0"
            >
              <p className="text-base font-semibold text-neutral-900">
                {exp.title}
              </p>

              <p className="text-sm text-neutral-600 mt-1">
                {exp.company}
                {exp.location ? ` • ${exp.location}` : ""}
              </p>

              <p className="text-sm text-neutral-500 mt-1">
                {exp.startDate} — {exp.endDate}
              </p>

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
            <FolderGit2
              size={18}
              className="text-neutral-700"
            />

            <p className="text-base font-semibold text-neutral-900">
              Projects
            </p>
          </div>

          {resume.projects.map((project, index) => (
            <div
              key={project._id || index}
              className="mb-6 last:mb-0"
            >
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
            <GraduationCap
              size={18}
              className="text-neutral-700"
            />

            <p className="text-base font-semibold text-neutral-900">
              Education
            </p>
          </div>

          {resume.education.map((edu, index) => (
            <div
              key={edu._id || index}
              className="mb-4 last:mb-0"
            >
              <p className="text-base font-semibold text-neutral-900">
                {edu.degree}
              </p>

              <p className="text-sm text-neutral-600 mt-1">
                {edu.institution}
                {edu.location ? ` • ${edu.location}` : ""}
              </p>

              <p className="text-sm text-neutral-500 mt-1">
                {edu.startDate} — {edu.endDate}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

