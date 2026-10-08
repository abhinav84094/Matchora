# Matchora

A candidate-first job matching and application tracking platform that analyzes a candidate's resume/profile and recommends relevant jobs with match scores, matched/missing skills and application tracking.

## Overview

Matchora helps job seekers (students, fresh graduates and early-career professionals) by turning a resume into prioritized, actionable job opportunities. The system extracts structured information from resumes, ingests job listings, computes match scores using a matching engine, and tracks applications and feedback.

Matchora was originally developed as JobPilot and later rebranded to Matchora. This README documents the current implementation and how to run, inspect, and extend the project.

## Problem

Early-career job seekers face several challenges:
- Vast number of job listings across platforms.
- Difficulty evaluating job fit and experience eligibility.
- Unclear skill gaps and how to close them.
- Hard to track applications and follow-ups across multiple sources.

## Solution (high level)

Matchora follows a resume-first workflow:
1. Candidate authenticates with Google and uploads a resume.
2. Backend extracts text from the resume and runs AI analysis to produce structured data (skills, education, experience, projects, ATS/formatting feedback).
3. Job records are stored in MongoDB for recommendation queries.
4. A matching layer compares candidate resume data and job requirements to compute match scores and list matched/missing skills.
5. Users view paginated recommendations, apply, and track their application statuses. Feedback and admin routes collect product feedback and provide administrative insights.

## Key features (present in this repository)

- Google sign-in with server-side ID token verification.
- JWT session handling via HTTP-only cookie.
- Resume upload (PDF) via Multer and server-side extraction using pdf-parse.
- Gemini (Google GenAI) integration for structured resume analysis (genai client configured).
- ATS scoring and formatting analysis (computed from AI analysis).
- Job recommendations use active job records stored in MongoDB.
- Match / recommendation pipeline that extracts skills from job descriptions and calculates experience eligibility, producing match information.
- Application model and routes for tracking application status and status history.
- Feedback collection and admin routes for management and analytics.
- A cleanup cron is implemented; job ingestion is not scheduled by the server.

Only the features above reflect what is present in the codebase. See the Code Reference sections below for exact files and functions.

## How Matchora works (end-to-end)

User
→ Frontend (React)  
→ Authenticate (Google ID token → POST /api/auth/google)  
→ Upload resume (POST /api/user/upload-resume, multipart/form-data)  
→ Backend extracts PDF text (pdf-parse) → sends text to Gemini analysis → structured Resume document saved  
→ Job documents in MongoDB → Recommendations are scored against resume data
→ Recommendation engine compares Resume ↔ Job requiredSkills & experience → match score + matched/missing skills  
→ User views paginated recommendations and applies → Application document created/updated  
→ Feedback collected via API → Admin endpoints expose analytics

## System architecture (components & flow)

- Frontend: Single-page React application (Vite) that talks to backend API (cookies used for authentication).
- Backend/API: Node.js + Express.js (ES module style). Routes are grouped by functionality (auth, user, jobs, feedback, admin).
- Database: MongoDB (Mongoose ODM) for persistence of users, resumes, jobs and applications.
- Authentication: Google ID token verification + JWT stored in HTTP-only cookie; middleware validates JWT for protected routes.
- Resume processing: Multer receives uploads; pdf-parse extracts text; AI (Gemini) converts extracted text into structured data stored in Resume documents.
- Job ingestion: Recommendations use active job documents stored in MongoDB; no scraper is scheduled in this repository.
- Recommendation engine: Normalization and matching logic processes user resume data against job requirement data to compute scores and diffs.
- Application tracking: Application documents track job applications and state transitions.
- Admin & feedback: Routes collect user feedback and provide admin access to aggregated insights.

Mermaid (architecture) — simplified:

```mermaid
flowchart LR
  A[User Browser] -->|Login / Upload| B[Frontend (React/Vite)]
  B -->|API calls (cookies)| C[Backend (Express)]
  C --> D[(MongoDB)]
  C --> E[Gemini AI (genai client)]
  E --> C
  C -->|notifications / logs| G[Admin / Feedback]
```

## Technology stack (as found in repo)

| Area | Technology |
|------|------------|
| Frontend | React (Vite), Tailwind CSS (frontend directory and README) |
| Backend | Node.js, Express (ES modules) |
| Database | MongoDB with Mongoose |
| AI / Resume analysis | Google GenAI client (`@google/genai`) |
| Authentication | google-auth-library (ID token verification) + jsonwebtoken (JWT) |
| Job data | MongoDB Job documents |
| File parsing | pdf-parse |
| Scheduling | node-cron |
| File uploads | Multer |

## Repository structure (important paths)

- backend/
  - server.js — Express app entry; creates uploads dir and mounts routes
  - package.json — backend scripts & dependencies
  - config/gemini.js — genai client configuration (reads GEMINI_API_KEY)
  - db/mongodb.js — Mongoose connection
  - models/
    - User.js
    - Resume.js
    - Job.js
    - Application.js
    - PlatformAccount.js
    - Feedback.js
  - routes/
    - authRoutes.js — /api/auth
    - userRoutes.js — /api/user
    - jobRoutes.js — /api/jobs
    - feedbackRoutes.js — /api/feedback
    - adminRoutes.js — /api/admin
  - controllers/
    - authController.js — login (Google token), me, logout
    - userController.js — uploadResume, getResume
    - other controllers referenced for jobs, admin, feedback
  - services/
    - geminiService.js — analyzeResume wrapper (calls AI, enforces schema)
    - recommendationService.js — skill extraction and experience eligibility helpers
  - cron/
    - cleanupJobsCron.js — scheduled cleanup tasks
  - middleware/
    - authMiddleware.js — verifies JWT cookie & loads user
    - multer.js — Multer upload configuration
- frontend/
  - (React + Vite project; see frontend/README.md for pages, components and dev instructions)

## Core technical components (details)

### Authentication
- Frontend obtains a Google ID token (client-side) and sends it to the backend (POST /api/auth/google).
- backend/controllers/authController.js verifies the ID token using google-auth-library, upserts the User record and sets a signed JWT in an HTTP-only cookie named `token`.
- authMiddleware (backend/middleware/authMiddleware.js) verifies the JWT and attaches the user document to `req.user` for protected routes.

### Resume analysis
- Upload: POST /api/user/upload-resume uses Multer (configured in backend/middleware/multer.js) and the upload controller is backend/controllers/userController.js.
- Parsing: pdf-parse extracts raw text from the uploaded PDF.
- AI analysis: backend/services/geminiService.js sends a structured prompt to the genai client configured in backend/config/gemini.js. The service enforces a JSON schema and returns structured fields including skills, education, experience, projects, strengths, missingSkills, preferredRoles, suggestions, contact fields and formatting metrics.
- Storage: The controller upserts a Resume document (backend/models/Resume.js) and links it to the User.

Important behavior:
- Upload rate-limiting: after a successful resume upload the controller sets nextUploadAt and rejects further uploads until 24 hours have passed (prevents excessive re-uploads).
- Uploaded file is deleted from disk after processing.

### Job data
- Recommendation endpoints query active Job documents already stored in MongoDB.
- No job-scraping worker or scheduled job-ingestion task is enabled in this repository.
- The Naukri scraper module is currently a placeholder that returns no results.

### Recommendation / matching
- Matching helpers are present in backend/services/recommendationService.js and are used both by the scraper (to extract job required skills and experience) and by recommendation endpoints (to compute match scores). The matching logic uses:
  - Skill normalization and extraction from job descriptions.
  - Experience eligibility calculation (months).
  - A fit/score computation pipeline combining skill overlap and experience eligibility to derive match numbers and matched/missing skill lists.

### Application tracking
- Application documents (backend/models/Application.js) track:
  - user, resume references
  - job metadata (jobId, jobTitle, company, platform, jobUrl)
  - fitScore, appliedAutomatically, recruiterContacted
  - status with allowed values (Saved, Applied, Interview, Offer, Rejected)
  - statusHistory array with timestamps and notes
- Unique index enforces (user, platform, jobId) uniqueness to prevent duplicate application records.

### Feedback & admin analytics
- Feedback schema (backend/models/Feedback.js) stores detailed product feedback including ratings, issues, NPS and freeform answers.
- Admin routes (backend/routes/adminRoutes.js) are present to surface aggregated data (inspect controller implementations for exact endpoints).

## Database design (selected models)

- User
  - purpose: store authenticated user profile and preferences
  - key fields: googleId, name, email, picture, resume (ObjectId), preferences (preferredRoles, preferredLocations, workMode, minimumCTC)
  - timestamps enabled

- Resume
  - purpose: structured parsed resume & AI analysis
  - key fields: user (unique), fileName, rawText, skills[], education[], experience[], projects[], strengths[], missingSkills[], preferredRoles[], atsScore, suggestions, rawAnalysis
  - nextUploadAt used to rate-limit uploads

- Job
  - purpose: store ingested job postings
  - key fields: jobKey (unique per platform), title, company, location, jobUrl (unique), description, requiredSkills[], requiredExperienceMonths, postedDate, status (active|expired)
  - indexes: jobUrl unique, postedDate, requiredSkills, status and (platform + jobKey) unique

- Application
  - purpose: track user job applications and status transitions
  - key fields: user, resume, jobId, platform, jobUrl, fitScore, status, statusHistory
  - unique index on (user, platform, jobId)

- Feedback
  - purpose: collect user research & NPS-style data
  - includes rating, issues, NPS score and freeform responses

## API overview (observed routes)

The repository groups routes logically. The concrete routes inspected include:

- Authentication
  - POST /api/auth/google — verify Google ID token, sign-in
  - GET /api/auth/me — fetch current user (protected)
  - POST /api/auth/logout — clear JWT cookie (protected)

- User / Resume
  - POST /api/user/upload-resume — upload and analyze resume (protected)
  - GET /api/user/resume — fetch stored resume (protected)

- Jobs / Recommendations
  - backend/routes/jobRoutes.js contains job-related endpoints used by the frontend; review the controller to see exact query parameters and response shapes.

- Feedback
  - POST /api/feedback — submit product feedback (controller and model present)

- Admin
  - backend/routes/adminRoutes.js — admin analytics and management endpoints (controller present)

For exact request/response shapes, query parameters and pagination parameters, consult each controller in backend/controllers.

## Environment variables (required or used)

Backend:
- PORT — port for Express server (required)
- MONGO_URL — MongoDB connection URI (required)
- JWT_SECRET — secret for signing/verifying JWTs (required)
- GOOGLE_CLIENT_ID — Google OAuth Client ID (required for token verification)
- GOOGLE_CLIENT_SECRET — may be used for other OAuth flows if implemented
- CLIENT_URL — allowed frontend origin for CORS (required for cross-origin requests)
- GEMINI_API_KEY — API key for Google GenAI client (required for AI resume analysis)
- NODE_ENV — environment (development|production)

Frontend:
- VITE_API_URL — base API url used by the frontend (required in development)

Example .env (backend)
```
PORT=5000
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/matchora
JWT_SECRET=<your_jwt_secret>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=<your_genai_api_key>
NODE_ENV=development
```

Example .env.local (frontend)
```
VITE_API_URL=http://localhost:5000
```

## Local development (quick start)

1. Clone
```bash
git clone https://github.com/abhinav84094/Matchora.git
cd Matchora
```

2. Backend
```bash
cd backend
npm install
# create a backend/.env with the variables above
npm start
# 'start' runs nodemon server.js per backend/package.json
```

3. Frontend
```bash
cd ../frontend
npm install
# create frontend/.env.local with VITE_API_URL
npm run dev
```

4. Database
- Ensure MongoDB instance is available (local or Atlas). Set MONGO_URL accordingly.

5. Job data
- The server does not schedule job ingestion. Recommendations read active Job documents already stored in MongoDB.

## Security & production notes (what is implemented)

- Google ID token verification is done server-side for authentication.
- JWTs are returned in HTTP-only cookies; secure and sameSite flags are configured for production (`isProduction` check in authController).
- Environment variables are used for secrets (no secrets are stored in code).
- Uploads currently use a local `uploads/` directory created at server startup (backend/server.js). For production, move to cloud storage and include antivirus scanning / stricter validation.
- authMiddleware ensures protected endpoints require valid JWT and existing user.

Note: Additional production-grade security (rate limiting, Helmet, strong input validation everywhere, virus scanning on uploads) should be added before exposing to large-scale traffic — only the existing measures from the codebase are described here.

## Performance considerations & operational notes

- Recommendation requests read active job documents and apply resume-based matching.
- Job model indexes (jobUrl, postedDate, requiredSkills, status) help query performance.
- Resume uploads are rate-limited via nextUploadAt to prevent repeated expensive AI calls.
- For scale, consider caching recommendation results, adding background worker queues, and sharding job storage as required.

## Current status

Matchora is an MVP implementation that includes:
- Google authentication and JWT session handling
- Resume upload, text extraction, and AI-assisted analysis
- Resume-based recommendations over stored job listings
- Application tracking and feedback collection

Job ingestion is not currently scheduled by the backend.

## Roadmap

Implemented (in codebase):
- Authentication, resume parsing & AI analysis, job matching, application tracking, feedback, admin routes, and cleanup tasks.

Planned / suggested improvements (not currently implemented unless present in code):
- Add a job-ingestion service and integrate job sources.
- Move uploads to cloud storage and enable file scanning.
- Add server-side rate limiting, security headers and input validation.
- Improve analytics dashboards and monitoring.
- Add CI, tests and production deployment manifests.

## Contributing

- Fork the repository.
- Create a feature branch: git checkout -b feature/your-feature.
- Run linters and tests locally (tests to be added).
- Commit changes and open a Pull Request describing the change.

If you add a job-ingestion source or modify AI prompts, review the relevant service and respect source terms of service and API usage limits.
