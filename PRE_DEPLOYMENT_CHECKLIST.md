# Pre-Deployment Checklist - Wallet-Email Linking Feature

## Database Setup
- [ ] Run `scripts/database-setup.sql` in Supabase SQL Editor
- [ ] Verify RLS policies on `users` table:
  ```sql
  -- Anonymous wallet signup
  CREATE POLICY "Allow anonymous wallet insert" ON public.users
    FOR INSERT
    WITH CHECK (wallet_address IS NOT NULL);
  
  -- User read/update own data
  CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT
    USING (auth.uid() IS NULL OR auth.uid() = id);
  ```
- [ ] Verify columns exist in `users` table:
  - `id` (uuid) - Primary key
  - `email` (text, nullable)
  - `wallet_address` (text, nullable)
  - `name` (text, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

## Code Quality
- [ ] All merge conflicts resolved
  - `src/utils/supabaseAuth.js` ✓
  - `src/pages/portfolio/portfolio.jsx` ✓
- [ ] No framer-motion leftover (motion.* tags removed)
- [ ] All imports updated (no dangling imports)
- [ ] Console logging uses `[v0]` prefix for debugging

## Feature Testing

### Email Authentication
- [ ] Email OTP login works
- [ ] User created in `public.users` table
- [ ] User can view portfolio page

### Wallet Authentication
- [ ] Wallet connect and sign works
- [ ] New wallet user sees onboarding modal:
  - [ ] Modal has transparent background (`bg-black/30 backdrop-blur-md`)
  - [ ] Modal shows name field (required)
  - [ ] No avatar URL field (removed)
  - [ ] Optional email field works
  - [ ] Email OTP verification triggers if email provided
  - [ ] Skip button works
- [ ] Existing wallet user bypasses onboarding
- [ ] User redirected to home after completion

### Account Settings (Portfolio Page)
- [ ] Settings button visible in nav
- [ ] Email users see "Bind Wallet" option
- [ ] Wallet users see "Add Email" option
- [ ] AccountSettings component renders correctly
- [ ] Binding operations complete without errors

### Navigation & Animations
- [ ] Login page has back button
- [ ] Header menu animates on open (slide-in 300ms)
- [ ] Header menu animates on close (slide-out 300ms)
- [ ] Nav smooth and responsive
- [ ] No layout shift during animations

### Error Handling
- [ ] RLS errors handled gracefully
- [ ] Network errors show user-friendly messages
- [ ] Invalid signatures show proper error
- [ ] Empty/invalid inputs validated client-side

## Environment Variables
- [ ] `VITE_SUPABASE_URL` set
- [ ] `VITE_SUPABASE_ANON_KEY` set
- [ ] No hardcoded credentials in code

## Performance
- [ ] No console errors on load
- [ ] Modal renders within 200ms
- [ ] Authentication completes within 3s
- [ ] No memory leaks (check DevTools)

## Mobile Responsiveness
- [ ] Login page responsive (back button visible)
- [ ] Onboarding modal responsive (<600px)
- [ ] Account settings modal works on mobile
- [ ] Nav menu animations smooth on mobile

## Documentation
- [ ] WALLET_EMAIL_LINKING.md updated
- [ ] MERGE_CONFLICT_RESOLUTION.md created
- [ ] SETUP_GUIDE.md reviewed
- [ ] README.md references new features

## Final Verification
- [ ] No 404 errors for components
- [ ] No missing dependencies
- [ ] Build succeeds without warnings
- [ ] All tests pass (if applicable)
- [ ] No security vulnerabilities
  - [ ] No exposed API keys
  - [ ] No SQL injection vulnerabilities
  - [ ] Proper RLS enforced
  - [ ] Wallet signatures required

## Deployment Steps
1. Commit all changes: `git add . && git commit -m "feat: wallet-email linking with onboarding"`
2. Create PR with this checklist items completed
3. Code review approval
4. Merge to main
5. Deploy to staging
6. Run smoke tests
7. Deploy to production
8. Monitor logs for errors

## Rollback Plan
If issues found:
1. Revert to previous commit: `git revert <commit-hash>`
2. Restore previous database state from backup
3. Clear browser localStorage for testing
4. Redeploy

---
**Checklist Date**: [Fill when starting deployment]
**Deployed By**: [Fill when deploying]
**Status**: [Mark as READY/IN PROGRESS/COMPLETED]
