# 405 Method Not Allowed - ROOT CAUSE FOUND & FIXED

## The Problem

Your app was returning **405 Method Not Allowed** for POST requests to:
```
POST /api/events/[id]/responses
```

## Root Cause

**The `vercel.json` rewrite rule was intercepting ALL routes**, including API routes.

### Before (BROKEN):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/frontend/index.html" }
  ]
}
```

This regex pattern `(.*)` matches **everything**, so when you made a POST to `/api/events/event-123/responses`, Vercel was:
1. Matching the route with the rewrite rule
2. Redirecting it to `/frontend/index.html` (a static HTML file)
3. Static HTML files don't handle POST requests → **405 Method Not Allowed**

### After (FIXED):
```json
{
  "rewrites": [
    { "source": "/((?!api).*)", "destination": "/frontend/index.html" }
  ]
}
```

The regex pattern `((?!api).*)` uses a **negative lookahead** that means:
- Match any path that does **NOT** start with `api`
- So `/` → redirects to HTML ✅
- `/about` → redirects to HTML ✅
- `/api/events` → NOT matched, routes to serverless function ✅
- `/api/events/123/responses` → NOT matched, routes to serverless function ✅

## Why This Happened

This is a common mistake in Vercel SPAs (Single Page Applications). The rewrite rule is meant to make the app work with client-side routing (so `/about` loads the HTML and lets the frontend router handle it), but it was **too broad** and caught API routes too.

## Files Changed

### 1. vercel.json (CRITICAL FIX)
```diff
{
  "rewrites": [
-    { "source": "/(.*)", "destination": "/frontend/index.html" }
+    { "source": "/((?!api).*)", "destination": "/frontend/index.html" }
  ],
  ...
}
```

### 2. api/events/[id]/responses.ts
- Added comprehensive error logging
- Added DATABASE_URL validation
- Returns detailed error messages to frontend

### 3. api/events.ts
- Same error handling improvements

### 4. frontend/index.html
- Improved error parsing and display
- Logs detailed errors to console

## Deploy Instructions

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Fix Vercel routing and error handling"

# Push to trigger auto-deployment
git push
```

**Vercel will automatically redeploy** (if connected to GitHub/GitLab/Bitbucket).

## Testing After Deployment

1. Wait for Vercel deployment to complete (~1-2 minutes)
2. Go to https://whenisgoodclone.vercel.app
3. Open DevTools (F12) → Console
4. Try submitting availability
5. You should now see proper API calls instead of 405 errors

**Expected console output if working:**
```
[responses.ts] Received POST request: { eventId: "event-...", body: {...} }
[responses.ts] Validated data: {...}
[responses.ts] Response created successfully: <uuid>
```

**If you still get errors**, they'll now be detailed instead of generic 405s.

## Verification Commands

Check that the rewrite rule is correct:
```bash
cat vercel.json | grep -A 1 "rewrites"
```

Should output:
```json
"rewrites": [
  { "source": "/((?!api).*)", "destination": "/frontend/index.html" }
```

## Next Steps

1. **Run the SQL migration** in Supabase (see `supabase-migration.sql`)
2. **Verify `DATABASE_URL`** is set in Vercel environment variables
3. **Deploy** the code changes
4. **Test** the app

Follow the complete guide in `DEPLOYMENT_CHECKLIST.md`.

## Technical Details

### Vercel Routing Priority
1. **Static files** in `public/` or `frontend/` (served directly)
2. **Serverless functions** in `api/` folder
3. **Rewrites** from `vercel.json` (our catch-all for SPA routing)

The rewrite rule was running **before** Vercel could route to serverless functions because it matched everything. The negative lookahead fixes this.

### Regex Explanation
- `(.*)` - Match any character (`.`) zero or more times (`*`), capture in group
- `(?!api)` - Negative lookahead: only match if the next characters are NOT "api"
- `((?!api).*)` - Match anything that doesn't start with "api"

This ensures:
- `/` matches ✅
- `/dashboard` matches ✅
- `/api/anything` does NOT match ✅ (routes to serverless function)
