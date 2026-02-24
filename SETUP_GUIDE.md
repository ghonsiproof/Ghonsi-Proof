# Ghonsi Proof - Complete Setup & Deployment Guide

## Project Overview

**Ghonsi Proof** is a decentralized proof verification system built on Solana. Users can upload and verify professional proofs (certificates, work history, skills, etc.), store them on IPFS via Pinata, and have them approved by admins on-chain.

## Tech Stack

- **Frontend**: Create React App (NOT Next.js) 
- **Backend**: Render.com or custom Node.js server
- **Database**: Supabase (PostgreSQL with RLS)
- **Blockchain**: Solana Devnet (+ Mainnet ready)
- **Storage**: IPFS via Pinata
- **Wallet**: Solana Wallet Adapter
- **Authentication**: Supabase Auth (Email OTP + Wallet Connect)

## Prerequisites

- Node.js 18+ and npm/pnpm
- Solana CLI (for testing)
- Supabase account
- Pinata account (provided)
- Git

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/ghonsiproof/Ghonsi-Proof.git
cd Ghonsi-Proof
pnpm install  # or npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase - Get from https://supabase.com dashboard
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key

# Backend API
REACT_APP_API_URL=http://localhost:3001  # Or your Render.com backend

# Solana Configuration
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com

# Pinata IPFS (provided)
REACT_APP_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMmUwYjdlMC04ZTJmLTQxZmUtYjlhOC1jOWJmN2RiM2Y4OGYiLCJlbWFpbCI6Imdob25zaXByb29mQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJjOGZkNTAyYzkyMDBhYzYzZGI3NCIsInNjb3BlZEtleVNlY3JldCI6IjYwYmEyNjdjODk1OGIxMDlhMDYxMjVmZDUyY2YzNjI4Mzc2ODQxODQ2YzZkODk2Y2Y0OTExZWIzNTVjOTBmZjIiLCJleHAiOjE4MDM0MjcxNTJ9.5Rnxed15oESVxnNf1blElnthD7tLeVgJGN24T7sBJpc

# Pinata API Keys (for backend operations)
REACT_APP_PINATA_API_KEY=c8fd502c9200ac63db74
REACT_APP_PINATA_API_SECRET=60ba267c8958b109a06125fd52cf3628376841846c6d896cf4911eb355c90ff2

# Treasury Wallet (devnet - can be any address)
REACT_APP_TREASURY_WALLET=EKGNwqNBUBtH5Fnmcjjoj4Tci6dCXdcCrxcjTaWm5bLf
```

### 3. Database Setup

Run the migration script in Supabase SQL editor:

```bash
# Option 1: Copy-paste from scripts/001_add_ipfs_admin_approval_system.sql
# into Supabase SQL editor

# Option 2: Via CLI (if using supabase CLI)
supabase db push
```

This creates:
- IPFS/transaction columns in `proofs` table
- `admin_approvals` table for tracking admin reviews
- `admin_settings` table for role management
- `proof_history` table for audit trail
- RLS policies for security

### 4. Run Development Server

```bash
# Start React app on port 3000
pnpm start  # or npm start

# The app will open at http://localhost:3000
```

### 5. Test the App

1. **Signup/Login**:
   - Email: Enter any email, receive OTP
   - Wallet: Connect any Solana wallet

2. **Create Profile**:
   - Upload avatar (or wallet-only users skip this)
   - Fill in professional info
   - Save

3. **Upload Proof**:
   - Go to Upload page
   - Select proof type, name, summary
   - Upload reference document
   - Submit (will trigger transaction signer)
   - Sign 0.01 SOL devnet transaction
   - Wait for IPFS upload confirmation

4. **View Portfolio**:
   - See all your proofs
   - Auto-extracted skills
   - Share public link
   - Manage wallets/emails (coming soon)

## Deployment

### Deploy to Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel: https://vercel.com/new
# 3. Select GitHub repo
# 4. Add environment variables (same as .env.local)
# 5. Deploy!
```

### Deploy Smart Contract

```bash
# 1. Initialize Anchor project
anchor init ghonsi-proof
cd programs/ghonsi-proof

# 2. Copy template from ghonsi_proof/idl/ghonsi_proof.json

# 3. Implement all instructions (see SMART_CONTRACT_GUIDE.md)

# 4. Build & deploy
anchor build
anchor deploy --provider.cluster devnet

# 5. Copy Program ID and add to frontend
export REACT_APP_PROGRAM_ID=<your_program_id>
```

### Deploy Backend (Optional)

If you need a backend for additional processing:

```bash
# Use Render.com, Railway, or Vercel Functions
# Backend should handle:
# - Email verification
# - File validation
# - Pinata uploads (server-side)
# - Admin approval webhooks
```

## Troubleshooting

### Build Error: "falls outside of src/ directory"

This is a Create React App limitation. All imports must be within `src/`. 

**Check**:
- All util files are in `src/utils/`
- All component files are in `src/components/` or `src/pages/`
- No `../` imports that escape src/

```bash
# Find problematic imports
grep -r "import.*\.\.\/" src/pages/upload/
```

### Pinata Upload Fails

**Error**: "REACT_APP_PINATA_JWT not configured"

**Fix**:
1. Check `.env.local` has the JWT
2. Restart dev server: `pnpm start`
3. Check browser console for error

**If stuck**: Use hardcoded JWT temporarily for testing (not for production):
```javascript
// In pinataUpload.js
const jwt = process.env.REACT_APP_PINATA_JWT || 'eyJhbGciOiJIUzI1NiIs...'; // Temporary
```

### Wallet Connection Issues

**If wallet doesn't connect**:
1. Check you're on devnet: `REACT_APP_SOLANA_NETWORK=devnet`
2. Use browser Phantom wallet or Solflare
3. Make sure wallet has devnet SOL (get from faucet)

### Database RLS Errors

**If getting "new row violates row-level security policy"**:

This means RLS is blocking the insert. Check:
1. User is authenticated (`auth.uid()` is set)
2. User ID matches the `user_id` being inserted
3. RLS policy allows the operation

See: `scripts/001_add_ipfs_admin_approval_system.sql` for RLS policies

## Features Checklist

### Phase 1: Core Features (✅ DONE)
- [x] User authentication (Email + Wallet)
- [x] Profile creation
- [x] Document upload
- [x] Proof storage with IPFS hashing
- [x] Portfolio display
- [x] Proof statistics
- [x] Public portfolio sharing

### Phase 2: Transaction & Verification (🔄 IN PROGRESS)
- [x] Transaction signer modal
- [x] 0.01 SOL payment collection
- [x] Pinata IPFS storage
- [x] Transaction hash tracking
- [ ] Smart contract deployment
- [ ] Admin approval system
- [ ] On-chain verification

### Phase 3: Advanced Features (❌ TODO)
- [ ] Wallet/email binding management
- [ ] Bulk proof uploads
- [ ] Proof categories
- [ ] Proof revisions/versioning
- [ ] Admin dashboard
- [ ] Analytics & reporting
- [ ] Email notifications
- [ ] Proof expiration workflow

## Important Notes

### ⚠️ CRITICAL ISSUES

1. **Database Migrations**:
   - Must run SQL script BEFORE uploading proofs
   - Or IPFS hash won't be stored!

2. **Pinata Keys**:
   - Keep JWT secret (backend only in production)
   - API keys provided are for YOUR account only
   - Rotate keys if accidentally exposed

3. **Smart Contract** (NOT YET DEPLOYED):
   - IDL template provided at `ghonsi_proof/idl/ghonsi_proof.json`
   - Need to implement Anchor program in `/programs/ghonsi-proof/`
   - See `SMART_CONTRACT_GUIDE.md` for full instructions

### 🔒 Security Best Practices

1. **Never commit** `.env.local` to git
2. **Always use** environment variables for secrets
3. **Enable RLS** on all database tables
4. **Validate** all user inputs on backend
5. **Use HTTPS** for all production deployments
6. **Rotate** Pinata keys periodically

### 📊 Monitoring

**Check these regularly**:
- Supabase dashboard for data integrity
- Vercel deployment logs for errors
- Pinata gateway status for IPFS connectivity
- Wallet transaction history for payments

## Support & Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Solana Docs](https://docs.solana.com)
- [Pinata Docs](https://docs.pinata.cloud)
- [Anchor Book](https://book.anchor-lang.com)
- [Create React App](https://create-react-app.dev)

### Community
- Solana Discord: discord.gg/solana
- Anchor GitHub Issues: github.com/coral-xyz/anchor/issues

## Next Steps

1. ✅ Complete current setup
2. ⚠️ Run database migrations
3. 🧪 Test end-to-end flow
4. 📝 Implement wallet/email binding UI
5. 🔗 Develop smart contract
6. 🚀 Deploy to production

---

**Last Updated**: February 2026
**Status**: 70% Complete (Core features done, Smart contract TODO)

