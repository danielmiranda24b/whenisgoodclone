# Deployment Checklist - Fix "Failed to submit" Error

## Problem Summary
Your app fails when submitting availability because:
1. **CRITICAL: Incorrect Vercel routing** - The `vercel.json` rewrite was catching API routes and redirecting them to the HTML file (causing 405 Method Not Allowed errors)
2. **Missing database tables** - The `practice_scheduler` schema and tables don't exist in Supabase
3. **No RLS policies** - Supabase blocks all operations without Row Level Security policies
4. **Poor error visibility** - Generic error messages hide the actual problem

## Required Environment Variables for Vercel

Make sure these are set in your Vercel project settings:

| Variable Name | Example Value | Where to Get It |
|--------------|---------------|-----------------|
| `DATABASE_URL` | `postgresql://postgres:yourpass@db.xxx.supabase.co:5432/postgres?sslmode=require` | Supabase Dashboard → Settings → Database → Connection string → URI |

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password.

## Step-by-Step Fix

### 1. Run the SQL Migration in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy the **entire contents** of `supabase-migration.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Ctrl+Enter)

**Expected output:** You should see:
```
Success. No rows returned
```

### 2. Verify Tables Were Created

Run this query in the SQL Editor to check:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'practice_scheduler';
```

**Expected output:**
```
events
responses
```

### 3. Verify RLS Policies Exist

Run this query:

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'practice_scheduler';
```

**Expected output:** You should see 4 policies:
- `Allow public read access to events`
- `Allow public insert access to events`
- `Allow public read access to responses`
- `Allow public insert access to responses`

### 4. Verify Environment Variable in Vercel

1. Go to your Vercel dashboard: https://vercel.com
2. Select your `whenisgoodclone` project
3. Go to **Settings** → **Environment Variables**
4. Confirm `DATABASE_URL` exists and has the correct Supabase connection string
5. If you just added it or changed it, click **Redeploy** in the Deployments tab

### 5. Deploy Your Code Changes

**CRITICAL FIX APPLIED**: The `vercel.json` routing has been fixed to exclude API routes from the HTML rewrite.

The following files have been updated:
- ✅ `vercel.json` - **Fixed rewrite rule** to not intercept API routes (was causing 405 errors)
- ✅ `api/events/[id]/responses.ts` - Enhanced error logging
- ✅ `api/events.ts` - Enhanced error logging
- ✅ `frontend/index.html` - Better error display

Deploy them:

```bash
# If using Git:
git add .
git commit -m "Fix Vercel routing and error handling"
git push

# Vercel will auto-deploy if connected to Git
# Or manually trigger a redeploy in Vercel dashboard
```

### 6. Test the Fix

1. Go to https://whenisgoodclone.vercel.app
2. Open browser DevTools (F12) → Console tab
3. Enter your name in the "Your name" field
4. Select a few time slots on the calendar
5. Click **Submit Availability**

**If it works:**
- You'll see: "Availability submitted!"
- The page switches to "Group View" showing your response
- Console shows: `[responses.ts] Response created successfully: <uuid>`

**If it still fails:**
- Console will show detailed error messages
- Look for lines starting with `[Frontend] Server error:` or `[responses.ts] Error:`
- Common errors and fixes:

| Error Message | Fix |
|--------------|-----|
| `DATABASE_URL not configured` | Set the environment variable in Vercel and redeploy |
| `relation "practice_scheduler.events" does not exist` | Run the SQL migration in Supabase |
| `permission denied` or `new row violates row-level security` | RLS policies not created - re-run the migration |
| `invalid input syntax for type uuid` | Data validation error - check console logs for details |

## Monitoring Errors After Deployment

To see detailed server logs:

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments**
3. Click on the latest deployment
4. Click **Functions** tab
5. Click on any function (e.g., `api/events/[id]/responses`)
6. View real-time logs showing the `console.log()` output

## Quick Verification SQL Queries

Run these in Supabase SQL Editor to check data:

```sql
-- Check if any events exist
SELECT * FROM practice_scheduler.events LIMIT 5;

-- Check if any responses exist
SELECT * FROM practice_scheduler.responses LIMIT 5;

-- Count total responses
SELECT COUNT(*) FROM practice_scheduler.responses;

-- See which participants have submitted
SELECT DISTINCT participant_name
FROM practice_scheduler.responses;
```

## Rolling Back (If Needed)

If something goes wrong, you can clean up:

```sql
-- Delete all responses (keeps events)
DELETE FROM practice_scheduler.responses;

-- Delete all events and responses
DROP SCHEMA practice_scheduler CASCADE;

-- Then re-run the migration from step 1
```

## Success Criteria

✅ SQL migration runs without errors
✅ Tables exist in `practice_scheduler` schema
✅ RLS policies are active (4 total)
✅ `DATABASE_URL` is set in Vercel
✅ Code changes deployed to Vercel
✅ "Submit Availability" works without errors
✅ Responses appear in "Group View"
✅ Browser console shows success logs

## Need More Help?

If you're still having issues, check:
1. Vercel function logs (see "Monitoring Errors" section above)
2. Browser console for frontend errors
3. Supabase logs: Dashboard → Logs → Database

Copy any error messages and we can debug further.
