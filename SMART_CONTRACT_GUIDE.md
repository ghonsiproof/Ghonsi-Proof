# Smart Contract Development Guide - Ghonsi Proof

## Overview
The Ghonsi Proof smart contract will handle on-chain verification of proofs submitted by users. It will maintain an admin approval system and track all proof approvals on the Solana blockchain.

## Architecture

### PDA (Program Derived Account) Structure

```
1. ProofAccount PDA
   Seed: ["proof", ipfs_hash, user_pubkey]
   Stores: proof metadata, status, approval details
   
2. AdminAccount PDA
   Seed: ["admin", admin_pubkey]
   Stores: admin permissions, status
   
3. SettingsAccount PDA
   Seed: ["settings"]
   Stores: program configuration, treasury address
```

## Key Instructions

### 1. `initialize_admin`
**Purpose**: Set up the initial admin authority
**Permissions**: Program deployer only
**Actions**:
- Create admin account
- Set treasury wallet
- Initialize program settings

```rust
pub fn initialize_admin(ctx: Context<InitializeAdmin>) -> Result<()> {
    // Implementation
}
```

### 2. `register_proof`
**Purpose**: Register a new proof on-chain
**Permissions**: Any wallet with SOL balance
**Actions**:
- Create proof PDA
- Store IPFS hash
- Store transaction hash
- Set status to "pending"

```rust
pub fn register_proof(
    ctx: Context<RegisterProof>,
    proof_type: String,
    proof_name: String,
    ipfs_hash: String,
    transaction_hash: String,
) -> Result<()> {
    // Implementation
}
```

### 3. `submit_for_approval`
**Purpose**: Submit proof to admin queue
**Permissions**: Proof owner
**Actions**:
- Change proof status to "submitted"
- Add to approval queue
- Emit event

```rust
pub fn submit_for_approval(ctx: Context<SubmitForApproval>) -> Result<()> {
    // Implementation
}
```

### 4. `approve_proof`
**Purpose**: Admin approves a proof
**Permissions**: Admin only
**Actions**:
- Verify admin permission
- Update proof status to "approved"
- Record approval timestamp
- Emit ApprovedEvent

```rust
pub fn approve_proof(
    ctx: Context<ApproveProof>,
    notes: Option<String>,
) -> Result<()> {
    // Implementation
}
```

### 5. `reject_proof`
**Purpose**: Admin rejects a proof
**Permissions**: Admin only
**Actions**:
- Update proof status to "rejected"
- Store rejection reason
- Emit RejectedEvent

```rust
pub fn reject_proof(
    ctx: Context<RejectProof>,
    reason: String,
) -> Result<()> {
    // Implementation
}
```

### 6. `add_admin`
**Purpose**: Add new admin user
**Permissions**: Super admin only
**Actions**:
- Create admin account
- Set permissions
- Emit AdminAddedEvent

```rust
pub fn add_admin(
    ctx: Context<AddAdmin>,
    permissions: Vec<String>,
) -> Result<()> {
    // Implementation
}
```

## File Structure

```
ghonsi-proof/
├── programs/
│   └── ghonsi-proof/
│       ├── src/
│       │   ├── lib.rs (entry point)
│       │   ├── instructions/
│       │   │   ├── initialize.rs
│       │   │   ├── register_proof.rs
│       │   │   ├── approval.rs
│       │   │   └── admin.rs
│       │   ├── state/
│       │   │   ├── proof.rs
│       │   │   └── admin.rs
│       │   └── error.rs
│       └── Cargo.toml
├── tests/
│   └── ghonsi_proof.ts (Anchor tests)
├── idl/
│   └── ghonsi_proof.json (generated)
└── migrations/
    └── deploy.js
```

## Development Steps

### Step 1: Set up Anchor Project
```bash
anchor init ghonsi-proof
cd ghonsi-proof
```

### Step 2: Define Account Structures (state/proof.rs)
```rust
use anchor_lang::prelude::*;

#[account]
pub struct Proof {
    pub user: Pubkey,
    pub proof_type: String,
    pub proof_name: String,
    pub ipfs_hash: String,
    pub transaction_hash: String,
    pub status: ProofStatus,
    pub created_at: i64,
    pub approved_at: Option<i64>,
    pub approved_by: Option<Pubkey>,
    pub rejection_reason: Option<String>,
    pub notes: Option<String>,
    pub bump: u8,
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum ProofStatus {
    Pending,
    Submitted,
    Approved,
    Rejected,
    NeedsRevision,
}
```

### Step 3: Implement Instructions
Create separate files for each instruction in `instructions/` folder.

### Step 4: Write Tests (tests/ghonsi_proof.ts)
```typescript
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { GhonsiProof } from "../target/types/ghonsi_proof";

describe("ghonsi-proof", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.GhonsiProof as Program<GhonsiProof>;

  it("Initializes admin", async () => {
    // Test implementation
  });

  it("Registers a proof", async () => {
    // Test implementation
  });
});
```

### Step 5: Build & Deploy
```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Generate IDL
anchor idl init -f ghonsi-proof <PROGRAM_ID>
```

## Frontend Integration

After deployment, you'll need to:

1. **Update Program ID** in frontend:
```typescript
export const GHONSI_PROOF_PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");
```

2. **Generate TypeScript client** from IDL:
```bash
npx @metaplex-foundation/beet@latest generate-ts \
  --idl ghonsi-proof.json \
  --outDir src/generated
```

3. **Create frontend hooks** to interact with contract:
```typescript
import { useProgram } from "@anchor-lang/react";
import { GHONSI_PROOF_PROGRAM_ID } from "./constants";

export const useGhonsiProof = () => {
  const program = useProgram(GHONSI_PROOF_PROGRAM_ID);
  
  const approveProof = async (proofAddress: PublicKey) => {
    // Call approve_proof instruction
  };
  
  return { approveProof };
};
```

## Security Considerations

1. **Admin Verification**: Always check admin permissions before approval/rejection
2. **Signer Verification**: Verify that wallet signing transaction is the owner
3. **Idempotency**: Handle duplicate approvals gracefully
4. **Audit Trail**: Emit events for all important actions
5. **Account Validation**: Validate all accounts are owned by the program

## Testing Checklist

- [ ] Admin initialization works
- [ ] Proof registration works
- [ ] Admin can approve proofs
- [ ] Admin can reject proofs
- [ ] Only admin can approve/reject
- [ ] User can only register their own proofs
- [ ] Events are emitted correctly
- [ ] Proof status transitions are valid
- [ ] Error handling works
- [ ] RPC calls succeed

## Deployment Checklist

- [ ] All tests passing
- [ ] No console warnings
- [ ] Program size < 1MB
- [ ] All security checks passed
- [ ] Devnet deployment successful
- [ ] IDL generated correctly
- [ ] Frontend integration tested
- [ ] Admin functions tested
- [ ] Ready for mainnet deployment

## Useful Resources

- Anchor Book: https://book.anchor-lang.com
- Solana Documentation: https://docs.solana.com
- Anchor Examples: https://github.com/coral-xyz/anchor/tree/master/examples
- SPL Token Program: https://github.com/solana-labs/solana-program-library

## Next Steps

1. Create the Anchor program in `/programs/ghonsi-proof/`
2. Implement all 6 core instructions
3. Write comprehensive tests
4. Deploy to devnet
5. Generate IDL from deployed program
6. Integrate with frontend
7. Test end-to-end flow
8. Prepare for mainnet

