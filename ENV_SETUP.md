# Environment Variables

This document describes the environment variables used in the application.

## Frontend (apps/web)

Copy `.env.example` to `.env.local` and configure:

### Clerk Authentication
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

### API Configuration
```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3001

# Production (example)
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Notes:
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- In production, update `NEXT_PUBLIC_API_URL` to your deployed backend URL
- Never commit `.env.local` to git (it's in .gitignore)

## Backend (apps/api)

Copy `.env.example` to `.env` and configure:

```bash
PORT=3001
NODE_ENV=development

# In production
# NODE_ENV=production
# PORT=3001
```

## Environment Detection

The app automatically detects the environment:
- **Development**: `NODE_ENV=development` (default)
- **Production**: `NODE_ENV=production`

Config is centralized in `apps/web/lib/config.ts`
