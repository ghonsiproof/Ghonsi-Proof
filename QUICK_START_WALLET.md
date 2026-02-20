# Quick Start: Wallet Authentication

## For Users

### Connecting Your Wallet (Desktop)

1. Go to `/login`
2. Click "Wallet Connect" tab
3. Click the gold "Connect Wallet" button
4. Select your wallet (Phantom, Solflare, etc.)
5. Your browser extension opens
6. Review the message and click "Sign"
7. You're logged in! ✓

**No transaction fees. No money sent. Just proving ownership.**

### Connecting Your Wallet (Mobile)

1. Go to `/login` on your phone
2. Click "Wallet Connect" tab
3. Click the gold "Connect Wallet" button
4. Select your wallet app (Phantom, Solflare)
5. Wallet app opens automatically
6. Review message and tap "Approve"
7. Redirected back to site automatically
8. You're logged in! ✓

### View Your Portfolio

Once logged in:
1. Navigate to `/portfolio`
2. See all your proofs
3. Share your profile

### Sign Out

In the header:
1. Click hamburger menu (mobile) or wallet button (desktop)
2. Click "Disconnect Wallet"
3. Logged out ✓

---

## For Developers

### Using Wallet in Your Component

```javascript
import { useWallet } from './hooks/useWallet';

function MyComponent() {
  const { connected, sign, getWalletAddress } = useWallet();

  const handleSign = async () => {
    const message = "Sign this message";
    const signature = await sign(message);
    console.log('Signature:', signature);
  };

  return (
    <div>
      {connected ? (
        <>
          <p>Connected: {getWalletAddress()}</p>
          <button onClick={handleSign}>Sign Message</button>
        </>
      ) : (
        <p>Wallet not connected</p>
      )}
    </div>
  );
}
```

### Checking if User is Logged In

```javascript
import { getCurrentUser } from './utils/supabaseAuth';

// In a component
useEffect(() => {
  const checkUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      console.log('Logged in:', user.wallet_address);
    } else {
      console.log('Not logged in');
    }
  };
  checkUser();
}, []);
```

### Protecting a Route

```javascript
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/dashboard';

<Routes>
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
</Routes>
```

### Sign In with Wallet

```javascript
import { signInWithWallet } from './utils/supabaseAuth';
import { useWallet } from './hooks/useWallet';

function LoginComponent() {
  const { sign, getWalletAddress } = useWallet();

  const handleLogin = async () => {
    const address = getWalletAddress();
    const message = `Sign to login: ${address}`;
    const signature = await sign(message);

    const result = await signInWithWallet(address, {
      signature,
      walletName: 'Phantom'
    });

    if (result) {
      navigate('/dashboard');
    }
  };

  return <button onClick={handleLogin}>Sign In</button>;
}
```

---

## File Structure Reference

```
src/
├── context/
│   └── WalletProvider.jsx          # Sets up wallet adapters
├── hooks/
│   └── useWallet.js                # Custom wallet hook
├── pages/
│   └── login/login.jsx             # Wallet login UI
├── utils/
│   └── supabaseAuth.js             # signInWithWallet, getCurrentUser
├── components/
│   └── ProtectedRoute.jsx          # Checks wallet auth
└── App.js                          # Wraps with WalletProvider
```

---

## Key Functions

### `useWallet()`
Returns wallet state and methods:
- `connected: boolean`
- `connecting: boolean`
- `wallet: WalletAdapter`
- `sign(message): Promise<SignResult>`
- `connectWallet(): Promise<void>`
- `disconnectWallet(): Promise<void>`
- `getWalletAddress(): string`

### `signInWithWallet(address, signatureData)`
Authenticates with Supabase:
- Creates/retrieves user from `users` table
- Stores session in localStorage
- Returns user profile

### `getCurrentUser()`
Gets authenticated user:
- Returns wallet user if connected
- Returns email user if session exists
- Returns null if not authenticated

### `ProtectedRoute`
Guards routes:
- Checks localStorage for wallet session
- Checks Supabase for email session
- Redirects to login if not authenticated

---

## Debugging

### Check Console Logs
```
[v0] Signing in with wallet: HN7c...
[v0] Created new user with wallet: HN7c...
[v0] User authenticated: uuid...
[v0] Auth check - Session: false Wallet: true
```

### Check localStorage
```javascript
console.log(localStorage.getItem('wallet_address'));      // Wallet address
console.log(localStorage.getItem('connected_wallet'));    // Phantom/Solflare
console.log(localStorage.getItem('user_id'));             // User ID from DB
```

### Check Supabase
1. Go to Dashboard
2. Go to Editor → public → users
3. Look for row with your wallet_address
4. Verify user_id matches localStorage

---

## Common Issues

### "Wallet not connecting on mobile"
- Make sure wallet app is installed
- Check wallet is on Solana devnet
- Try refreshing the page
- Try in Chrome/Safari (not WebView)

### "Session lost after refresh"
- Check localStorage wasn't cleared
- Check browser privacy settings
- Check if extension is blocking localStorage
- Try in incognito mode

### "Portfolio shows 'not logged in' after connecting"
- Check localStorage has user_id
- Check Supabase users table has that ID
- Check getCurrentUser() is being called
- Look at browser console for errors

### "Different user ID each time I login"
- Make sure wallet_address is UNIQUE in Supabase
- Don't create multiple accounts with same wallet
- Use signInWithWallet() which handles this

---

## Testing Checklist

- [ ] Desktop: Connect with Phantom, sign, redirect to dashboard
- [ ] Mobile: Connect with Phantom, app opens, sign, auto-redirect
- [ ] Page refresh: Stay logged in, see wallet address
- [ ] Navigate to portfolio: No re-signing needed
- [ ] Sign out: Logout and localStorage cleared
- [ ] Protected route: Redirects to login if not authenticated
- [ ] Multiple wallets: Can connect different wallets

---

## Support

For issues:
1. Check browser console for `[v0]` logs
2. Check localStorage for session data
3. Check Supabase users table for user record
4. Read WALLET_SETUP.md for detailed info
