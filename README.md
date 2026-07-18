# Lead Capture AI Agent

Full-stack engineering assignment for Oplify Solutions. The app captures inbound leads, stores them in PostgreSQL, qualifies them with AI, drafts a first-response email, and shows the results in a simple admin panel.

### demo
/assets/demo.mp4

## Features

- Responsive lead capture form built with Next.js, React Hook Form, Zod, and Tailwind CSS.
- Express REST API with centralized validation and error handling.
- PostgreSQL persistence with a checked `Hot`, `Warm`, or `Cold` AI score.
- OpenAI Responses API integration for lead qualification and first-response drafting.
- Admin panel at `/admin` with lead list, score indicators, email drafts, and score distribution.
- Bonus feature: smart duplicate detection blocks repeat submissions from the same email within 30 days.
- Local fallback qualification mode so reviewers can demo the flow even without an API key.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, React Hook Form, Zod
- Backend: Node.js, Express, PostgreSQL, Zod
- AI: OpenAI Responses API

## Folder Structure

```text
lead-capture-agent/
  backend/
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      validators/
  database/
    schema.sql
  frontend/
    app/
      admin/
    components/
    lib/
    types/
```

## Setup

1. Install dependencies.

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. Create the PostgreSQL database and apply the schema.

```bash
npm run db:setup
```

On Windows this script finds PostgreSQL under `C:\Program Files\PostgreSQL\...\bin`, so `createdb` and `psql` do not need to be on PATH.

3. Configure environment variables.

Create `backend/.env` from `backend/.env.example`.

```bash
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/lead_capture_agent
PGSSL=false
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5
AI_QUALIFICATION_MODE=
ADMIN_TOKEN=
```

Create `frontend/.env.local` from `frontend/.env.local.example`.

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

4. Run the app in two terminals.

```bash
npm run dev:backend
npm run dev:frontend
```

Or, on Windows, run both in separate PowerShell windows:

```bash
npm run dev
```

5. Open the app.

- Capture form: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`
- API health check: `http://localhost:4000/health`

## API Endpoints

- `POST /leads` validates, duplicate-checks, saves, qualifies, and returns the lead.
- `GET /leads` lists recent leads for the admin panel.
- `GET /leads/stats` returns dashboard counts.
- `GET /health` returns API health.

## Environment Variables

### Backend

- `PORT`: API port, defaults to `4000`.
- `CORS_ORIGIN`: frontend origin allowed to call the API.
- `DATABASE_URL`: PostgreSQL connection string.
- `PGSSL`: set to `true` for hosted Postgres providers that require SSL.
- `ADMIN_TOKEN`: protects `GET /leads` and `GET /leads/stats` when set.
- `OPENAI_API_KEY`: enables real AI qualification.
- `OPENAI_MODEL`: model used by the qualifier. Defaults to `gpt-5.5`.
- `AI_QUALIFICATION_MODE`: set to `fallback` to force the deterministic local qualifier.

### Frontend

- `NEXT_PUBLIC_API_URL`: backend API base URL.

## My AI orchestration decisions

I chose OpenAI's Responses API because the official OpenAI docs position it as the recommended API for text generation work, especially for current reasoning models. The model is configurable through `OPENAI_MODEL`, with `gpt-5.5` as the default because the current docs use it in Responses API examples and it is strong enough to produce reliable structured qualification output.

Prompt structure:

- The system-style `instructions` tell the model it is a B2B sales development assistant for Oplify.
- The lead is passed as JSON with `fullName`, `email`, `businessName`, and `message`.
- The model is required to return only JSON with `score`, `reason`, and `emailDraft`.
- The scoring rubric is explicit: urgent business problem, budget, timeline, demo, quote, or implementation signals push toward `Hot`; unclear but plausible needs are `Warm`; vague or non-commercial submissions are `Cold`.

Tradeoffs considered:

- I kept the prompt compact to reduce latency and token usage.
- I used a strict post-processing layer in code so an unexpected model response cannot break the database contract.
- I added a deterministic fallback path. In production I would alert on fallback usage, but for this assignment it keeps the form, API, database, and admin demo working when no API key is available.

## AI tools I used and how

- Claude was used earlier to draft the Task 1 foundation and folder structure.
- Codex was used to review the assignment PDFs, audit the existing repo, identify missing Task 2 and Task 3 requirements, implement the AI qualifier, admin panel, duplicate detection, schema expansion, and README.
- I used AI as a reviewer and implementation partner, not only autocomplete: it helped compare the current code against the assignment rubric, decide what to keep, and tighten the product flow for the demo.

## Bonus Feature

The bonus feature is smart duplicate detection. Before saving a new lead, the API checks whether the same email has submitted a lead in the last 30 days. If it finds one, the API returns `409 Conflict` with a field-level email error. This protects the sales queue from repeated submissions while still allowing old leads to come back later.

The admin panel also includes a lightweight score distribution dashboard so a business owner can quickly see whether the pipeline is mostly Hot, Warm, or Cold.

## Demo Walkthrough Checklist

For the Loom recording:

1. Submit a lead from `http://localhost:3000`.
2. Show the returned AI score, reason, and generated email draft on the confirmation panel.
3. Open `http://localhost:3000/admin`.
4. Show the saved lead in the admin list with the same score and draft.
5. Open PostgreSQL and run:

```sql
SELECT full_name, email, business_name, ai_score, ai_score_reason, ai_email_draft
FROM leads
ORDER BY created_at DESC
LIMIT 5;
```

6. Try submitting the same email again to show duplicate detection.

## Deploying On Free Tiers

### Render: backend API + PostgreSQL

Render docs currently support free web services and free Render Postgres, but free Postgres expires 30 days after creation. That is fine for an assignment demo, but do not treat it as permanent storage.

1. Push this repository to GitHub.
2. In Render, create a new PostgreSQL database:
   - Name: `lead-capture-agent-db`
   - Database: `lead_capture_agent`
   - Plan: Free
   - Region: choose the same region you will use for the backend service.
3. In Render, create a new Web Service from the same GitHub repo:
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install && npm run migrate`
   - Start Command: `npm start`
   - Plan: Free
   - Health Check Path: `/health`
4. Add backend environment variables in Render:

```text
NODE_ENV=production
DATABASE_URL=<Render Postgres internal database URL>
PGSSL=false
CORS_ORIGIN=https://your-vercel-project.vercel.app
ADMIN_TOKEN=<make-a-long-random-admin-password>
OPENAI_API_KEY=<optional for real AI scoring>
OPENAI_MODEL=gpt-5.5
AI_QUALIFICATION_MODE=fallback
```

Use `AI_QUALIFICATION_MODE=fallback` if you do not want to spend API credits. Remove the value if you add a real `OPENAI_API_KEY`.

Do not commit `.env`, `.env.local`, API keys, database passwords, or `ADMIN_TOKEN`. The `.gitignore` already excludes those local files.

### Vercel: frontend

1. Import the same GitHub repo in Vercel.
2. Set Root Directory to `frontend`.
3. Vercel should auto-detect Next.js. Keep the default build command unless you changed it.
4. Add this environment variable:

```text
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com
```

5. Deploy.
6. Copy the deployed Vercel URL and update Render's `CORS_ORIGIN` to that exact URL.
7. Redeploy the Render backend after changing `CORS_ORIGIN`.

Final hosted URLs:

- Frontend: `https://your-vercel-project.vercel.app`
- Admin panel: `https://your-vercel-project.vercel.app/admin`
- Backend health check: `https://your-render-api.onrender.com/health`

When `ADMIN_TOKEN` is set on Render, enter the same token in the admin page token field to view leads.
