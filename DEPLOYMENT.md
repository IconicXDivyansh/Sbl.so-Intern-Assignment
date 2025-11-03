# Deployment Guide

Complete guide for deploying the Website Q&A application.

## 🏗️ Architecture

```
Vercel (Frontend) → Render (API) → Render (PostgreSQL + Redis)
                                 ↓
                        Render (Background Worker)
```

---

## 📦 Part 1: Backend Deployment (Render)

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

---

### Step 2: Deploy PostgreSQL Database

1. From Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `website-qa-db`
   - **Database**: `website_qa`
   - **User**: `postgres` (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: **Free** (90 days free, then $7/month)
3. Click **"Create Database"**
4. **Save these credentials** (you'll need them):
   - Internal Database URL (for API)
   - External Database URL (for local development)

---

### Step 3: Deploy Redis Instance

1. Click **"New +"** → **"Redis"**
2. Configure:
   - **Name**: `website-qa-redis`
   - **Region**: Same as PostgreSQL
   - **Plan**: **Free** (90 days free, then $7/month)
   - **Maxmemory Policy**: `allkeys-lru`
3. Click **"Create Redis"**
4. **Save the Internal Redis URL**

---

### Step 4: Deploy API Server

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `IconicXDivyansh/Sbl.so-Intern-Assignment`
3. Configure:
   - **Name**: `website-qa-api`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     cd ../.. && pnpm install && cd apps/api && pnpm build
     ```
   - **Start Command**: 
     ```bash
     node dist/index.js
     ```
   - **Plan**: **Free**

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

```bash
NODE_ENV=production
PORT=3001

# Database (from Step 2 - use Internal Database URL)
DATABASE_URL=postgresql://postgres:password@hostname/database

# Redis (from Step 3 - use Internal Redis URL)
REDIS_HOST=hostname
REDIS_PORT=6379

# Groq AI (your API key)
GROQ_API_KEY=your_groq_api_key_here

# Clerk Authentication (from clerk.com dashboard)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Frontend URL (will be from Vercel, update after frontend deployment)
FRONTEND_URL=http://localhost:3000
```

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Save your API URL**: `https://website-qa-api.onrender.com`

---

### Step 5: Deploy Background Worker

1. Click **"New +"** → **"Background Worker"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `website-qa-worker`
   - **Region**: Same as API
   - **Branch**: `main`
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     cd ../.. && pnpm install && cd apps/api && pnpm build
     ```
   - **Start Command**: 
     ```bash
     node dist/index.js
     ```
   - **Plan**: **Free**

4. **Add Same Environment Variables as API** (copy from Step 4)

5. Click **"Create Background Worker"**

---

## 🎨 Part 2: Frontend Deployment (Vercel)

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel

---

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Import `IconicXDivyansh/Sbl.so-Intern-Assignment`
3. Configure:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web`
   - **Build Command**: Leave default
   - **Output Directory**: Leave default

---

### Step 3: Configure Environment Variables

Click **"Environment Variables"** and add:

```bash
# API Endpoint (from Render Step 4)
NEXT_PUBLIC_API_URL=https://website-qa-api.onrender.com

# Clerk Authentication (same keys as backend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

---

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. **Save your Frontend URL**: `https://your-app.vercel.app`

---

### Step 5: Update Backend CORS

1. Go back to **Render Dashboard**
2. Open your **API Service** (`website-qa-api`)
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```bash
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Save and wait for API to redeploy (~2 minutes)

---

## 🔧 Part 3: Run Database Migrations

Since Render doesn't have a built-in way to run migrations, you need to do this manually:

### Option A: From Local Machine (Recommended)

1. Copy the **External Database URL** from Render PostgreSQL dashboard
2. Run locally:
   ```bash
   cd /path/to/project/packages/database
   DATABASE_URL="postgresql://..." pnpm db:push
   ```

### Option B: From Render Shell

1. Go to Render API Service
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd /opt/render/project/src/packages/database
   pnpm db:push
   ```

---

## ✅ Part 4: Verify Deployment

### Test Checklist:

1. **Frontend Health**:
   - Visit `https://your-app.vercel.app`
   - Should see landing page
   - Click "Get Started" → Should redirect to Clerk login

2. **Backend Health**:
   - Visit `https://website-qa-api.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Authentication**:
   - Sign up/login via Clerk
   - Should redirect to dashboard

4. **Submit Task**:
   - Enter URL and question
   - Submit task
   - Should see "Task submitted!" message
   - Task should appear in list

5. **Worker Processing**:
   - Wait 30-60 seconds
   - Task status should change: pending → processing → completed
   - Click task to see answer

---

## ⚠️ Important Notes

### Free Tier Limitations:

**Render Free Tier**:
- API goes to sleep after 15 min inactivity (cold start ~30s)
- 750 hours/month (sufficient for 1 service)
- PostgreSQL free for 90 days
- Redis free for 90 days

**Solutions**:
- Use [cron-job.org](https://cron-job.org) to ping API every 10 minutes
- After 90 days, consider upgrading DB/Redis ($7/month each)

**Vercel Free Tier**:
- 100GB bandwidth/month
- Unlimited deployments
- No sleep mode

---

## 🔐 Security Post-Deployment

1. **Update Clerk URLs**:
   - Go to [clerk.com](https://clerk.com) dashboard
   - Add production URLs to allowed origins
   - Update redirect URLs

2. **Verify CORS**:
   ```bash
   curl -H "Origin: https://evil-site.com" \
     https://website-qa-api.onrender.com/api/tasks
   # Should return CORS error
   ```

3. **Test Rate Limiting**:
   - Try submitting 11 tasks quickly
   - Should get "Too many requests" error

4. **Monitor Logs**:
   - Render: Check service logs for errors
   - Vercel: Check function logs

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in Vercel env vars
- Verify API is running in Render
- Check browser console for CORS errors

### Tasks stuck in "pending"
- Check Background Worker is running in Render
- Verify Redis connection in worker logs
- Check worker environment variables

### Database connection errors
- Verify `DATABASE_URL` is correct
- Check if database is running in Render
- Ensure migrations were run

### Puppeteer errors in worker
- Render free tier has limited memory
- May need to upgrade to paid plan for stability
- Check worker logs for OOM errors

---

## 📊 Monitoring

### Render Logs:
```bash
# API logs
https://dashboard.render.com/web/[service-id]/logs

# Worker logs
https://dashboard.render.com/bgs/[service-id]/logs
```

### Vercel Logs:
```bash
# Function logs
https://vercel.com/[username]/[project]/logs
```

---

## 🚀 CI/CD (Auto-Deploy)

Both Vercel and Render auto-deploy on git push:

1. Make changes locally
2. Commit and push to `main` branch
3. Vercel automatically deploys frontend
4. Render automatically deploys backend + worker

**Deploy to staging first** (optional):
- Create `staging` branch
- Configure separate Render/Vercel deployments
- Test before merging to `main`

---

## 💰 Cost Breakdown

### Current (Free):
- Vercel: $0
- Render API: $0
- Render Worker: $0
- PostgreSQL: $0 (first 90 days)
- Redis: $0 (first 90 days)
- **Total**: $0/month

### After 90 Days:
- Vercel: $0
- Render API: $0
- Render Worker: $0
- PostgreSQL: $7/month
- Redis: $7/month
- **Total**: $14/month

### Alternative (Keep Free):
- Use [Supabase](https://supabase.com) (free PostgreSQL)
- Use [Upstash](https://upstash.com) (free Redis with limits)
- **Total**: $0/month (with limitations)

---

## 🔄 Updating Environment Variables

### Render:
1. Go to service → Environment tab
2. Update variables
3. Save → Auto redeploys

### Vercel:
1. Go to project → Settings → Environment Variables
2. Update variables
3. Redeploy (or push to trigger auto-deploy)

---

## 📝 Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Update CORS with Vercel URL
4. ✅ Run database migrations
5. ✅ Test full flow
6. ✅ Set up monitoring
7. ✅ Update Clerk settings
8. 🎉 Share your app!

---

**Deployment Date**: November 3, 2025
**Status**: Ready for production
**Estimated Setup Time**: 30-45 minutes

Good luck with your deployment! 🚀
