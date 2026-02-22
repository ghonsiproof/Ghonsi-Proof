# Quick Reference - Wallet-Email Linking Feature

## Feature Overview
Bidirectional wallet-email account linking with transparent onboarding modal and smooth animations.

## Key Files

| File | Purpose | Changes |
|------|---------|---------|
| `src/pages/login/login.jsx` | Login page with back button | Auth flow + onboarding integration |
| `src/components/WalletOnboardingModal.jsx` | New user onboarding | Transparent styling, no avatar field |
| `src/utils/walletEmailLinking.js` | Account linking functions | Core wallet-email operations |
| `src/utils/supabaseAuth.js` | Auth utilities | Consolidated wallet logic (v5) |
| `src/components/header/header.jsx` | Header navigation | Animation classes added |
| `src/components/header/header.css` | Header styling | @keyframes for menu animations |
| `scripts/database-setup.sql` | Database migration | RLS policies and schema |

## User Flows

### 1. New Wallet User
```
Connect Wallet → Sign Message → Check if Exists → No → Show Onboarding Modal
→ Enter Name → (Optional) Add Email + OTP → Create User → Redirect Home
```

### 2. Existing Wallet User
```
Connect Wallet → Sign Message → Check if Exists → Yes → Verify Auth → Redirect Home
```

### 3. Email + Bind Wallet
```
Email Login → Verify OTP → Portfolio → Settings → Bind Wallet → Sign Message → Link Complete
```

### 4. Wallet + Add Email
```
Wallet Login → Portfolio → Settings → Add Email → Enter Email → Verify OTP → Link Complete
```

## Modal Features
- **Transparent Background**: `bg-black/30 backdrop-blur-md`
- **Glass Effect**: `backdrop-blur-lg` on modal container
- **Fields**: Name (required), Email (optional)
- **Skip Option**: Proceed without email
- **Auto-OTP**: If email provided, triggers verification

## Animation Timings
- **Menu Slide-In**: 300ms ease-out
- **Menu Slide-Out**: 300ms ease-in
- **Dropdown**: 250ms ease-out
- **Apply Classes**: `.menu-enter`, `.dropdown-enter`

## Debug Logging
All debug logs use `[v0]` prefix:
```javascript
console.log('[v0] New wallet user, showing onboarding');
console.error('[v0] RLS error, details:', error);
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "avatar column not found" | Using avatar field | Removed - use avatar_url from profile page |
| Dark modal background | Old styling | Updated to transparent with blur |
| Signature screen before onboarding | Wrong flow order | Auth completes first now |
| Missing back button | Not added to login page | Added with ArrowLeft icon |
| Stiff animations | No ease functions | Added ease-out/ease-in transitions |

## Testing Quick Commands

```bash
# Check for merge conflicts
grep -r "<<<<<<< HEAD" src/ 2>/dev/null || echo "✓ No conflicts"

# Verify no motion components left
grep -r "motion\." src/ | grep -v "node_modules" | wc -l

# Run auth tests (example)
npm test -- supabaseAuth

# Build check
npm run build
```

## Environment Setup

1. **Database**:
   ```sql
   -- Run in Supabase SQL Editor
   -- Copy content from scripts/database-setup.sql
   ```

2. **Environment Variables**:
   ```
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```

3. **Dependencies**:
   ```bash
   npm install  # framer-motion already in package.json
   ```

## Deployment Checklist (Quick)
- [ ] DB migration run
- [ ] No console errors
- [ ] Wallet signup works
- [ ] Modal renders correctly
- [ ] Animations smooth
- [ ] No RLS errors
- [ ] Email binding works

## Files to Ignore in Commits
- `node_modules/`
- `.env.local`
- `dist/`
- `.DS_Store`

## Important Notes
1. **Avatar**: Not stored in `users` table, use `avatar_url` from profile page
2. **RLS**: Must allow anonymous wallet inserts with `wallet_address IS NOT NULL`
3. **Wallet Type**: Defaults to 'solana', but supports other chains
4. **Session Management**: Uses localStorage for wallet-only auth fallback

## Support Files
- `MERGE_CONFLICT_RESOLUTION.md` - Conflict details
- `PRE_DEPLOYMENT_CHECKLIST.md` - Full deployment guide
- `CONTINUATION_SUMMARY.md` - What was fixed
- `WALLET_EMAIL_LINKING.md` - Feature documentation

---

**TL;DR**: Feature complete, merge conflicts resolved, ready to test and deploy. See PRE_DEPLOYMENT_CHECKLIST.md for full guide.
