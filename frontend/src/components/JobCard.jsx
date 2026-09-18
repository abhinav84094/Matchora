import ScoreRing from "./ScoreRing";
import { useState } from "react";
import {
  MapPin,
  ExternalLink,
  Sparkles,
  X,
  Check,
  AlertCircle,
  BriefcaseBusiness,
  ChevronRight,
} from "lucide-react";

/* =========================================================
   COMPANY AVATAR COLOR
========================================================= */

const palette = [
  "#171717",
  "#7c3aed",
  "#0ea5e9",
  "#f97316",
  "#e11d48",
  "#059669",
  "#4f46e5",
  "#d97706",
];

function companyColor(name = "") {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash =
      name.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  return palette[Math.abs(hash) % palette.length];
}

/* =========================================================
   SKILL BADGE
========================================================= */

function SkillBadge({ children, type = "matched" }) {
  const matched = type === "matched";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold leading-none sm:px-3 sm:py-1.5 sm:text-xs ${
        matched
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-red-100 bg-red-50 text-red-600"
      }`}
    >
      {matched && <Check size={11} className="shrink-0" />}

      <span className="truncate">{children}</span>
    </span>
  );
}

/* =========================================================
   JOB CARD
========================================================= */

export default function JobCard({
  job,
  onApplicationCreated,
}) {
  const [showAnalysis, setShowAnalysis] =
    useState(false);

  const eligible =
    job.eligibility?.experience?.eligible;

  const requiredYears =
    job.eligibility?.experience?.requiredYears ?? 0;

  const userMonths =
    job.eligibility?.experience?.userMonths ?? 0;

  const userYears = Math.floor(
    userMonths / 12
  );

  const remainingMonths =
    userMonths % 12;

  const matchedSkills =
    job.matchedSkills || [];

  const missingSkills =
    job.missingSkills || [];

  const requiredSkills =
    job.requiredSkills || [];

  const matchScore = Math.round(
    job.skillScore || 0
  );

  const handleApply = (event) => {
    event?.stopPropagation();

    if (job.jobUrl) {
      window.open(
        job.jobUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }

    onApplicationCreated?.({
      job,
    });
  };

  const openAnalysis = (event) => {
    event?.stopPropagation();
    setShowAnalysis(true);
  };

  const closeAnalysis = () => {
    setShowAnalysis(false);
  };

  const matchLabel =
    matchScore >= 85
      ? "Excellent Match"
      : matchScore >= 70
      ? "Strong Match"
      : matchScore >= 50
      ? "Potential Match"
      : "Low Match";

  return (
    <>
      {/* =====================================================
          JOB CARD
      ===================================================== */}

      <article
        className="group cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-5"
        onClick={openAnalysis}
      >
        {/* TOP */}

        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {/* COMPANY AVATAR */}

          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm sm:h-12 sm:w-12"
            style={{
              background: companyColor(
                job.company
              ),
            }}
          >
            {job.company?.[0]?.toUpperCase() ||
              "?"}
          </div>

          {/* JOB INFORMATION */}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-neutral-900 sm:text-[15px]">
                  {job.title}
                </h3>

                <p className="mt-0.5 truncate text-xs font-medium text-neutral-500 sm:text-sm">
                  {job.company}
                </p>
              </div>

              {/* MOBILE SCORE */}

              <div className="shrink-0 sm:hidden">
                <ScoreRing
                  score={matchScore}
                  size={46}
                />
              </div>
            </div>

            {/* LOCATION */}

            <div className="mt-2 flex min-w-0 items-center gap-1.5 text-[11px] text-neutral-400 sm:text-xs">
              <MapPin
                size={12}
                className="shrink-0"
              />

              <span className="truncate">
                {job.location ||
                  "Location not specified"}
              </span>
            </div>

            {/* OPTIONAL JOB META */}

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
              {job.platform && (
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-500">
                  {job.platform}
                </span>
              )}

              {requiredYears > 0 && (
                <span className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-500">
                  {requiredYears}+ yrs
                </span>
              )}

              <span
                className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                  eligible
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {eligible
                  ? "Eligible"
                  : "Experience gap"}
              </span>
            </div>
          </div>

          {/* DESKTOP SCORE */}

          <div className="hidden shrink-0 flex-col items-center gap-2 sm:flex">
            <ScoreRing
              score={matchScore}
              size={56}
            />

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold whitespace-nowrap ${
                eligible
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {eligible
                ? "Eligible"
                : requiredYears > 0
                ? `Needs ${requiredYears}+ yrs`
                : "Not Eligible"}
            </span>
          </div>
        </div>

        {/* MATCH SUMMARY */}

        <div className="mt-4 rounded-xl bg-neutral-50 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <Sparkles
              size={13}
              className="shrink-0 text-violet-600"
            />

            <p className="min-w-0 truncate text-[11px] font-medium text-neutral-600 sm:text-xs">
              <span className="font-bold text-neutral-800">
                {matchScore}%
              </span>{" "}
              match · {matchedSkills.length}{" "}
              skill
              {matchedSkills.length !== 1
                ? "s"
                : ""}{" "}
              aligned
            </p>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}

        <div
          className="mt-4 flex flex-col gap-2.5 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            onClick={openAnalysis}
            className="group/analysis flex w-full items-center justify-center gap-1.5 rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2.5 text-xs font-semibold text-violet-600 transition hover:border-violet-200 hover:bg-violet-50 sm:w-auto sm:border-0 sm:bg-transparent sm:px-0 sm:py-1"
          >
            <Sparkles size={14} />

            Match Analysis

            <ChevronRight
              size={13}
              className="transition-transform group-hover/analysis:translate-x-0.5"
            />
          </button>

          <button
            onClick={handleApply}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99] sm:w-auto sm:text-sm"
          >
            Apply

            <ExternalLink size={13} />
          </button>
        </div>
      </article>

      {/* =====================================================
          MATCH ANALYSIS MODAL
      ===================================================== */}

      {showAnalysis && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={closeAnalysis}
        >
          <div
            className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}

            <div className="shrink-0 border-b border-neutral-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 sm:flex">
                    <Sparkles size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Sparkles
                        size={16}
                        className="shrink-0 text-violet-600 sm:hidden"
                      />

                      <h2 className="truncate text-base font-bold text-neutral-900 sm:text-lg">
                        Matchora Match Analysis
                      </h2>
                    </div>

                    <p className="mt-1 text-xs leading-4 text-neutral-500 sm:text-sm">
                      Here's why this job matches
                      your profile.
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeAnalysis}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Close match analysis"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* MODAL CONTENT */}

            <div className="min-h-0 overflow-y-auto">
              {/* JOB SUMMARY */}

              <div className="px-4 pt-4 sm:px-6 sm:pt-6">
                <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                    style={{
                      background: companyColor(
                        job.company
                      ),
                    }}
                  >
                    {job.company?.[0]?.toUpperCase() ||
                      "?"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-neutral-900">
                      {job.title}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {job.company}
                    </p>
                  </div>
                </div>
              </div>

              {/* MATCH SCORE */}

              <div className="px-4 pt-4 sm:px-6 sm:pt-5">
                <div className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                        Overall Match
                      </p>

                      <h3 className="mt-1 text-3xl font-bold tracking-tight text-violet-700 sm:text-4xl">
                        {matchScore}%
                      </h3>

                      <p className="mt-1 text-xs leading-4 text-violet-600 sm:text-sm">
                        {matchLabel}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <ScoreRing
                        score={matchScore}
                        size={68}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* WHY MATCHES */}

              <section className="px-4 pt-6 sm:px-6">
                <h3 className="text-sm font-bold text-neutral-900 sm:text-base">
                  Why this job matches
                </h3>

                <div className="mt-3 space-y-2.5">
                  {/* SKILLS */}

                  <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check
                        size={13}
                        className="text-emerald-600"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-800 sm:text-sm">
                        Skills compatibility
                      </p>

                      <p className="mt-0.5 text-[11px] leading-4 text-neutral-400 sm:text-xs">
                        {matchedSkills.length} of{" "}
                        {requiredSkills.length ||
                          matchedSkills.length}{" "}
                        required skills match
                      </p>
                    </div>
                  </div>

                  {/* EXPERIENCE */}

                  <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-3">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        eligible
                          ? "bg-emerald-100"
                          : "bg-red-100"
                      }`}
                    >
                      {eligible ? (
                        <Check
                          size={13}
                          className="text-emerald-600"
                        />
                      ) : (
                        <AlertCircle
                          size={13}
                          className="text-red-600"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-800 sm:text-sm">
                        Experience requirement
                      </p>

                      <p className="mt-0.5 text-[11px] leading-4 text-neutral-400 sm:text-xs">
                        {eligible
                          ? "Your experience meets the job requirement"
                          : "Your current experience is below the requirement"}
                      </p>
                    </div>
                  </div>

                  {/* PROFILE */}

                  <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <Check
                        size={13}
                        className="text-emerald-600"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-800 sm:text-sm">
                        Role relevance
                      </p>

                      <p className="mt-0.5 text-[11px] leading-4 text-neutral-400 sm:text-xs">
                        This role aligns with your
                        profile.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* MATCHED SKILLS */}

              <section className="px-4 pt-6 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-neutral-900 sm:text-base">
                    Matched Skills
                  </h3>

                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                    {matchedSkills.length}
                  </span>
                </div>

                {matchedSkills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {matchedSkills.map(
                      (skill) => (
                        <SkillBadge
                          key={skill}
                          type="matched"
                        >
                          {skill}
                        </SkillBadge>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-400">
                    No matching skills found.
                  </p>
                )}
              </section>

              {/* MISSING SKILLS */}

              <section className="px-4 pt-6 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-neutral-900 sm:text-base">
                    Missing Skills
                  </h3>

                  {missingSkills.length > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                      {missingSkills.length}
                    </span>
                  )}
                </div>

                {missingSkills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {missingSkills.map(
                      (skill) => (
                        <SkillBadge
                          key={skill}
                          type="missing"
                        >
                          {skill}
                        </SkillBadge>
                      )
                    )}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                    <Check
                      size={14}
                      className="shrink-0"
                    />

                    Great! No missing required
                    skills.
                  </div>
                )}
              </section>

              {/* EXPERIENCE */}

              <section className="px-4 pt-6 sm:px-6">
                <h3 className="text-sm font-bold text-neutral-900 sm:text-base">
                  Experience
                </h3>

                <div className="mt-3 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-xs text-neutral-500 sm:text-sm">
                      Required
                    </span>

                    <span className="text-xs font-bold text-neutral-900 sm:text-sm">
                      {requiredYears === 0
                        ? "0 years"
                        : `${requiredYears}+ years`}
                    </span>
                  </div>

                  <div className="border-t border-neutral-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-neutral-500 sm:text-sm">
                        Your profile
                      </span>

                      <span className="text-xs font-bold text-neutral-900 sm:text-sm">
                        {userYears}{" "}
                        {userYears === 1
                          ? "year"
                          : "years"}

                        {remainingMonths > 0 &&
                          ` ${remainingMonths} ${
                            remainingMonths === 1
                              ? "month"
                              : "months"
                          }`}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          eligible
                            ? "bg-emerald-100"
                            : "bg-red-100"
                        }`}
                      >
                        {eligible ? (
                          <Check
                            size={13}
                            className="text-emerald-600"
                          />
                        ) : (
                          <X
                            size={13}
                            className="text-red-600"
                          />
                        )}
                      </div>

                      <span
                        className={`text-xs font-bold sm:text-sm ${
                          eligible
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {eligible
                          ? "Experience requirement satisfied"
                          : "Experience requirement not met"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* APPLY */}

              <div className="sticky bottom-0 mt-6 border-t border-neutral-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
                <button
                  onClick={handleApply}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-100 transition hover:bg-violet-700 active:scale-[0.99]"
                >
                  Apply

                  <ExternalLink size={15} />
                </button>

                <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-neutral-400">
                  <BriefcaseBusiness
                    size={11}
                  />

                  Opens the job listing in a new tab
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}