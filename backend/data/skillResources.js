/**
 * SKILL RESOURCES DATABASE
 * 
 * Ye file canonical skill names ko
 * learning resources se map karti hai.
 * 
 * Canonical names SKILL_ALIASES.js se match karne chahiye!
 * Example: "React" not "React.js" or "ReactJS"
 * 
 * Har skill mein:
 * - description: skill kya hai aur kyun important hai
 * - resources: array of learning resources
 *   - type: "YouTube" | "Free" | "Practice" | "Docs"
 *   - title: resource ka naam
 *   - url: direct link
 */

export const SKILL_RESOURCES = {

  // ─────────────────────────────────────────
  // FRONTEND
  // ─────────────────────────────────────────

  JavaScript: {
    description: "Language of the web — essential for any frontend or backend role. Most in-demand skill in India.",
    resources: [
      {
        type:  "YouTube",
        title: "JavaScript Full Course - Bro Code",
        url:   "https://www.youtube.com/watch?v=8dWL3wF_OMw",
      },
      {
        type:  "Free",
        title: "JavaScript.info — Modern JS Tutorial",
        url:   "https://javascript.info",
      },
      {
        type:  "Free",
        title: "FreeCodeCamp JavaScript Algorithms",
        url:   "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures",
      },
      {
        type:  "Practice",
        title: "LeetCode JavaScript Problems",
        url:   "https://leetcode.com/problemset/?topicSlugs=javascript",
      },
    ],
  },

  TypeScript: {
    description: "Typed superset of JavaScript — highly demanded in production codebases. Learning this unlocks 3x more jobs.",
    resources: [
      {
        type:  "YouTube",
        title: "TypeScript Full Course - Jack Herrington",
        url:   "https://www.youtube.com/watch?v=d56mG7DezGs",
      },
      {
        type:  "Free",
        title: "Official TypeScript Handbook",
        url:   "https://www.typescriptlang.org/docs/handbook/intro.html",
      },
      {
        type:  "Free",
        title: "Total TypeScript — Matt Pocock",
        url:   "https://www.totaltypescript.com/tutorials",
      },
    ],
  },

  React: {
    description: "Most popular frontend library — used in 90% of frontend job descriptions in India.",
    resources: [
      {
        type:  "YouTube",
        title: "React Full Course - Chai aur Code",
        url:   "https://www.youtube.com/watch?v=vz1RlOZ_ZaU",
      },
      {
        type:  "Free",
        title: "Official React Docs — react.dev",
        url:   "https://react.dev/learn",
      },
      {
        type:  "Free",
        title: "FreeCodeCamp React Course",
        url:   "https://www.freecodecamp.org/learn/front-end-development-libraries",
      },
    ],
  },

  "Next.js": {
    description: "React framework for production — SSR, SSG and API routes built in. Fast growing demand.",
    resources: [
      {
        type:  "YouTube",
        title: "Next.js Full Course - Traversy Media",
        url:   "https://www.youtube.com/watch?v=mTz0GXj8NN0",
      },
      {
        type:  "Free",
        title: "Official Next.js Tutorial",
        url:   "https://nextjs.org/learn",
      },
    ],
  },

  Redux: {
    description: "State management for React apps — needed for large scale frontend development.",
    resources: [
      {
        type:  "YouTube",
        title: "Redux Toolkit Full Course - Codevolution",
        url:   "https://www.youtube.com/watch?v=bbkBuqC1rU4",
      },
      {
        type:  "Free",
        title: "Official Redux Toolkit Docs",
        url:   "https://redux-toolkit.js.org/introduction/getting-started",
      },
    ],
  },

  Tailwind: {
    description: "Utility-first CSS framework — rapidly replacing traditional CSS in modern projects.",
    resources: [
      {
        type:  "YouTube",
        title: "Tailwind CSS Full Course - Dave Gray",
        url:   "https://www.youtube.com/watch?v=lCxcTsOHrjo",
      },
      {
        type:  "Free",
        title: "Official Tailwind CSS Docs",
        url:   "https://tailwindcss.com/docs",
      },
    ],
  },

  // ─────────────────────────────────────────
  // BACKEND
  // ─────────────────────────────────────────

  "Node.js": {
    description: "JavaScript runtime for backend — powers REST APIs and server-side logic. Core MERN skill.",
    resources: [
      {
        type:  "YouTube",
        title: "Node.js Full Course - Piyush Garg",
        url:   "https://www.youtube.com/watch?v=ohIAiuHMKMI",
      },
      {
        type:  "Free",
        title: "Node.js Official Docs",
        url:   "https://nodejs.org/en/docs",
      },
      {
        type:  "Free",
        title: "The Odin Project — Node.js Path",
        url:   "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs",
      },
    ],
  },

  Express: {
    description: "Minimal Node.js web framework — used to build REST APIs quickly and efficiently.",
    resources: [
      {
        type:  "YouTube",
        title: "Express.js Full Course - Traversy Media",
        url:   "https://www.youtube.com/watch?v=SccSCuHhOw0",
      },
      {
        type:  "Free",
        title: "Express Official Docs",
        url:   "https://expressjs.com/en/starter/installing.html",
      },
    ],
  },

  MongoDB: {
    description: "NoSQL document database — pairs perfectly with Node.js. Core MERN stack skill.",
    resources: [
      {
        type:  "YouTube",
        title: "MongoDB Full Course - Web Dev Simplified",
        url:   "https://www.youtube.com/watch?v=ofme2o29ngU",
      },
      {
        type:  "Free",
        title: "MongoDB University — Free Courses",
        url:   "https://learn.mongodb.com",
      },
    ],
  },

  MySQL: {
    description: "Most popular relational database — essential for backend development across all industries.",
    resources: [
      {
        type:  "YouTube",
        title: "MySQL Full Course - Bro Code",
        url:   "https://www.youtube.com/watch?v=5OdVJbNCSso",
      },
      {
        type:  "Free",
        title: "SQLZoo — Interactive SQL Tutorial",
        url:   "https://sqlzoo.net",
      },
    ],
  },

  PostgreSQL: {
    description: "Advanced open-source relational database — preferred for production systems.",
    resources: [
      {
        type:  "YouTube",
        title: "PostgreSQL Full Course - Amigoscode",
        url:   "https://www.youtube.com/watch?v=qw--VYLpxG4",
      },
      {
        type:  "Free",
        title: "PostgreSQL Official Tutorial",
        url:   "https://www.postgresql.org/docs/current/tutorial.html",
      },
    ],
  },

  Redis: {
    description: "In-memory data store — used for caching, sessions and real-time features.",
    resources: [
      {
        type:  "YouTube",
        title: "Redis Full Course - TechWorld with Nana",
        url:   "https://www.youtube.com/watch?v=jgpVdJB2sKQ",
      },
      {
        type:  "Free",
        title: "Redis University — Free Courses",
        url:   "https://university.redis.com",
      },
    ],
  },

  // ─────────────────────────────────────────
  // DEVOPS & CLOUD
  // ─────────────────────────────────────────

  Docker: {
    description: "Containerization tool — almost mandatory for DevOps and senior backend roles.",
    resources: [
      {
        type:  "YouTube",
        title: "Docker Full Course - TechWorld with Nana",
        url:   "https://www.youtube.com/watch?v=3c-iBn73dDE",
      },
      {
        type:  "Free",
        title: "Docker Official Get Started Guide",
        url:   "https://docs.docker.com/get-started",
      },
      {
        type:  "Practice",
        title: "Play with Docker — Free Browser Labs",
        url:   "https://labs.play-with-docker.com",
      },
    ],
  },

  Kubernetes: {
    description: "Container orchestration — needed for senior DevOps and cloud backend roles.",
    resources: [
      {
        type:  "YouTube",
        title: "Kubernetes Full Course - TechWorld with Nana",
        url:   "https://www.youtube.com/watch?v=X48VuDVv0do",
      },
      {
        type:  "Free",
        title: "Kubernetes Official Tutorial",
        url:   "https://kubernetes.io/docs/tutorials/kubernetes-basics",
      },
    ],
  },

  AWS: {
    description: "Most popular cloud platform — highly demanded across all tech roles in India.",
    resources: [
      {
        type:  "YouTube",
        title: "AWS Full Course - FreeCodeCamp",
        url:   "https://www.youtube.com/watch?v=ZB5ONbD_SMY",
      },
      {
        type:  "Free",
        title: "AWS Skill Builder — Free Courses",
        url:   "https://skillbuilder.aws",
      },
      {
        type:  "Free",
        title: "AWS Cloud Practitioner Essentials",
        url:   "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials",
      },
    ],
  },

  Azure: {
    description: "Microsoft cloud platform — popular in enterprise and MNC environments.",
    resources: [
      {
        type:  "YouTube",
        title: "Azure Full Course - FreeCodeCamp",
        url:   "https://www.youtube.com/watch?v=NKEFWyqJ5XA",
      },
      {
        type:  "Free",
        title: "Microsoft Learn — Azure Free Path",
        url:   "https://learn.microsoft.com/en-us/training/azure",
      },
    ],
  },

  GCP: {
    description: "Google Cloud Platform — growing demand especially in data and ML roles.",
    resources: [
      {
        type:  "YouTube",
        title: "GCP Full Course - FreeCodeCamp",
        url:   "https://www.youtube.com/watch?v=jpno8FSqpc8",
      },
      {
        type:  "Free",
        title: "Google Cloud Skills Boost — Free Courses",
        url:   "https://www.cloudskillsboost.google",
      },
    ],
  },

  // ─────────────────────────────────────────
  // LANGUAGES
  // ─────────────────────────────────────────

  Python: {
    description: "Versatile language — used in backend, data science, ML and automation.",
    resources: [
      {
        type:  "YouTube",
        title: "Python Full Course - Mosh",
        url:   "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
      },
      {
        type:  "Free",
        title: "Python Official Tutorial",
        url:   "https://docs.python.org/3/tutorial",
      },
      {
        type:  "Free",
        title: "FreeCodeCamp Scientific Computing with Python",
        url:   "https://www.freecodecamp.org/learn/scientific-computing-with-python",
      },
    ],
  },

  Java: {
    description: "Enterprise language — widely used in backend, Android and fintech companies.",
    resources: [
      {
        type:  "YouTube",
        title: "Java Full Course - Bro Code",
        url:   "https://www.youtube.com/watch?v=xk4_1vDrzzo",
      },
      {
        type:  "Free",
        title: "Java Programming — MOOC.fi",
        url:   "https://java-programming.mooc.fi",
      },
    ],
  },

  "Spring Boot": {
    description: "Java framework for REST APIs — standard in enterprise Java development.",
    resources: [
      {
        type:  "YouTube",
        title: "Spring Boot Full Course - Amigoscode",
        url:   "https://www.youtube.com/watch?v=9SGDpanrc8U",
      },
      {
        type:  "Free",
        title: "Spring Official Guides",
        url:   "https://spring.io/guides",
      },
    ],
  },

  // ─────────────────────────────────────────
  // TOOLS
  // ─────────────────────────────────────────

  Git: {
    description: "Version control — absolutely essential for every developer role.",
    resources: [
      {
        type:  "YouTube",
        title: "Git & GitHub Full Course - Chai aur Code",
        url:   "https://www.youtube.com/watch?v=q8EevlEpQ2A",
      },
      {
        type:  "Free",
        title: "Pro Git Book — Free Online",
        url:   "https://git-scm.com/book/en/v2",
      },
      {
        type:  "Practice",
        title: "Learn Git Branching — Interactive",
        url:   "https://learngitbranching.js.org",
      },
    ],
  },

  GraphQL: {
    description: "Query language for APIs — alternative to REST, gaining popularity in startups.",
    resources: [
      {
        type:  "YouTube",
        title: "GraphQL Full Course - Traversy Media",
        url:   "https://www.youtube.com/watch?v=BcLNfwF04Kw",
      },
      {
        type:  "Free",
        title: "How to GraphQL — Free Tutorial",
        url:   "https://www.howtographql.com",
      },
    ],
  },

  // ─────────────────────────────────────────
  // AI / ML
  // ─────────────────────────────────────────

  MachineLearning: {
    description: "Core AI/ML skills — increasingly demanded in product companies and startups.",
    resources: [
      {
        type:  "YouTube",
        title: "ML Full Course - Andrew Ng Stanford",
        url:   "https://www.youtube.com/watch?v=jGwO_UgTS7I",
      },
      {
        type:  "Free",
        title: "Google ML Crash Course",
        url:   "https://developers.google.com/machine-learning/crash-course",
      },
      {
        type:  "Free",
        title: "Fast.ai — Practical Deep Learning",
        url:   "https://course.fast.ai",
      },
    ],
  },

  GenAI: {
    description: "Generative AI skills — hottest skill in 2026, massive demand across all companies.",
    resources: [
      {
        type:  "YouTube",
        title: "Generative AI Full Course - Google",
        url:   "https://www.youtube.com/watch?v=G2fqAlgmoPo",
      },
      {
        type:  "Free",
        title: "Google Generative AI Learning Path",
        url:   "https://www.cloudskillsboost.google/paths/118",
      },
    ],
  },

  // ─────────────────────────────────────────
  // CI/CD
  // ─────────────────────────────────────────

  CI_CD: {
    description: "Continuous Integration and Deployment — essential for DevOps and senior developer roles.",
    resources: [
      {
        type:  "YouTube",
        title: "CI/CD Full Course - TechWorld with Nana",
        url:   "https://www.youtube.com/watch?v=scEDHsr3APg",
      },
      {
        type:  "Free",
        title: "GitHub Actions Official Docs",
        url:   "https://docs.github.com/en/actions",
      },
    ],
  },

};

/**
 * Get resources for a specific skill
 * Returns null if skill not found in static DB
 */
export const getSkillResources = (skillName) => {
  return SKILL_RESOURCES[skillName] || null;
};

/**
 * Get all skills that have resources
 */
export const getSupportedSkills = () => {
  return Object.keys(SKILL_RESOURCES);
};