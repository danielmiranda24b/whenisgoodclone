# Practice Scheduler

A collaborative scheduling app that helps groups find the best meeting times. Users mark their availability on a time grid, and everyone can see aggregated responses in a group view.

## Features

- Create scheduling events with custom date ranges
- Click, drag, or shift+click to select available time slots
- See group availability with color-coded heat map
- Real-time response tracking from all participants

---

## Quick Deploy with Vercel + Supabase (FREE)

This guide will get your app running in about 10 minutes.

### Step 1: Create a Supabase Database (Free)

1. Go to [https://supabase.com](https://supabase.com) and sign up (free)

2. Click **New Project** and fill in:
   - Project name: `practice-scheduler`
   - Database password: (save this somewhere!)
   - Region: Choose closest to you

3. Wait for the project to finish setting up (~2 minutes)

4. Go to **Settings** → **Database** → scroll down to **Connection string**

5. Select **URI** and copy the connection string. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```

6. **Important:** Replace `[YOUR-PASSWORD]` with your actual database password

---

### Step 2: Push Code to GitHub

1. Download the `github-export` folder from Replit (right-click → Download as ZIP)

2. Go to [https://github.com](https://github.com) and create a **New Repository**
   - Name: `practice-scheduler`
   - Make it Public or Private (both work)

3. Upload all the files from the ZIP to your new repository
   - You can drag and drop files directly on the GitHub page
   - Or use git commands if you prefer

---

### Step 3: Deploy to Vercel (Free)

1. Go to [https://vercel.com](https://vercel.com) and sign up with GitHub

2. Click **Add New Project**

3. Import your `practice-scheduler` repository

4. Before deploying, add your **Environment Variable**:
   - Click **Environment Variables**
   - Add:
     - **Name:** `DATABASE_URL`
     - **Value:** Your Supabase connection string from Step 1

5. Click **Deploy**

6. Wait for the build to complete (~1-2 minutes)

---

### Step 4: Set Up the Database Tables

After Vercel deploys, you need to create the database tables:

1. Open a terminal on your computer

2. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/practice-scheduler.git
   cd practice-scheduler
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file with your database URL:
   ```bash
   echo "DATABASE_URL=your-supabase-connection-string" > .env
   ```

5. Push the database schema:
   ```bash
   npm run db:push
   ```

6. You should see: `Changes applied`

---

### Step 5: Test Your App!

1. Go to your Vercel dashboard and click on your deployed app

2. Your app is now live at something like: `https://practice-scheduler.vercel.app`

3. Try:
   - Enter your name
   - Click some time slots to mark availability
   - Click "Submit Availability"
   - Switch to "Group View" to see your response

---

## Project Structure

```
practice-scheduler/
├── frontend/           # Static HTML page
│   └── index.html      # The scheduler interface
├── api/                # Vercel serverless functions
│   ├── events.ts       # POST /api/events
│   ├── events/
│   │   ├── [id].ts     # GET /api/events/:id
│   │   └── [id]/
│   │       ├── group.ts      # GET /api/events/:id/group
│   │       └── responses.ts  # POST /api/events/:id/responses
│   └── lib/            # Shared code
│       ├── db.ts       # Database connection
│       ├── schema.ts   # Database schema
│       └── storage.ts  # Database operations
├── package.json        # Dependencies
├── vercel.json         # Vercel configuration
└── drizzle.config.ts   # Database migration config
```

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/yourusername/practice-scheduler.git
cd practice-scheduler

# Install dependencies
npm install

# Create .env file with your database URL
cp .env.example .env
# Edit .env and add your DATABASE_URL

# Push database schema (first time only)
npm run db:push

# Install Vercel CLI for local development
npm i -g vercel

# Run locally
vercel dev
```

Your app will be available at `http://localhost:3000`

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | Yes |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api` | Health check |
| `POST` | `/api/events` | Create a new event |
| `GET` | `/api/events/:id` | Get event details |
| `GET` | `/api/events/:id/group` | Get event with all responses |
| `POST` | `/api/events/:id/responses` | Submit availability response |

---

## Troubleshooting

### "Database connection error"
- Check that your `DATABASE_URL` is correct in Vercel environment variables
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Try redeploying after fixing the environment variable

### "Event not found" when submitting
- Make sure you ran `npm run db:push` to create the database tables
- Check Supabase dashboard to verify tables exist

### Changes not showing
- Vercel caches pages - try adding `?v=2` to the URL
- Or go to Vercel dashboard and click "Redeploy"

### CORS errors
- The API routes already include CORS headers
- If still having issues, check browser console for the specific error

---

## Costs

**This setup is 100% free:**
- **Supabase Free Tier:** 500MB database, unlimited API requests
- **Vercel Free Tier:** 100GB bandwidth, unlimited serverless function invocations

You'll only need to pay if you exceed these generous limits (unlikely for personal use).

---

## License

MIT
