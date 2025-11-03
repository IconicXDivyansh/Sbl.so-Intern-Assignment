# 🤖 AI-Powered Website Q&A Platform

> Ask questions about any website and get instant AI-powered answers

A full-stack application that scrapes website content and uses AI to intelligently answer user questions. Built with a modern monorepo architecture featuring Next.js, Express, BullMQ, and Groq AI.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

---

## 🎯 Overview

This application allows users to:
- Submit any website URL with a question
- AI scrapes and analyzes the website content
- Get intelligent, context-aware answers in real-time
- Manage task history with status tracking
- Retry failed tasks and delete completed ones

**Workflow:**
```
URL + Question (Frontend) → API validates & saves to DB → BullMQ queue → Worker scrapes with Puppeteer → Groq AI processes → Answer saved to DB → Frontend displays result
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **Markdown:** react-markdown

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Queue:** BullMQ + Redis
- **Database:** PostgreSQL (Drizzle ORM)
- **Web Scraping:** Puppeteer
- **AI:** Groq SDK (Llama 3.3 70B)

### Infrastructure
- **Monorepo:** Turborepo
- **Package Manager:** pnpm
- **Frontend Hosting:** Vercel
- **API Hosting:** Railway
- **Database:** Supabase PostgreSQL
- **Cache/Queue:** Upstash Redis

---

## 🏗️ Architecture

```
apps/
├── web/           # Next.js frontend
├── api/           # Express API + BullMQ worker
packages/
├── database/      # Shared Drizzle ORM schema
├── typescript-config/  # Shared TS configs
```

**Key Features:**
- 🔐 **Authentication:** Clerk handles user sign-in/sign-up
- 🛡️ **Security:** Rate limiting, input validation, CORS, Helmet
- 📊 **Database:** User-specific task storage with Drizzle ORM
- 🔄 **Queue:** Background processing with BullMQ
- 🤖 **AI:** Groq's Llama 3.3 70B model for intelligent answers
- 🕷️ **Scraping:** Puppeteer extracts website content

---

## ✅ Prerequisites

- **Node.js** 18+ and **pnpm** 9+
- **Git** for version control
- Accounts for:
  - [Clerk](https://clerk.com) (Authentication)
  - [Supabase](https://supabase.com) (PostgreSQL)
  - [Upstash](https://upstash.com) (Redis)
  - [Groq](https://groq.com) (AI API)
  - [Vercel](https://vercel.com) (Frontend deployment)
  - [Railway](https://railway.app) (API deployment)

---

## 🚀 Local Development

### 1. Clone Repository

```bash
git clone https://github.com/IconicXDivyansh/Sbl.so-Intern-Assignment.git
cd Sbl.so-Intern-Assignment
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

#### **Frontend (.env.local in `apps/web/`)**

Create `apps/web/.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### **Backend (.env in `apps/api/`)**

Create `apps/api/.env`:

```env
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Redis (Upstash)
REDIS_URL=rediss://default:[PASSWORD]@[HOST]:6379

# Groq AI
GROQ_API_KEY=gsk_...

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### **Database Package (.env in `packages/database/`)**

Create `packages/database/.env`:

```env
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 4. Set Up Database

Push the schema to Supabase:

```bash
cd packages/database
pnpm db:push
```

This creates the `tasks` table in your PostgreSQL database.

### 5. Build Shared Packages

```bash
pnpm --filter @repo/database build
```

### 6. Run Development Servers

**Terminal 1 - API Server:**
```bash
pnpm --filter api dev
```

**Terminal 2 - Frontend:**
```bash
pnpm --filter web dev
```

**Access the app:**
- Frontend: http://localhost:3000
- API: http://localhost:3001

---

## 🌐 Production Deployment

### Prerequisites

- GitHub repository with your code
- Accounts set up for all services (see [Prerequisites](#prerequisites))

### 1. Deploy Database (Supabase)

1. Create a new project at [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **Settings → Database → Connection String**
3. Copy the **Connection Pooling** URL (port 6543):
   ```
   postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. Push schema from local:
   ```bash
   cd packages/database
   # Update .env with your Supabase URL
   pnpm db:push
   ```

### 2. Set Up Redis (Upstash)

1. Create a Redis database at [Upstash Console](https://console.upstash.com)
2. Select **TLS enabled** (required for Railway)
3. Copy the connection string:
   ```
   rediss://default:[PASSWORD]@[HOST]:6379
   ```

### 3. Configure Authentication (Clerk)

1. Create an application at [Clerk Dashboard](https://dashboard.clerk.com)
2. Copy your API keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - `CLERK_SECRET_KEY` (starts with `sk_test_`)
3. **Note:** For production, switch to live keys (`pk_live_` / `sk_live_`) after adding a custom domain

### 4. Get AI API Key (Groq)

1. Sign up at [Groq Console](https://console.groq.com)
2. Create an API key
3. Copy `GROQ_API_KEY` (starts with `gsk_`)

### 5. Deploy API (Railway)

1. Go to [Railway Dashboard](https://railway.app)
2. **New Project → Deploy from GitHub repo**
3. Select your repository
4. **Important:** Set root directory to project root (not `apps/api`)
5. Add environment variables:

```env
PORT=3001
NODE_ENV=production

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Database
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Redis
REDIS_URL=rediss://default:[PASSWORD]@[HOST]:6379

# Groq AI
GROQ_API_KEY=gsk_...

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

6. Railway will auto-detect build/start commands from `package.json`
7. Copy your Railway API URL: `https://api-production-xxxx.up.railway.app`

### 6. Deploy Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com)
2. **Import Project → GitHub repository**
3. Set **Root Directory:** `apps/web`
4. Add environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API URL (from Railway)
NEXT_PUBLIC_API_URL=https://api-production-xxxx.up.railway.app
```

5. Deploy
6. Copy your Vercel URL: `https://your-app.vercel.app`

### 7. Update Railway with Vercel URL

1. Go back to **Railway → Your API service → Variables**
2. Update `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will auto-redeploy with updated CORS settings

### 8. Verify Deployment

1. Visit your Vercel URL
2. Sign up/sign in with Clerk
3. Submit a URL + question
4. Wait for AI to process (~10-30 seconds)
5. View the answer with markdown formatting

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection pooling URL | `postgresql://postgres.xxx:...@...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `REDIS_URL` | Upstash Redis with TLS | `rediss://default:...@...upstash.io:6379` |
| `GROQ_API_KEY` | Groq AI API key | `gsk_...` |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` or `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` or `https://api-production-xxxx.up.railway.app` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |

---

## 📁 Project Structure

```
Sbl.so-Intern-Assignment/
├── apps/
│   ├── api/                    # Express API
│   │   ├── src/
│   │   │   ├── index.ts        # Main server with routes
│   │   │   ├── queue/          # BullMQ queue setup
│   │   │   ├── workers/        # Background task worker
│   │   │   └── services/       # AI & scraping services
│   │   └── package.json
│   │
│   └── web/                    # Next.js frontend
│       ├── app/
│       │   ├── page.tsx        # Landing page
│       │   ├── home/           # Dashboard (authenticated)
│       │   ├── sign-in/        # Clerk sign-in page
│       │   └── sign-up/        # Clerk sign-up page
│       ├── components/         # React components
│       └── package.json
│
├── packages/
│   ├── database/               # Shared database package
│   │   ├── src/
│   │   │   ├── index.ts        # Drizzle client
│   │   │   └── schema.ts       # Database schema
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── typescript-config/      # Shared TS configs
│
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace config
└── package.json                # Root package.json
```

---

## 🐛 Troubleshooting

### API 500 Errors

- **Check Railway logs** for detailed errors
- Verify `DATABASE_URL` uses connection pooling (port 6543)
- Ensure `REDIS_URL` uses TLS (`rediss://`)
- Confirm database table exists: `pnpm --filter database db:push`

### CORS Errors

- Verify `FRONTEND_URL` in Railway matches Vercel URL exactly (no trailing slash)
- Check Railway logs for X-Forwarded-For errors (should be fixed with `trust proxy`)

### Authentication Issues

- For production, use Clerk live keys with custom domain
- Development keys (`pk_test_`) work fine for testing
- Verify sign-in/sign-up pages exist at `/sign-in` and `/sign-up`

### Worker Not Processing

- Check Redis connection in Railway logs
- Verify `GROQ_API_KEY` is valid
- Ensure Puppeteer can run in Railway environment

---

## 📝 License

This project is part of an internship assignment for Sbl.so.

---

## 🤝 Contributing

This is an assignment project. For questions or issues, contact the repository owner.

---

**Built with ❤️ using Turborepo, Next.js, Express, BullMQ, and Groq AI**
