# Session & Authentication API Reference

Quick reference for using the new session management and blockchain submission APIs.

## Session Management

### Check if User is Authenticated
```javascript
import { isAuthenticated } from './utils/supabaseAuth';

const authenticated = await isAuthenticated();
if (authenticated) {
  console.log('User is logged in');
}
```

### Get Current User
```javascript
import { getCurrentUser } from './utils/supabaseAuth';

const user = await getCurrentUser();
console.log(user.id, user.email, user.wallet_address);
```

### Get Wallet Session Info
```javascript
import { getWalletSession } from './utils/supabaseAuth';

const session = getWalletSession();
console.log(session.walletAddress, session.userId, session.sessionToken);
```

### Verify Wallet Session is Valid
```javascript
import { verifyWalletSession } from './utils/supabaseAuth';

const isValid = await verifyWalletSession();
if (isValid) {
  console.log('Wallet session is still valid');
}
```

### Sign In with Wallet
```javascript
import { signInWithWallet } from './utils/supabaseAuth';

const result = await signInWithWallet(walletAddress, {
  signature: base64Signature,
  publicKey: publicKeyString,
  walletName: 'Phantom'
});

console.log(result.userId); // User ID
console.log(result.isNewUser); // true if just created
```

### Logout User
```javascript
import { logout } from './utils/supabaseAuth';

await logout();
// All session data is cleared automatically
```

---

## Session Recovery

### Initialize on App Load
```javascript
import { initializeSessionRecovery } from './utils/sessionRecovery';

// Call in App.js useEffect or at app initialization
const sessionStatus = await initializeSessionRecovery();

if (sessionStatus.authenticated) {
  console.log('User recovered, auth type:', sessionStatus.type);
  // User is automatically authenticated
}
```

### Check for Active Session
```javascript
import { hasActiveSession } from './utils/sessionRecovery';

const hasSession = await hasActiveSession();
if (hasSession) {
  console.log('User has active session');
}
```

### Get Authenticated User (from any method)
```javascript
import { getCurrentAuthenticatedUser } from './utils/sessionRecovery';

const user = await getCurrentAuthenticatedUser();
// Works for both Supabase and wallet sessions
```

### Validate Session Before Operation
```javascript
import { validateSession } from './utils/sessionRecovery';

// Before critical operations
const isValid = await validateSession();
if (!isValid) {
  // Session expired or invalid
  navigate('/login');
}
```

### Debug Session Info
```javascript
import { debugSessionInfo } from './utils/sessionRecovery';

// Logs detailed session information to console
debugSessionInfo();
// Output:
// [v0] === SESSION DEBUG INFO ===
// Wallet Address: 9b5X...
// User ID: 550e...
// Connected Wallet: Phantom
// etc.
```

---

## Blockchain Submission

### Submit Proof to Blockchain
```javascript
import { submitProofToBlockchain } from './utils/blockchainSubmission';

const result = await submitProofToBlockchain(
  {
    proofId: 'unique-id',
    title: 'My Certification',
    description: 'Completed course',
    proofType: 'certificates',
    ipfsUri: 'https://gateway.pinata.cloud/ipfs/Qm...',
  },
  walletAddress
);

console.log(result.tx); // Transaction hash
console.log(result.proofPda); // Program derived address
console.log(result.mint); // NFT mint address
```

### Update Proof with Blockchain Data
```javascript
import { updateProofWithBlockchainData } from './utils/blockchainSubmission';

await updateProofWithBlockchainData(proofDatabaseId, {
  tx: transactionHash,
  proofPda: proofPDAAddress,
  mint: nftMintAddress,
});
```

### Get Proof Blockchain Status
```javascript
import { getProofBlockchainStatus } from './utils/blockchainSubmission';

const proof = await getProofBlockchainStatus(proofId);

console.log(proof.isSubmittedOnchain); // true/false
console.log(proof.transactionLink); // Link to explorer
console.log(proof.pdaLink); // Link to PDA on explorer
```

### Check Wallet Balance
```javascript
import { checkWalletBalance } from './utils/blockchainSubmission';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';

const { connection } = useConnection();
const { publicKey } = useWallet();

const balanceInSol = await checkWalletBalance(publicKey, connection);
console.log(`Balance: ${balanceInSol} SOL`);
```

### Verify Blockchain Transaction
```javascript
import { verifyBlockchainTransaction } from './utils/blockchainSubmission';
import { useConnection } from '@solana/wallet-adapter-react';

const { connection } = useConnection();

const isConfirmed = await verifyBlockchainTransaction(txHash, connection);
if (isConfirmed) {
  console.log('Transaction confirmed on blockchain');
}
```

---

## Common Usage Patterns

### Protected Route Check
```javascript
// In components that need authentication
import { isAuthenticated } from './utils/supabaseAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function MyComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      if (!auth) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // Component code...
}
```

### Wallet Connection & Login
```javascript
import { useWallet } from './hooks/useWallet';
import { signInWithWallet } from './utils/supabaseAuth';

export default function LoginComponent() {
  const { connected, publicKey, sign } = useWallet();

  const handleLogin = async () => {
    if (!connected || !publicKey) {
      console.error('Wallet not connected');
      return;
    }

    const message = `Sign to login to Ghonsi Proof`;
    const signature = await sign(new TextEncoder().encode(message));

    const result = await signInWithWallet(publicKey.toString(), {
      signature: Buffer.from(signature).toString('base64'),
      publicKey: publicKey.toString(),
      walletName: 'Phantom'
    });

    if (result.userId) {
      console.log('Logged in as:', result.userId);
      // Navigate to home
    }
  };

  return <button onClick={handleLogin}>Login with Wallet</button>;
}
```

### Upload with Blockchain Submission
```javascript
import { uploadProof } from './utils/proofsApi';
import { submitProofToBlockchain } from './utils/blockchainSubmission';

async function completeProofUpload(proofData, ipfsResult) {
  // Step 1: Save to database
  const dbProof = await uploadProof(proofData, [], [files[0]]);
  
  // Step 2: Submit to blockchain
  const blockchainResult = await submitProofToBlockchain(
    {
      proofId: dbProof.proof.id,
      title: proofData.proofName,
      description: proofData.summary,
      proofType: proofData.proofType,
      ipfsUri: ipfsResult.url,
    },
    walletAddress
  );

  // Step 3: Update with blockchain data
  await updateProofWithBlockchainData(dbProof.proof.id, blockchainResult);
  
  console.log('Proof fully submitted:', {
    database: dbProof.proof.id,
    ipfs: ipfsResult.hash,
    blockchain: blockchainResult.tx
  });
}
```

### Check Session on App Load
```javascript
import { useEffect } from 'react';
import { initializeSessionRecovery } from './utils/sessionRecovery';

export default function App() {
  useEffect(() => {
    const recover = async () => {
      const result = await initializeSessionRecovery();
      console.log('Session status:', result);
      
      if (!result.authenticated) {
        // No session, user needs to login
      }
    };
    
    recover();
  }, []);

  return <YourApp />;
}
```

---

## Error Handling

### Handle Authentication Errors
```javascript
import { signInWithWallet } from './utils/supabaseAuth';

try {
  const result = await signInWithWallet(walletAddress, signatureData);
  
  if (!result.userId) {
    console.error('Authentication failed');
  }
} catch (error) {
  if (error.message.includes('network')) {
    console.error('Network error, try again');
  } else {
    console.error('Authentication error:', error.message);
  }
}
```

### Handle Blockchain Submission Errors
```javascript
import { submitProofToBlockchain } from './utils/blockchainSubmission';

try {
  const result = await submitProofToBlockchain(proofData, walletAddress);
  console.log('Blockchain submission successful:', result);
} catch (error) {
  console.error('Blockchain submission failed:');
  console.error('- Cause:', error.message);
  console.error('- Proof may be in database but not on blockchain');
  console.error('- User can retry from dashboard');
}
```

---

## Type Hints (if using TypeScript)

```typescript
// Session interfaces
interface WalletSession {
  walletAddress: string;
  userId: string;
  sessionToken: string;
  connectedWallet: string;
}

interface SessionStatus {
  authenticated: boolean;
  type: 'supabase' | 'wallet' | 'wallet_invalid' | 'none' | 'error';
  session?: WalletSession;
  error?: Error;
}

interface AuthUser {
  id: string;
  email?: string;
  wallet_address?: string;
  [key: string]: any;
}

// Blockchain interfaces
interface ProofBlockchainData {
  proofId: string;
  title: string;
  description: string;
  proofType: string;
  ipfsUri: string;
}

interface BlockchainSubmissionResult {
  tx: string;
  proofPda: string;
  mint: string;
  uri: string;
  status: string;
  timestamp: string;
}
```

---

## Troubleshooting

### Session Lost After Refresh
```javascript
// Check what's in localStorage
console.log(localStorage.getItem('wallet_address'));
console.log(localStorage.getItem('session_token'));
console.log(localStorage.getItem('user_id'));

// Verify session
import { verifyWalletSession } from './utils/supabaseAuth';
const isValid = await verifyWalletSession();
console.log('Session valid:', isValid);
```

### Blockchain Submission Not Working
```javascript
// Check if blockchain endpoint is configured
console.log('REACT_APP_TREASURY_WALLET:', process.env.REACT_APP_TREASURY_WALLET);

// Check wallet connection
console.log('Wallet connected:', publicKey);
console.log('Wallet address:', publicKey?.toString());

// Check proof data
console.log('Proof data:', proofData);
```

### User Not Authenticated on Protected Routes
```javascript
// In ProtectedRoute or similar
import { validateSession } from './utils/sessionRecovery';

const isValid = await validateSession();
console.log('Session valid:', isValid);

// Check both auth methods
import { isAuthenticated } from './utils/supabaseAuth';
const auth = await isAuthenticated();
console.log('Authenticated:', auth);
```
