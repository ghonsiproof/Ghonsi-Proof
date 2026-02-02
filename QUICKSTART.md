# Quick Start Guide

Get Ghonsi Proof running locally in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- Supabase account (free)
- Git

## Step 1: Clone Repository

```bash
git clone https://github.com/ghonsiproof/Ghonsi-Proof.git
cd Ghonsi-Proof
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Supabase

### Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in details and create project
4. Wait 2-3 minutes for setup

### Get API Credentials

1. Go to Settings → API
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (long JWT string)

### Run Database Schema

1. Open SQL Editor in Supabase
2. Open `SUPABASE_SCHEMA.md` in this repo
3. Copy and run each SQL section (1-8) one by one
4. Verify all tables created in Table Editor

## Step 4: Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Start Development Server

```bash
npm start
```

App opens at `http://localhost:3000` 🎉

## Quick Test

1. Go to `/login`
2. Enter email address
3. Click "Sign In" (check Supabase Auth logs for magic link)
4. Try creating a profile at `/createProfile`
5. Upload a proof at `/upload`

## Verify Setup

### Check Database

1. Supabase → Table Editor
2. Should see tables: users, profiles, proofs, files, verification_requests

### Check Storage

1. Supabase → Storage
2. Should see bucket: `proof-files`

### Check Authentication

1. Try logging in with email
2. Check Supabase → Authentication → Users

## Troubleshooting

### "Failed to fetch"
- Check environment variables in `.env`
- Verify Supabase credentials are correct
- Restart dev server: `npm start`

### "403 Forbidden"
- Check RLS policies in Supabase
- Verify you're logged in
- Check browser console for auth errors

### "Bucket not found"
- Verify `proof-files` bucket exists in Supabase Storage
- Check bucket is public
- Run storage SQL from schema (Section 7)

## Next Steps

- Read [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment
- Read [SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md) for database structure
- Read [README.md](./README.md) for API documentation

## Support

- Email: support@ghonsiproof.com
- Twitter: [@Ghonsiproof](https://x.com/Ghonsiproof)
- GitHub Issues: [Report a bug](https://github.com/ghonsiproof/Ghonsi-Proof/issues)

---

**Happy coding! 🚀**
