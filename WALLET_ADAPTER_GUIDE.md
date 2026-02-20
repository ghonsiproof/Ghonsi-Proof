# Solana Wallet Adapter Implementation Guide

## Overview
This guide explains the wallet adapter implementation that enables Solana wallet authentication with Supabase Web3 auth.

## What Was Changed

### **Removed (Old Broken Code)**
1. `src/utils/walletAdapter.js` - Incomplete wallet adapter with broken functions
2. `src/hooks/useWalletAuth.js` & `usewalletauth.js` - Non-standard auth hooks
3. `src/context/WalletContext.jsx` - Old context provider that didn't wrap everything properly

### **Added (New Implementation)**

#### 1. **WalletProvider** (`src/context/WalletProvider.jsx`)
The core provider that sets up the Solana Wallet Adapter ecosystem:

```jsx
<ConnectionProvider endpoint={endpoint}>  // RPC connection to devnet
  <SolanaWalletProvider wallets={wallets}>  // Manages wallet adapters
    <WalletModalProvider>  // Shows wallet selector UI
      <App />
    </WalletModalProvider>
  </SolanaWalletProvider>
</ConnectionProvider>
```

**Wallets Supported:**
- Phantom (default)
- Solflare
- Torus

**Features:**
- Auto-connect enabled (remembers last wallet)
- Devnet configured for development
- Stores wallet address in localStorage

#### 2. **useWallet Hook** (`src/hooks/useWallet.js`)
Custom React hook that wraps Solana Wallet Adapter with simplified API:

```javascript
const { 
  connected,           // Boolean: wallet connected?
  connecting,          // Boolean: currently connecting?
  wallet,              // Object: current wallet info
  getWalletAddress(),  // Returns: wallet address string
  connectWallet(),     // Opens wallet selector modal
  disconnectWallet(),  // Disconnects wallet
  sign(message)        // Returns: { signature, publicKey }
} = useWallet();
```

#### 3. **Supabase Web3 Integration** (`src/utils/supabaseAuth.js`)
The `signInWithWallet()` function now:
1. **Accepts signature proof** - Takes the signed message as authentication
2. **Creates/retrieves user** - Upserts user in `users` table with `wallet_address`
3. **Stores wallet metadata** - Saves wallet address and name in localStorage
4. **Returns auth result** - Returns user object, session, and isNewUser flag

#### 4. **Login Page Updates** (`src/pages/login/login.jsx`)
Flow:
1. User clicks `WalletMultiButton`
2. On desktop: Extension picker modal appears
3. On mobile: Deep links to wallet app
4. User selects wallet and signs message
5. `handleWalletAuth()` gets signature and calls `signInWithWallet()`
6. User created in DB and signed in
7. Redirects to `/home`

#### 5. **Styling** (`src/App.css`)
Added custom CSS for `WalletMultiButton` and modal:
- Gold button (#C19A4A) matching your brand
- Dark theme modal with gold accents
- Hover effects and proper contrast

## How It Works

### **Desktop Flow**
```
User clicks "Connect Wallet"
    ↓
WalletMultiButton shows extension picker modal
    ↓
User selects Phantom/Solflare/Torus
    ↓
Browser extension opens
    ↓
User approves connection in extension
    ↓
Wallet adapter connects (auto-handled)
    ↓
handleWalletAuth() triggers automatically
    ↓
Message signing popup appears in extension
    ↓
User signs message
    ↓
signInWithWallet(walletAddress, signature) called
    ↓
User created/retrieved from Supabase users table
    ↓
Redirect to /home
```

### **Mobile Flow**
```
User clicks "Connect Wallet"
    ↓
WalletMultiButton shows wallet picker modal
    ↓
User selects Phantom/Solflare/etc
    ↓
App deep links to wallet app (e.g., solana://phantom)
    ↓
Wallet app opens and shows connection request
    ↓
User approves in wallet app
    ↓
User taps "Sign" button in wallet app
    ↓
App redirects back to your site
    ↓
Wallet adapter reconnects automatically
    ↓
handleWalletAuth() triggers
    ↓
signInWithWallet() called with signature
    ↓
User authenticated and redirected to /home
```

## Database Integration

### **Supabase Setup Required**
To enable Web3 authentication as a login method alongside email:

1. **Enable Web3 Auth Provider:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Find "Solana" and enable it
   - This creates Web3 as a native auth method

2. **Ensure `users` table has `wallet_address` field:**
   ```sql
   ALTER TABLE users ADD COLUMN wallet_address TEXT UNIQUE;
   ```

3. **Set Row Level Security (RLS):**
   ```sql
   -- Users can read/write their own records
   CREATE POLICY users_own_record
   ON users FOR ALL
   USING (auth.uid() = id);
   ```

### **Authentication Flow with Supabase Web3**
Once Web3 is enabled in Supabase:

1. `signInWithWallet()` calls `supabase.auth.signInWithIdToken()`
2. Supabase verifies the signature cryptographically
3. Creates/updates user in `auth.users` table
4. Also stores wallet address in public `users` table
5. Returns authenticated session

**Before Web3 is enabled:** The code falls back to wallet-address-based auth, storing the wallet address in the users table and localStorage.

## Key Files

| File | Purpose |
|------|---------|
| `src/context/WalletProvider.jsx` | Solana Wallet Adapter setup |
| `src/hooks/useWallet.js` | Wallet connection hook |
| `src/pages/login/login.jsx` | Login page with wallet auth |
| `src/utils/supabaseAuth.js` | Supabase auth functions |
| `src/App.css` | Wallet UI styling |

## Environment Variables

No new environment variables needed. Uses existing Supabase config:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

Wallet adapter uses public Solana devnet by default.

## Testing

### **Desktop (Chrome with Phantom):**
1. Install Phantom extension
2. Create test wallet or use existing
3. Go to login page
4. Click "Connect Wallet"
5. Select Phantom
6. Sign message in popup
7. Should redirect to home

### **Mobile (iOS/Android with Phantom):**
1. Open app in mobile browser
2. Go to login page
3. Click "Connect Wallet"
4. Tap Phantom
5. App deep links to Phantom mobile app
6. Approve and sign in Phantom app
7. Returns to browser and authenticates

## Troubleshooting

**"Wallet not found"**
- Install Phantom or other wallet extension
- On mobile, ensure Phantom app is installed

**"Failed to sign message"**
- User rejected the signature in wallet
- Click "Retry Signature" button

**"Wallet connection failed"**
- Check wallet extension is unlocked
- Try disconnecting and reconnecting

**Database errors**
- Ensure `wallet_address` column exists in `users` table
- Check Supabase RLS policies allow write access

## Future Improvements

1. **Multi-chain support** - Add Ethereum, Bitcoin wallets
2. **SignInWithSolana** - Use official Supabase Web3 method once stable
3. **Wallet email recovery** - Associate wallet with email for account recovery
4. **Transaction signing** - Add ability to sign transactions for on-chain actions
5. **Wallet connection recovery** - Handle edge cases where wallet connection drops

## References

- [Solana Wallet Adapter Docs](https://github.com/solana-labs/wallet-adapter)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Phantom Wallet Docs](https://docs.phantom.app/)
