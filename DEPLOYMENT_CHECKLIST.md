# Deployment Quick Start

Follow this checklist to deploy your application in ~30 minutes.

## ✅ Pre-Deployment Checklist

- [ ] GitHub repository pushed and up-to-date
- [ ] Groq API key ready
- [ ] Clerk account created with keys
- [ ] Render account created
- [ ] Vercel account created

---

## 🚀 Deployment Steps

### 1️⃣ Backend (Render) - 20 minutes

#### Database Setup (5 min)
- [ ] Create PostgreSQL database on Render (Free)
- [ ] Save Internal Database URL
- [ ] Note: Free for 90 days

#### Redis Setup (3 min)
- [ ] Create Redis instance on Render (Free)
- [ ] Save Internal Redis URL
- [ ] Note: Free for 90 days

#### API Service (7 min)
- [ ] Create Web Service on Render
- [ ] Connect GitHub repo
- [ ] Set root directory: `apps/api`
- [ ] Build: `cd ../.. && pnpm install && cd apps/api && pnpm build`
- [ ] Start: `node dist/index.js`
- [ ] Add all environment variables (see DEPLOYMENT.md)
- [ ] Deploy and save API URL

#### Background Worker (5 min)
- [ ] Create Background Worker on Render
- [ ] Connect same GitHub repo
- [ ] Use same settings as API
- [ ] Copy all environment variables from API
- [ ] Deploy

---

### 2️⃣ Frontend (Vercel) - 10 minutes

#### Vercel Setup (5 min)
- [ ] Import project from GitHub
- [ ] Set framework: Next.js
- [ ] Set root directory: `apps/web`
- [ ] Add environment variables:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- [ ] Deploy and save frontend URL

#### Update Backend CORS (2 min)
- [ ] Go to Render API service
- [ ] Update `FRONTEND_URL` env var with Vercel URL
- [ ] Save and wait for redeploy

#### Update Clerk Settings (3 min)
- [ ] Go to clerk.com dashboard
- [ ] Add Vercel URL to allowed origins
- [ ] Update redirect URLs

---

### 3️⃣ Database Migration - 5 minutes

- [ ] Copy External Database URL from Render
- [ ] Run locally: `DATABASE_URL="..." pnpm db:push`
- [ ] Verify tables created

---

### 4️⃣ Testing - 5 minutes

- [ ] Visit frontend URL - should load
- [ ] Check API health: `[api-url]/health`
- [ ] Sign up / Login with Clerk
- [ ] Submit a test task
- [ ] Wait for processing (~60 seconds)
- [ ] Verify answer appears

---

## 🎯 Environment Variables Reference

### Backend (Render)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=[from Render PostgreSQL]
REDIS_HOST=[from Render Redis]
REDIS_PORT=6379
GROQ_API_KEY=[your key]
CLERK_PUBLISHABLE_KEY=[from clerk.com]
CLERK_SECRET_KEY=[from clerk.com]
FRONTEND_URL=[from Vercel deployment]
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=[from Render API]
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[from clerk.com]
CLERK_SECRET_KEY=[from clerk.com]
```

---

## ⚠️ Common Issues & Solutions

### API not responding
✅ Check if service is sleeping (Render free tier)
✅ Visit API URL to wake it up
✅ Set up cron job to ping every 10 minutes

### Worker not processing tasks
✅ Check worker is running in Render
✅ Verify Redis connection
✅ Check worker logs for errors

### CORS errors
✅ Verify `FRONTEND_URL` in Render matches Vercel URL
✅ Check Vercel URL doesn't have trailing slash
✅ Redeploy API after changing CORS

### Database errors
✅ Ensure migrations were run
✅ Check `DATABASE_URL` is correct
✅ Verify database is active in Render

---

## 📱 Deployment URLs

After deployment, save these URLs:

- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://website-qa-api.onrender.com`
- **API Health**: `https://website-qa-api.onrender.com/health`
- **Database**: Internal URL from Render
- **Redis**: Internal URL from Render

---

## 🎉 Post-Deployment

- [ ] Test all features
- [ ] Monitor logs for errors
- [ ] Set up uptime monitoring (optional)
- [ ] Share your app!

---

**Total Time**: ~40 minutes
**Cost**: $0/month (first 90 days)
**Status**: Production ready! 🚀
