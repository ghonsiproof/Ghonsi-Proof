# Document Extraction → Signing → Pinata IPFS Flow

## Overview
This document explains how the complete document proof workflow operates, from extraction through blockchain transaction signing to IPFS storage.

## Flow Diagram

```
User Uploads Document
    ↓
Frontend validates file
    ↓
Call extractDocumentData() API
    ↓
Extraction API processes file (returns JSON)
    ↓
TransactionSignerModal opens with extracted data
    ↓
User signs Solana transaction (0.01 SOL to treasury)
    ↓
Transaction sent to devnet
    ↓
uploadDocumentWithMetadata() to Pinata
    ↓
Pinata returns IPFS hash
    ↓
Save to Supabase with IPFS hash + transaction hash
    ↓
Portal shows proof on profile page
```

## Step-by-Step Breakdown

### 1. Document Upload & Extraction (upload.jsx)

**File**: `src/pages/upload/upload.jsx`

```javascript
// User submits the form
const handleSubmit = async (e) => {
  // Validates proof type, name, summary, wallet connection
  // Prepares documentData object
  
  const documentData = {
    proofType: proofType,
    proofName: proofName,
    summary: summary,
    referenceLink: referenceLink || null,
    walletAddress: publicKey?.toString() || null,
    userId: user.id,
    uploadedAt: new Date().toISOString(),
  };
  
  // Shows transaction signer modal
  setShowTransactionModal(true);
};
```

### 2. Extraction API Call

**File**: `src/utils/extractionApi.js`

The extraction happens when the user has files marked as reference documents:

```javascript
export const extractDocumentData = async (file, proofType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('proof_type', apiProofType);
  
  // Sends to backend extraction API
  const response = await fetch('https://extraction-api-e54a.onrender.com/api/extract/', {
    method: 'POST',
    body: formData,
  });
  
  // Returns extracted JSON data
  const data = await response.json();
  return data; // JSON with extracted fields
};
```

**Expected Response from Extraction API**:
```json
{
  "extracted_text": "...",
  "skills": ["JavaScript", "React", "Solana"],
  "certifications": [...],
  "dates": {...},
  "normalized_data": {...}
}
```

### 3. Transaction Signer Modal

**File**: `src/components/TransactionSignerModal.jsx`

```javascript
// User sees transaction details
{
  amount: "0.01 SOL",
  receiver: "EKGNwqNBUBtH5Fnmcjjoj4Tci6dCXdcCrxcjTaWm5bLf",
  description: "Document proof verification fee"
}

// User clicks "Sign & Upload"
// Modal calls createAndSignTransaction()
```

### 4. Solana Transaction Creation

**File**: `src/utils/transactionSigner.js`

```javascript
export const createAndSignTransaction = async (
  amount, // 0.01 SOL in lamports
  treasuryAddress,
  signer, // Wallet public key
  connection
) => {
  // Creates SystemProgram transfer instruction
  const instruction = SystemProgram.transfer({
    fromPubkey: signer,
    toPubkey: new PublicKey(treasuryAddress),
    lamports: LAMPORTS_PER_SOL * amount,
  });
  
  // Builds transaction
  const transaction = new Transaction().add(instruction);
  
  // Signs with wallet adapter
  const signed = await wallet.signTransaction(transaction);
  
  // Sends to devnet
  const txHash = await connection.sendRawTransaction(signed.serialize());
  
  return { txHash, amount };
};
```

### 5. Document Upload to Pinata (IPFS)

**File**: `src/utils/pinataUpload.js`

After successful transaction signing:

```javascript
export const uploadDocumentWithMetadata = async (documentData, metadata = {}) => {
  const enrichedData = {
    ...documentData,
    // documentData includes extracted JSON
    metadata: {
      uploadedAt: new Date().toISOString(),
      ...metadata, // includes transactionHash
    },
  };
  
  return uploadToPinata(enrichedData, `document-${Date.now()}`);
};

// Creates JSON blob from extracted data
const jsonData = JSON.stringify(documentData);
const blob = new Blob([jsonData], { type: 'application/json' });

// Uploads to Pinata with JWT
const response = await fetch('https://uploads.pinata.cloud/pinning/pinFileToIPFS', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
  },
  body: formData,
});

// Returns IPFS hash
return {
  hash: result.IpfsHash, // QmX...
  url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
};
```

### 6. Save to Supabase Database

**File**: `src/utils/proofsApi.js`

```javascript
export const uploadProof = async (proofData) => {
  // proofData now includes:
  // - ipfsHash: "QmX..."
  // - ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmX..."
  // - transactionHash: "3tX..."
  
  const { data: proof } = await supabase
    .from("proofs")
    .insert({
      user_id: user.id,
      proof_type: proofData.proofType,
      proof_name: proofData.proofName,
      summary: proofData.summary,
      ipfs_hash: proofData.ipfsHash,
      ipfs_url: proofData.ipfsUrl,
      transaction_hash: proofData.transactionHash,
      status: "verified",
      verified_at: new Date().toISOString(),
    })
    .select()
    .single();
    
  return proof;
};
```

### 7. Display in Portfolio

**File**: `src/pages/portfolio/portfolio.jsx`

```javascript
// Fetches proof from database
const proof = await getProof(proofId);

// Can retrieve original data from IPFS
const originalData = await fetchFromPinataWithFallback(proof.ipfs_hash);

// Display on portfolio with blockchain proof
<ProofCard
  title={proof.proof_name}
  ipfsUrl={proof.ipfs_url}
  transactionHash={proof.transaction_hash}
  verified={true}
/>
```

## Data Flow Summary

```
Document File
    ↓
extractDocumentData() → JSON {extracted: data}
    ↓
+documentData (name, type, summary)
    ↓
{...documentData, extracted: data}
    ↓
Transaction signed (0.01 SOL) → txHash
    ↓
uploadDocumentWithMetadata({...documentData, metadata: {txHash}})
    ↓
Pinata returns IPFS hash
    ↓
Supabase saves {ipfs_hash, ipfs_url, transaction_hash}
```

## Environment Variables Required

```
# .env or Vercel Environment Variables
REACT_APP_PINATA_JWT=eyJhbGc... # Your Pinata JWT
REACT_APP_PINATA_API_KEY=c8fd502c9200ac63db74
REACT_APP_PINATA_API_SECRET=60ba267c...
REACT_APP_TREASURY_WALLET=EKGNwqNBUBtH5Fnmcjjoj4Tci6dCXdcCrxcjTaWm5bLf
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
```

## Database Schema (Proofs Table)

```sql
CREATE TABLE proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  proof_type TEXT NOT NULL,
  proof_name TEXT NOT NULL,
  summary TEXT,
  reference_link TEXT,
  ipfs_hash TEXT, -- New: Pinata IPFS hash (QmX...)
  ipfs_url TEXT,  -- New: Full IPFS gateway URL
  transaction_hash TEXT, -- New: Solana tx hash
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

## Error Handling

### Extraction Fails
```javascript
if (!supportsExtraction(proofType)) {
  // Skip modal, upload directly to database
  // User still needs to sign transaction if wallet-only
}
```

### Transaction Fails
```javascript
// Modal shows retry options
// Document not sent to Pinata
// No database record created
```

### Pinata Upload Fails
```javascript
// Error shown to user
// Transaction already sent (non-reversible)
// Can retry Pinata upload separately
```

## Testing the Flow

### 1. Local Testing
```bash
# Start with a document file (PDF, image, etc)
# Upload with proof type: "certificates"
# Should see extracted data in console
```

### 2. Transaction Verification
```javascript
// Check transaction on Solana devnet
https://explorer.solana.com/tx/[txHash]?cluster=devnet
```

### 3. IPFS Verification
```
// Check Pinata dashboard
// Or access directly:
https://gateway.pinata.cloud/ipfs/[hash]
```

## API Endpoints Called

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `https://extraction-api-e54a.onrender.com/api/extract/` | POST | Extract data from document |
| `https://uploads.pinata.cloud/pinning/pinFileToIPFS` | POST | Upload JSON to IPFS |
| `https://gateway.pinata.cloud/ipfs/[hash]` | GET | Retrieve from IPFS |
| Supabase REST API | POST/GET | Save/fetch proof records |
| Solana Devnet RPC | POST | Submit transaction |

## Security Considerations

1. **Pinata JWT**: Keep in environment variables only, never in client code
2. **Private Keys**: Never handled client-side, always use wallet adapter
3. **IPFS Data**: Immutable - verify hash matches before displaying
4. **Transaction Verification**: Confirm txHash on-chain before marking as verified

## Next: Smart Contract Integration

The smart contract will:
1. Verify the Solana transaction on-chain
2. Mint an NFT as proof verification receipt
3. Admin can approve/reject proofs
4. Store proof metadata on-chain

See `SMART_CONTRACT_GUIDE.md` for details.
