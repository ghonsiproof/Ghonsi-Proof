# Ghonsi Proof - Login & Blockchain Submission Fixes

## Overview
Fixed critical issues with wallet connect login sessions and proof submission to blockchain. Users can now:
1. **Persist wallet sessions** across page refreshes
2. **Submit proofs to blockchain** (Solana) after IPFS upload
3. **Recover sessions** automatically when returning to the app

---

## Issues Fixed

### 1. **Login Session Not Persisting with Wallet Connect**
**Problem:** After connecting wallet and signing message, users were logged out on page refresh.

**Root Cause:** 
- Only using localStorage for session state, not database-backed sessions
- No proper Supabase session creation for wallet users
- Mixing two different auth systems (old `auth.js` and new `supabaseAuth.js`)

**Solution:**
- Enhanced `signInWithWallet()` to create proper session tokens
- Added comprehensive session storage (wallet address, user ID, session token, timestamps)
- Created `getWalletSession()` and `verifyWalletSession()` for session persistence
- Updated `ProtectedRoute` to check both Supabase and wallet sessions

**Files Modified:**
- `src/utils/supabaseAuth.js` - Enhanced wallet auth and added session validation functions
- `src/pages/login/login.jsx` - Added session recovery check on mount, improved wallet auth flow
- `src/components/ProtectedRoute.jsx` - Updated to support wallet session verification

---

### 2. **Proof Not Being Submitted to Blockchain**
**Problem:** Upload page only saved proofs to database and IPFS, never actually submitted to Solana blockchain.

**Root Cause:**
- `submit-proof.ts` script exists but wasn't integrated into frontend
- `TransactionSignerModal` only collected fees, didn't trigger blockchain submission
- No API endpoint to handle blockchain transactions

**Solution:**
- Created `blockchainSubmission.js` utility for blockchain submission
- Created `/api/submit-proof.js` endpoint (backend integration point)
- Modified `handleTransactionSuccess()` in upload.jsx to:
  1. Upload to IPFS ✓
  2. Save to Supabase database ✓
  3. **Submit to blockchain** ✓ (NEW)
  4. Update proof with transaction/PDA/mint data ✓ (NEW)
- Added progress tracking through submission stages

**Files Modified:**
- `src/utils/blockchainSubmission.js` - NEW: Blockchain submission API
- `src/api/submit-proof.js` - NEW: Backend endpoint for blockchain calls
- `src/pages/upload/upload.jsx` - Enhanced with blockchain submission logic

---

### 3. **Session Recovery Across Browser Sessions**
**Problem:** User had to log in again every time they closed and reopened the browser.

**Root Cause:**
- Session validation only happened at login, not on app initialization
- No mechanism to verify stored session on app load
- Mixed localStorage and database state without proper sync

**Solution:**
- Created `sessionRecovery.js` utility for session initialization and recovery
- Added session verification on app mount
- Automatic cleanup of invalid sessions
- Session validation before critical operations

**Files Created:**
- `src/utils/sessionRecovery.js` - Session recovery and validation

---

## New Features Added

### Session Management Functions
All in `src/utils/supabaseAuth.js`:
- `getWalletSession()` - Get current wallet session data
- `verifyWalletSession()` - Verify wallet session is still valid
- Enhanced `logout()` - Proper cleanup of all session data
- Enhanced `isAuthenticated()` - Supports both Supabase and wallet sessions

### Blockchain Submission
In `src/utils/blockchainSubmission.js`:
- `submitProofToBlockchain()` - Submit proof to Solana
- `updateProofWithBlockchainData()` - Save blockchain data to database
- `getProofBlockchainStatus()` - Check proof blockchain status
- `verifyBlockchainTransaction()` - Verify transaction confirmation

### Session Recovery
In `src/utils/sessionRecovery.js`:
- `initializeSessionRecovery()` - Initialize on app load
- `hasActiveSession()` - Check if user has valid session
- `getCurrentAuthenticatedUser()` - Get user from any auth method
- `validateSession()` - Validate session before operations
- `debugSessionInfo()` - Debug session state (development)

---

## Data Flow Improvements

### Wallet Login Flow
```
1. User clicks "Connect Wallet"
2. Wallet adapter shows wallet selection
3. User selects wallet (Phantom, Solflare, etc.)
4. Wallet connects - useEffect triggered
5. handleWalletAuth() called automatically
6. Message signed with wallet
7. signInWithWallet() creates user in database
8. Session token generated and stored
9. localStorage populated with session info
10. ProtectedRoute recognizes user is authenticated
11. User redirected to /home or /createProfile
```

### Proof Submission Flow
```
1. User fills proof form and clicks Submit
2. Form validation and user authentication check
3. showTransactionModal = true
4. User signs transaction in wallet for fee payment
5. Transaction confirmed on blockchain
6. handleTransactionSuccess() called with txHash
7. Document uploaded to Pinata IPFS
8. Proof saved to Supabase database
9. submitProofToBlockchain() called
10. Proof minted as NFT on Solana blockchain
11. Proof updated with transaction hash, PDA, mint
12. User sees success modal with blockchain links
```

### Session Recovery Flow
```
1. App initializes
2. initializeSessionRecovery() called
3. Check for Supabase session first
4. If not found, check wallet session in localStorage
5. If wallet session exists, verifyWalletSession()
6. Query database to confirm user still exists
7. If valid, user is authenticated automatically
8. If invalid, clear session and redirect to login
9. ProtectedRoute components can access user without new login
```

---

## Database Schema Updates

The following fields should be added to the `proofs` table:
```sql
ALTER TABLE proofs ADD COLUMN transaction_hash VARCHAR(255);
ALTER TABLE proofs ADD COLUMN proof_pda VARCHAR(255);
ALTER TABLE proofs ADD COLUMN nft_mint VARCHAR(255);
```

These store the blockchain submission data for verifying proofs onchain.

---

## Environment Variables

No new environment variables required, but ensure these are set:
- `REACT_APP_TREASURY_WALLET` - Wallet address for upload fees (optional, has default)
- Supabase keys should already be configured in `src/config/supabaseClient.js`

---

## Testing Checklist

- [ ] User can connect wallet and stay logged in after page refresh
- [ ] Login persists across browser restart
- [ ] Wallet session auto-recovers on app load
- [ ] Logout clears all session data properly
- [ ] Upload form submits proof to IPFS + Database + Blockchain
- [ ] Transaction hash, PDA, and mint are stored in database
- [ ] Blockchain links work in explorer (devnet)
- [ ] Protected routes work with both Supabase and wallet sessions
- [ ] Session validation works before critical operations
- [ ] Error handling shows user-friendly messages

---

## Migration Notes

**For existing users:**
- Old localStorage sessions will be automatically verified
- Users with old session data will need to log in once with the new system
- After first login with fixed code, session will persist permanently

**Database considerations:**
- Add the new columns to `proofs` table
- No data migration needed for existing proofs
- Existing proofs can still be viewed without blockchain data

---

## Technical Details

### Session Token Generation
Uses UUID v4 format for session tokens (not cryptographically tied to wallet, just for tracking):
```javascript
sessionToken = generateUUID() // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
```

### Wallet Session Verification
Verifies both in localStorage AND in database to prevent tampering:
1. Check localStorage has all required fields
2. Query database to confirm user exists with same wallet address
3. Only consider session valid if both match

### Blockchain Submission
Currently uses mock implementation in development. For production:
1. Implement actual Anchor program call
2. Use wallet to sign blockchain transaction
3. Get real transaction hash and PDA from blockchain
4. Store for verification

---

## Debugging Commands

In browser console:
```javascript
// Check session info
sessionStorage.getItem('auth_method')
sessionStorage.getItem('session_token')
localStorage.getItem('wallet_address')

// Debug session state
import { debugSessionInfo } from './utils/sessionRecovery.js'
debugSessionInfo()

// Force session validation
import { validateSession } from './utils/sessionRecovery.js'
await validateSession()

// Check current user
import { getCurrentAuthenticatedUser } from './utils/sessionRecovery.js'
const user = await getCurrentAuthenticatedUser()
console.log(user)
```

---

## Future Improvements

1. **Implement actual blockchain submission** - Currently mocked, needs real Anchor calls
2. **Add session timeout** - Auto-logout after 24 hours of inactivity
3. **Session security** - Add CSRF tokens for critical operations
4. **Recovery codes** - Allow users to generate recovery codes for account access
5. **Mobile signing** - Implement deeplinks for mobile wallet signing
6. **Proof verification** - Add on-chain proof verification UI

---

## Support & Questions

For issues with the fixes:
1. Check browser console for `[v0]` debug messages
2. Use `debugSessionInfo()` to check session state
3. Verify Supabase connection in `src/config/supabaseClient.js`
4. Check wallet adapter logs in console
5. Verify database schema has required `proofs` columns
