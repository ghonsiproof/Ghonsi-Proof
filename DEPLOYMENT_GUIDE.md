# Supabase + Vercel Deployment Guide

Complete step-by-step guide to deploy Ghonsi Proof with Supabase backend and Vercel hosting.

## Prerequisites

- [Supabase Account](https://supabase.com) (free tier available)
- [Vercel Account](https://vercel.com) (free tier available)
- GitHub repository connected to Vercel
- Node.js 16+ installed locally

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: ghonsi-proof
   - **Database Password**: (generate a strong password - save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### Step 2: Get API Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

### Step 3: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Open the file `SUPABASE_SCHEMA.md` in this repository
3. Copy and execute each SQL section one by one:
   - Section 1: Enable UUID Extension
   - Section 2: Users Table
   - Section 3: Profiles Table
   - Section 4: Proofs Table
   - Section 5: Files Table
   - Section 6: Verification Requests Table
   - Section 7: Storage Bucket
   - Section 8: Functions and Triggers

4. After each section, click **"Run"** and verify "Success" message

### Step 4: Configure Storage

1. Go to **Storage** in Supabase dashboard
2. Verify `proof-files` bucket was created
3. If not, create it manually:
   - Click **"New bucket"**
   - Name: `proof-files`
   - **Public bucket**: ✅ (checked)
   - Click **"Create bucket"**

4. Configure bucket settings:
   - Click on `proof-files` bucket
   - Go to **Policies** tab
   - Verify policies are set (should be auto-created from SQL)

### Step 5: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider:
   - Toggle **"Enable Email provider"** ON
   - **Enable Email Confirmations**: OFF (for development)
   - **Secure Email Change**: ON
3. Configure **Email Templates** (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and magic link emails

### Step 6: Set Up Row Level Security (RLS)

All RLS policies should be created from the SQL schema. To verify:

1. Go to **Authentication** → **Policies**
2. You should see policies for:
   - `users` table
   - `profiles` table
   - `proofs` table
   - `files` table
   - `verification_requests` table

---

## Part 2: Vercel Setup

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `ghonsiproof/Ghonsi-Proof`
4. Configure build settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 2: Add Environment Variables

**IMPORTANT**: Before deploying, add these environment variables in Vercel:

1. In Vercel project settings, go to **Settings** → **Environment Variables**
2. Add the following variables:

```env
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from Supabase (Step 1.2)

3. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. Click **"Save"**

### Step 3: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-3 minutes)
3. Your site will be live at: `https://ghonsi-proof.vercel.app`

### Step 4: Configure Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add custom domain if you have one
3. Follow DNS configuration instructions

---

## Part 3: Supabase + Vercel Integration

### Option A: Use Vercel Integration (Recommended)

1. Go to your Vercel project
2. Click **Integrations** tab
3. Search for **"Supabase"**
4. Click **"Add Integration"**
5. Follow prompts to connect your Supabase project
6. This will automatically add environment variables to Vercel

### Option B: Manual Setup (Already Done Above)

If you added environment variables manually in Part 2, Step 2, you're all set!

---

## Part 4: Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/ghonsiproof/Ghonsi-Proof.git
cd Ghonsi-Proof
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Local Environment File

```bash
cp .env.example .env
```

### Step 4: Add Your Supabase Credentials

Edit `.env` file and add:

```env
REACT_APP_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Start Development Server

```bash
npm start
```

App should open at `http://localhost:3000`

---

## Part 5: Testing the Integration

### Test Authentication

1. Go to `/login` page
2. Try **Email Login**:
   - Enter email address
   - Check if magic link is sent (check Supabase Auth logs)
3. Try **Wallet Connect** (currently simulated)

### Test Database Connection

1. Open browser console (F12)
2. Check for any Supabase errors
3. Try creating a profile at `/createProfile`
4. Verify data in Supabase:
   - Go to **Table Editor**
   - Check `profiles` table

### Test File Upload

1. Go to `/upload` page
2. Try uploading a proof with files
3. Verify in Supabase:
   - **Table Editor** → `proofs` table
   - **Storage** → `proof-files` bucket

---

## Part 6: CI/CD Workflow

Your deployment is now automated! 🎉

### Automatic Deployment Flow

```
1. Make code changes locally
2. Commit to git: git commit -m "your changes"
3. Push to GitHub: git push origin main
4. Vercel automatically detects push
5. Vercel builds and deploys
6. Live at https://ghonsi-proof.vercel.app
```

### Branch Previews

- **Main branch** → Production deployment
- **Other branches** → Preview deployments with unique URLs
- Perfect for testing before merging to main

---

## Part 7: Monitoring and Logs

### Vercel Logs

1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click on any deployment to see build logs
4. Check **Functions** tab for runtime logs

### Supabase Logs

1. Go to Supabase Dashboard → Your Project
2. Click **Logs** section
3. View:
   - **API Logs**: All API requests
   - **Database Logs**: SQL queries
   - **Auth Logs**: Authentication events
   - **Storage Logs**: File operations

---

## Part 8: Security Best Practices

### ✅ Things You Should Do

1. **Enable Email Confirmation** (Production):
   - Supabase → Authentication → Settings
   - Enable "Enable Email Confirmations"

2. **Set Up Rate Limiting**:
   - Supabase has built-in rate limiting
   - Configure in Authentication settings

3. **Review RLS Policies**:
   - Ensure users can't access others' data
   - Test with multiple accounts

4. **Use Environment Variables**:
   - Never commit `.env` file
   - Already in `.gitignore`

5. **Enable HTTPS Only** (Vercel does this automatically)

### ❌ Common Mistakes to Avoid

- Don't commit API keys to GitHub
- Don't disable RLS in production
- Don't make storage buckets public unless needed
- Don't skip input validation on frontend

---

## Part 9: Troubleshooting

### "Failed to fetch" Errors

**Cause**: Environment variables not set correctly

**Fix**:
1. Check Vercel environment variables
2. Rebuild and redeploy
3. Verify `.env` file locally

### "403 Forbidden" on API Calls

**Cause**: Row Level Security blocking access

**Fix**:
1. Check RLS policies in Supabase
2. Verify user is authenticated
3. Check browser console for auth errors

### "Storage bucket not found"

**Cause**: Bucket not created or wrong name

**Fix**:
1. Go to Supabase → Storage
2. Verify `proof-files` bucket exists
3. Check `PROOF_FILES_BUCKET` constant in code

### Files Not Uploading

**Cause**: Storage policies not configured

**Fix**:
1. Check storage policies in Supabase
2. Verify file size < 50MB (Supabase free tier limit)
3. Check CORS settings

---

## Part 10: Database Backup

### Automated Backups (Supabase)

Supabase automatically backs up your database:
- **Free tier**: Daily backups, 7-day retention
- **Pro tier**: Point-in-time recovery

### Manual Backup

```bash
# Export from Supabase dashboard
# Go to Settings → Database → Download backup
```

---

## Part 11: Scaling Considerations

### When You Outgrow Free Tier

**Supabase Free Tier Limits:**
- 500MB database space
- 1GB file storage
- 2GB bandwidth/month
- 50,000 monthly active users

**Upgrade Path:**
1. Supabase Pro: $25/month
2. Vercel Pro: $20/month (optional)

### Performance Optimization

1. **Add Database Indexes** (already in schema)
2. **Enable Caching** on Vercel
3. **Optimize Images** before upload
4. **Use CDN** for static assets (Vercel does this)

---

## Quick Reference

### Supabase Dashboard URLs

- **Project Dashboard**: `https://supabase.com/dashboard/project/[project-id]`
- **Table Editor**: `https://supabase.com/dashboard/project/[project-id]/editor`
- **SQL Editor**: `https://supabase.com/dashboard/project/[project-id]/sql`
- **Storage**: `https://supabase.com/dashboard/project/[project-id]/storage/buckets`

### Vercel Dashboard URLs

- **Project Dashboard**: `https://vercel.com/ghonsi-proofs-projects/ghonsi-proof`
- **Deployments**: `https://vercel.com/ghonsi-proofs-projects/ghonsi-proof/deployments`
- **Settings**: `https://vercel.com/ghonsi-proofs-projects/ghonsi-proof/settings`

### Important Files

- `src/config/supabaseClient.js` - Supabase configuration
- `src/utils/supabaseAuth.js` - Authentication functions
- `src/utils/proofsApi.js` - Proof management API
- `src/utils/profileApi.js` - Profile management API
- `SUPABASE_SCHEMA.md` - Database schema

---

## Support

If you encounter issues:

1. Check [Supabase Documentation](https://supabase.com/docs)
2. Check [Vercel Documentation](https://vercel.com/docs)
3. Review error logs in both platforms
4. Contact: ghonsiproof@gmail.com

---

**🎉 Congratulations! Your app is now live with a production-ready backend!**
