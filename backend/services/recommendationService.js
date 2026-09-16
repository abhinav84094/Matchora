import { SKILL_ALIASES } from "../utils/skillAliases.js";
import Job from "../models/Job.js";


/**
 * Normalize text
 */
export const normalize = (text = "") => {

    return text
        .toLowerCase()
        .replaceAll("c++", "cplusplus")
        .replaceAll("c#", "csharp")
        .replace(/[^a-z0-9]/g, "")
        .trim();

};

/**
 * Convert any skill to its canonical name
 */
export const getCanonicalSkill = (skill) => {

    const normalizedSkill = normalize(skill);

    for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {

        const normalizedAliases = aliases.map(normalize);

        if (normalizedAliases.includes(normalizedSkill)) {
            return canonical;
        }

    }

    return skill;

};

/**
 * Extract required skills from job description
 */
export const extractSkills = (description = "") => {

    const text = normalize(description);

    const extractedSkills = [];

    for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {

        const found = aliases.some(alias =>
            text.includes(normalize(alias))
        );

        if (found) {
            extractedSkills.push(skill);
        }

    }

    return extractedSkills;

};

/**
 * Calculate skill score
 */
export const calculateSkillScore = (
    resumeSkills = [],
    jobSkills = []
) => {

    const normalizedResume =
        resumeSkills.map(getCanonicalSkill);

    const normalizedJob =
        jobSkills.map(getCanonicalSkill);

    const matchedSkills = [];
    const missingSkills = [];

    normalizedJob.forEach((skill, index) => {

        if (normalizedResume.includes(skill)) {

            matchedSkills.push(jobSkills[index]);

        } else {

            missingSkills.push(jobSkills[index]);

        }

    });

    const score =
        normalizedJob.length === 0
            ? 0
            : Math.round(
                (matchedSkills.length / normalizedJob.length) * 100
            );

    return {

        score,

        matchedSkills,

        missingSkills

    };

};

/**
 * Parse "Feb 2025" -> Date
 */
const parseMonthYear = (value) => {

    if (!value) return null;

    if (value.toLowerCase() === "present") {
        return new Date();
    }

    const months = {

        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11

    };

    const [month, year] = value.split(" ");

    return new Date(
        Number(year),
        months[month.toLowerCase()],
        1
    );

};

/**
 * Calculate total experience in months
 */
export const calculateTotalExperienceMonths = (
    experience = []
) => {

    let totalMonths = 0;

    for (const exp of experience) {

        if (!exp.startDate || !exp.endDate)
            continue;

        const start =
            parseMonthYear(exp.startDate);

        const end =
            parseMonthYear(exp.endDate);

        if (!start || !end)
            continue;

        const months =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());

        totalMonths += Math.max(months, 0);

    }

    return totalMonths;

};

/**
 * Check experience eligibility
 */
export const calculateExperienceEligibility = (
    resumeExperience = [],
    jobDescription = ""
) => {

    const match = jobDescription.match(
        /(?:minimum\s+|at\s+least\s+)?(\d+)(?:\s*-\s*\d+)?\+?\s*(?:years?|yrs?)/i
    );

    const userMonths =
        calculateTotalExperienceMonths(
            resumeExperience
        );

    if (!match) {

        return {

            requiredYears: 0,

            requiredMonths: 0,

            userMonths,

            userExperience:
                `${Math.floor(userMonths / 12)} Years ${userMonths % 12} Months`,

            eligible: true

        };

    }

    const requiredYears =
        Number(match[1]);

    const requiredMonths =
        requiredYears * 12;

    return {

        requiredYears,

        requiredMonths,

        userMonths,

        userExperience:
            `${Math.floor(userMonths / 12)} Years ${userMonths % 12} Months`,

        eligible:
            userMonths >= requiredMonths

    };

};

/**
 * Recommend jobs
 */
/**
 * Recommend Jobs From Database
 */

const MIN_SKILL_SCORE =  Number(process.env.MIN_SKILL_SCORE) || 50;

export const recommendJobs = async (resume, { page = 1, limit = 25 } = {}) => {

    const canonicalResumeSkills = [
        ...new Set(resume.skills.map(getCanonicalSkill)),
    ];

    const jobs = await Job.find({
        status: "active",
        requiredSkills: {
            $in: canonicalResumeSkills,
        },
    })
    .sort({
        postedDate: -1,
    })
    .limit(2000)
    .lean();

    const scoredJobs = jobs

        .map(job => {

            const skillAnalysis =
                calculateSkillScore(

                    resume.skills,

                    job.requiredSkills

                );

            const userMonths =
                calculateTotalExperienceMonths(

                    resume.experience

                );

            const experienceEligibility = {

                requiredMonths:
                    job.requiredExperienceMonths,

                requiredYears:
                    Math.floor(
                        job.requiredExperienceMonths / 12
                    ),

                userMonths,

                userExperience:
                    `${Math.floor(userMonths / 12)} Years ${userMonths % 12} Months`,

                eligible:
                    userMonths >= job.requiredExperienceMonths,

            };

            return {

                ...job,

                skillScore:
                    skillAnalysis.score,

                matchedSkills:
                    skillAnalysis.matchedSkills,

                missingSkills:
                    skillAnalysis.missingSkills,

                eligibility: {

                    experience:
                        experienceEligibility,

                },

            };

        })

        // Show only jobs with 50%+ skill match
        .filter(job => job.skillScore >= MIN_SKILL_SCORE &&
                        job.eligibility.experience.eligible )

        .sort((a, b) => {

            if (
                a.eligibility.experience.eligible !==
                b.eligibility.experience.eligible
            ) {

                return Number(
                    b.eligibility.experience.eligible
                ) - Number(
                    a.eligibility.experience.eligible
                );

            }

            if (b.skillScore !== a.skillScore) {

                return b.skillScore - a.skillScore;

            }

            return new Date(b.postedDate) - new Date(a.postedDate);

        });

    const totalJobs = scoredJobs.length;
    const start = (page - 1) * limit;
    const paginatedJobs = scoredJobs.slice(start, start + limit);

    return { jobs: paginatedJobs, totalJobs };

};
