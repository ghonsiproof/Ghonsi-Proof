# Wallet-Email Linking Integration Checklist

## Prerequisites
- [ ] Supabase project set up
- [ ] Environment variables configured (.env.local)
- [ ] Database migration script prepared

## Step 1: Database Setup (REQUIRED FIRST)
- [ ] Run `scripts/database-setup.sql` in Supabase SQL Editor
- [ ] Verify users table has all required columns
- [ ] Verify RLS policies are enabled
- [ ] Check indices are created

```sql
-- Verify setup with this query:
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';
```

## Step 2: New Components
- [ ] Copy `src/components/WalletOnboardingModal.jsx` 
- [ ] Copy `src/components/AccountSettings.jsx`
- [ ] Verify imports are correct

## Step 3: New Utilities
- [ ] Copy `src/utils/walletEmailLinking.js`
- [ ] Verify Supabase client import path is correct
- [ ] Test individual functions in browser console

## Step 4: Update Login Page
- [ ] Update `src/pages/login/login.jsx` with:
  - [ ] Add imports for new components and utilities
  - [ ] Add state for onboarding modal
  - [ ] Update `handleWalletAuth()` to check for existing users
  - [ ] Add back button with navigation
  - [ ] Integrate `WalletOnboardingModal` component
- [ ] Test wallet signup flow for new users
- [ ] Test wallet login for existing users

## Step 5: Update Header
- [ ] Update `src/components/header/header.css` with animation keyframes
- [ ] Add animation classes to menu in `src/components/header/header.jsx`
- [ ] Test menu slide-in/out animation
- [ ] Test dropdown animation on wallet menu

## Step 6: Update Portfolio Page (Optional but Recommended)
- [ ] Import `AccountSettings` component
- [ ] Add to portfolio page layout
- [ ] Add section for account management
- [ ] Style to match design system
- [ ] Test wallet binding flow
- [ ] Test email adding flow with OTP

## Step 7: Testing

### Wallet User Signup
- [ ] Go to `/login`
- [ ] Click "Wallet Connect"
- [ ] Connect a new wallet (never used before)
- [ ] Verify onboarding modal appears
- [ ] Enter name and optional avatar
- [ ] Optionally enter email and verify OTP
- [ ] Should redirect to home authenticated

### Email User Linking Wallet (if portfolio integrated)
- [ ] Create account with email
- [ ] Sign in with email
- [ ] Go to Portfolio → Account Settings
- [ ] Click "Bind Wallet"
- [ ] Enter wallet address
- [ ] Verify wallet is now linked

### Wallet User Adding Email (if portfolio integrated)
- [ ] Sign in with wallet
- [ ] Go to Portfolio → Account Settings
- [ ] Click "Add Email"
- [ ] Enter email and verify OTP
- [ ] Verify email is now linked

### Cross-Auth Testing
- [ ] Sign out
- [ ] Sign in with wallet (that has email linked)
- [ ] Verify profile shows both email and wallet
- [ ] Sign out, sign in with email
- [ ] Verify profile shows both email and wallet

## Step 8: Header Animations
- [ ] Open page in browser
- [ ] Click menu button
- [ ] Verify smooth slide-in animation
- [ ] Close menu
- [ ] Verify smooth slide-out animation
- [ ] Click wallet dropdown
- [ ] Verify smooth dropdown animation
- [ ] Close dropdown
- [ ] Verify smooth close animation

## Step 9: Error Handling
- [ ] Try invalid wallet address format
- [ ] Try email that's already in use
- [ ] Try invalid OTP
- [ ] Try OTP after expiry (10 min)
- [ ] Disconnect wallet mid-flow
- [ ] Close onboarding modal
- [ ] Verify error messages are clear

## Step 10: Browser Compatibility
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Mobile (iOS)
- [ ] Test on Mobile (Android)
- [ ] Verify animations work smoothly on all platforms

## Step 11: Console Logging
- [ ] Open browser DevTools Console
- [ ] Look for `[v0]` prefixed log messages
- [ ] Verify wallet auth flow logs
- [ ] Verify user linking logs
- [ ] Check for any error messages

## Step 12: Performance
- [ ] Check page load time (should be < 3s)
- [ ] Check animation frame rate (should be 60fps)
- [ ] Monitor network requests (should be minimal)
- [ ] Check memory usage (no leaks)

## Deployment Checklist

Before pushing to production:
- [ ] All tests passing
- [ ] No console errors
- [ ] Database backups created
- [ ] Environment variables set in deployment
- [ ] Database setup script run on production DB
- [ ] Account Settings component added to portfolio
- [ ] All links working correctly
- [ ] Animations performing smoothly
- [ ] Error messages user-friendly
- [ ] Security review completed

## Rollback Plan

If issues occur:
1. [ ] Disable wallet signup (set showOnboarding to false)
2. [ ] Revert login page changes
3. [ ] Restore from database backup
4. [ ] Keep AccountSettings disabled until fixed

## File Changes Summary

### New Files
```
src/components/WalletOnboardingModal.jsx       (273 lines)
src/components/AccountSettings.jsx              (303 lines)
src/utils/walletEmailLinking.js                 (147 lines)
scripts/database-setup.sql                      (87 lines)
WALLET_EMAIL_LINKING.md                        (264 lines)
SETUP_GUIDE.md                                 (194 lines)
INTEGRATION_CHECKLIST.md                       (this file)
```

### Modified Files
```
src/pages/login/login.jsx                       (import + onboarding)
src/components/header/header.jsx                (animation classes)
src/components/header/header.css                (animations + keyframes)
```

## Next Tasks

After integration:
- [ ] Add email recovery option
- [ ] Add social login (Twitter, Discord)
- [ ] Add account recovery with backup codes
- [ ] Add session management UI
- [ ] Add security audit trail
- [ ] Add two-factor authentication
- [ ] Add rate limiting on OTP

## Support Contacts

- Database issues: Check `scripts/database-setup.sql`
- Wallet issues: Check Solana Wallet Adapter docs
- Auth issues: Check Supabase docs
- Animation issues: Check `header.css` keyframes

## Sign-Off

- [ ] Developer verified all tests pass
- [ ] QA tested all user flows
- [ ] Security reviewed database policies
- [ ] Product approved UI/UX
- [ ] Ready for production deployment
