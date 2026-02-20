# Solana Wallet Adapter Setup Guide

## Overview

This document explains how the Solana Wallet Adapter is integrated into Ghonsi Proof for seamless wallet authentication on desktop and mobile.

## What Was Changed

### Removed (Old Broken Code)
- ❌ `src/utils/walletAdapter.js` - Incomplete wallet utilities
- ❌ `src/hooks/useWalletAuth.js` - Broken authentication hook
- ❌ `src/context/WalletContext.jsx` - Non-standard wallet context

### Added (Working Implementation)
- ✅ `src/context/WalletProvider.jsx` - Proper Solana Wallet Adapter setup
- ✅ `src/hooks/useWallet.js` - Clean custom hook for wallet operations
- ✅ `src/App.css` - Gold-themed styling for wallet UI components
- ✅ Updated `signInWithWallet()` in `supabaseAuth.js` - Database session storage
- ✅ Fixed `getCurrentUser()` - Fetches full user profile from database
- ✅ Updated `ProtectedRoute.jsx` - Checks both email and wallet authentication

## How Wallet Authentication Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ WalletProvider (src/context/WalletProvider.jsx)             │
│ ├─ ConnectionProvider → Solana devnet RPC                  │
│ ├─ SolanaWalletProvider → Manages wallet adapters          │
│ └─ WalletModalProvider → UI for wallet selector            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ useWallet Hook (src/hooks/useWallet.js)                    │
│ ├─ connected: boolean                                       │
│ ├─ sign(): Promise<{signature, publicKey}>                 │
│ ├─ connectWallet(): void                                   │
│ ├─ disconnectWallet(): void                                │
│ └─ getWalletAddress(): string                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Login Flow (src/pages/login/login.jsx)                     │
│ 1. User clicks WalletMultiButton                           │
│ 2. Wallet opens (extension or app)                         │
│ 3. User signs message                                      │
│ 4. Signature sent to signInWithWallet()                    │
│ 5. User profile created/retrieved                          │
│ 6. localStorage populated with session                     │
│ 7. User redirected to dashboard                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Session Persistence                                         │
│ ├─ localStorage: wallet_address, connected_wallet, user_id │
│ ├─ Supabase: users table with wallet_address               │
│ └─ ProtectedRoute: checks both session types               │
└─────────────────────────────────────────────────────────────┘
```

## Desktop Flow

**User Journey:**
```
Click "Connect Wallet"
        ↓
Wallet Selector Modal (built-in)
        ↓
Select Phantom/Solflare/Torus/Backpack
        ↓
Browser Extension Opens
        ↓
User Reviews & Signs Message
        ↓
Extension Closes
        ↓
App Verifies Signature
        ↓
User Profile Created/Retrieved
        ↓
Session Stored in localStorage & Supabase
        ↓
Redirect to Dashboard ✓
```

**Why No Transaction Fee?**
- We only sign a message, don't submit transactions
- Message signing is free and instant
- Proves wallet ownership cryptographically

## Mobile Flow

**User Journey:**
```
Click "Connect Wallet"
        ↓
Wallet Selector Modal
        ↓
Select Phantom/Solflare
        ↓
Deep Link Opens Wallet App
        ↓
Wallet App Asks User to Approve
        ↓
User Signs in Wallet App
        ↓
Automatic Deep Link Back to Site
        ↓
App Verifies Signature
        ↓
User Profile Created/Retrieved
        ↓
Session Stored in localStorage & Supabase
        ↓
Dashboard Ready ✓
```

## File-by-File Breakdown

### `src/context/WalletProvider.jsx`

Sets up the Solana Wallet Adapter with three main providers:

```javascript
<ConnectionProvider>          {/* Connects to Solana devnet */}
  <WalletProvider>            {/* Manages 4 wallet adapters */}
    <WalletModalProvider>     {/* Provides UI for selector */}
      <YourApp />
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
```

**Supported Wallets:**
- Phantom (most popular)
- Solflare
- Torus
- Any other adapter from @solana/wallet-adapters

### `src/hooks/useWallet.js`

Custom hook that wraps wallet adapter with clean API:

```javascript
const { 
  connected,           // Is wallet connected?
  connecting,         // Connection in progress?
  wallet,             // Current wallet object
  sign,               // Function: sign message
  connectWallet,      // Function: open selector
  disconnectWallet,   // Function: disconnect
  getWalletAddress    // Function: get address
} = useWallet();
```

### `src/utils/supabaseAuth.js` - signInWithWallet()

**What it does:**
1. Takes wallet address + signature data
2. Tries Supabase Web3 auth (works when enabled)
3. Creates/retrieves user from `users` table
4. Stores wallet data in localStorage
5. Returns authenticated user object

**Example:**
```javascript
const result = await signInWithWallet(
  'HN7cABqLq46Es1jh92dQQisAq662SmxELLkuTAWj', 
  {
    signature: 'base64...',
    publicKey: 'HN7c...',
    walletName: 'Phantom'
  }
);

console.log(result.user);        // User profile from DB
console.log(result.isNewUser);   // First login?
console.log(result.walletAddress); // Wallet address
```

### `src/utils/supabaseAuth.js` - getCurrentUser()

**Fixed to properly retrieve authenticated user:**

```javascript
// When wallet is connected:
1. Checks localStorage for wallet_address & user_id
2. Queries Supabase users table with user_id
3. Returns full user profile

// Fallback:
- Checks Supabase session (email auth)
- Returns email user if found
- Returns null if not authenticated
```

**Why it matters:**
- Portfolio and dashboard pages call this on mount
- If they get null, user is NOT authenticated
- If authenticated, they get full user profile
- No extra wallet signing needed on page reload

### `src/components/ProtectedRoute.jsx`

**Updated to check both auth types:**

```javascript
const hasSession = !!session || (!!walletAddress && !!userId);
```

Now correctly authenticates users via:
1. Supabase email sessions
2. Wallet authentication (localStorage + database)

## Session Persistence

**How it works after wallet connection:**

```javascript
// After successful wallet signing in login.jsx
localStorage.setItem('wallet_address', walletAddress);     // Store address
localStorage.setItem('connected_wallet', 'Phantom');       // Store wallet name
localStorage.setItem('user_id', user.id);                  // Store user ID
```

**When user navigates to protected page (portfolio):**

```javascript
// ProtectedRoute.jsx checks:
const walletAddress = localStorage.getItem('wallet_address');
const userId = localStorage.getItem('user_id');
if (walletAddress && userId) {
  // User is authenticated, allow access
} else {
  // Not authenticated, redirect to login
}

// Portfolio.jsx calls:
const user = await getCurrentUser();
// Returns full user profile from database
```

**No re-signing needed because:**
- Session stored in localStorage persists across page reloads
- `getCurrentUser()` fetches from database, not wallet
- Protected routes just check if localStorage has valid session

## Troubleshooting

### Issue: Wallet connects but portfolio says not logged in

**Cause:** User ID not stored in localStorage

**Fix:**
1. Open DevTools → Application → Local Storage
2. Check for `user_id` key
3. If missing, wallet connection didn't complete properly
4. Try connecting again, watch for JavaScript errors

### Issue: Session lost after page refresh

**Cause:** localStorage cleared or browser privacy settings

**Fix:**
1. Check browser settings → Privacy & Security
2. Ensure site is not set to delete storage on exit
3. Try in incognito/private window
4. Check if localStorage is blocked by extensions

### Issue: Same wallet address, but different user ID on login

**Cause:** Wallet address not unique or multiple accounts

**Fix:**
1. Check Supabase `users` table
2. Ensure `wallet_address` column has UNIQUE constraint
3. Run: `ALTER TABLE users ADD UNIQUE(wallet_address);`

### Issue: Mobile wallet not opening

**Cause:** Deep linking not configured or app not installed

**Fix:**
1. Install Phantom/Solflare wallet app on phone
2. Make sure app is up to date
3. Try from Safari/Chrome (not WebView)
4. Check if domain is allowed in wallet settings

## Configuration

### In `src/App.js`

```javascript
import WalletProvider from './context/WalletProvider';

<ThemeProvider>
  <WalletProvider>  {/* Wraps entire app */}
    <Router>
      <Routes>
        {/* Your routes */}
      </Routes>
    </Router>
  </WalletProvider>
</ThemeProvider>
```

### In `src/context/WalletProvider.jsx`

```javascript
// Default RPC endpoint
const endpoint = useMemo(() => 'https://api.devnet.solana.com', []);

// Supported adapters
const wallets = useMemo(
  () => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TorusWalletAdapter(),
  ],
  []
);
```

**To add more wallets:**
```javascript
import { SomeWalletAdapter } from '@solana/wallet-adapters-some-wallet';

const wallets = useMemo(
  () => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TorusWalletAdapter(),
    new SomeWalletAdapter(),  // Add here
  ],
  []
);
```

## Testing

### Test Desktop Wallet
1. Install Phantom extension
2. Visit localhost:3000/login
3. Click "Wallet Connect"
4. Select Phantom
5. Sign message in extension
6. Should redirect to dashboard

### Test Mobile Wallet
1. Install Phantom app on phone
2. Visit localhost on phone (via ngrok or local network)
3. Click "Wallet Connect"
4. Select Phantom
5. App opens automatically
6. Sign in app
7. Auto-redirects back to site

### Test Session Persistence
1. Connect wallet
2. Open DevTools → Application → Local Storage
3. Verify `wallet_address`, `connected_wallet`, `user_id` exist
4. Refresh page
5. Should still show as logged in
6. Navigate to portfolio
7. Should load without re-signing

## Security Considerations

### What We Don't Do
- ❌ Send private keys to server
- ❌ Execute transactions
- ❌ Store sensitive data in localStorage
- ❌ Verify signatures server-side (for now)

### What We Do
- ✅ Sign messages (proves ownership)
- ✅ Store wallet address (public data)
- ✅ Use HTTPS only (in production)
- ✅ Validate signatures cryptographically (ready for Web3 auth)

### Production Checklist
- [ ] Enable Supabase Web3 Auth for signature verification
- [ ] Switch RPC endpoint to mainnet
- [ ] Add CORS whitelist to Supabase
- [ ] Enable HTTPS only (automatic on Vercel)
- [ ] Set up wallet address validation on backend
- [ ] Add rate limiting to sign-in endpoint

## Next Steps

### Enable Supabase Web3 Auth
1. Go to Supabase Dashboard
2. Authentication → Providers
3. Enable "Solana"
4. Solana network: mainnet-beta
5. Signatures automatically verified

### Add Blockchain Recording
1. Create smart contract
2. Record proof hashes on-chain
3. Update `uploadProof()` to mint NFT
4. Add chain explorer links to portfolio

### Mobile App Support
1. Implement deep linking schema
2. Handle return from wallet app
3. Store session in secure storage
4. Support WalletConnect v2

## References

- **Solana Docs**: https://docs.solana.com
- **Wallet Adapter**: https://github.com/solana-labs/wallet-adapter
- **Phantom Docs**: https://docs.phantom.app
- **Solflare Docs**: https://docs.solflare.com
