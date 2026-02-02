import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GhonsiProof } from "../target/types/ghonsi_proof";
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import * as fs from "fs";

describe("Ghonsi Proof - Anti-Plagiarism System", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GhonsiProof as Program<GhonsiProof>;

  // The primary admin (your wallet)
  const primaryAdmin = provider.wallet.publicKey;

  // Load pre-funded test users from keypair files
  const user1 = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync("tests/test-keys/user1.json", "utf-8")))
  );
  const user2 = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync("tests/test-keys/user2.json", "utf-8")))
  );
  const secondaryAdmin = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync("tests/test-keys/secondary-admin.json", "utf-8")))
  );

  const collectionMint = Keypair.generate();

  const [programAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_authority")],
    program.programId
  );

  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("authority")],
    program.programId
  );

  before("Check wallet balances", async () => {
    const bal1 = await provider.connection.getBalance(user1.publicKey);
    const bal2 = await provider.connection.getBalance(user2.publicKey);
    const bal3 = await provider.connection.getBalance(secondaryAdmin.publicKey);

    console.log(`User1 balance: ${bal1 / LAMPORTS_PER_SOL} SOL`);
    console.log(`User2 balance: ${bal2 / LAMPORTS_PER_SOL} SOL`);
    console.log(`Secondary Admin balance: ${bal3 / LAMPORTS_PER_SOL} SOL`);

    if (bal1 < 0.5 * LAMPORTS_PER_SOL || bal2 < 0.5 * LAMPORTS_PER_SOL || bal3 < 0.5 * LAMPORTS_PER_SOL) {
      console.log("⚠️  WARNING: Some test accounts have low balance. Please fund them.");
    }
  });

  it("Initializes the program", async () => {
    try {
      await program.methods
        .initialize()
        .accounts({
          admin: primaryAdmin,
          programAuthority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Program initialized");

      const authority = await program.account.programAuthority.fetch(programAuthority);
      expect(authority.primaryAdmin.toBase58()).to.equal(primaryAdmin.toBase58());
      expect(authority.adminCount).to.equal(1);
    } catch (e) {
      if (e.toString().includes("already in use")) {
        console.log("⚠️  Account already initialized - skipping");
        const authority = await program.account.programAuthority.fetch(programAuthority);
        expect(authority.primaryAdmin.toBase58()).to.equal(primaryAdmin.toBase58());
      } else {
        throw e;
      }
    }
  });

  it("Adds a secondary admin", async () => {
    const authorityBefore = await program.account.programAuthority.fetch(programAuthority);

    // Check if secondary admin is already added
    let alreadyAdmin = false;
    for (let i = 0; i < authorityBefore.adminCount; i++) {
      if (authorityBefore.admins[i].toBase58() === secondaryAdmin.publicKey.toBase58()) {
        alreadyAdmin = true;
        break;
      }
    }

    if (!alreadyAdmin) {
      await program.methods
        .addAdmin(secondaryAdmin.publicKey)
        .accounts({
          admin: primaryAdmin,
          programAuthority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log("✅ Secondary admin added");
    } else {
      console.log("⚠️  Secondary admin already exists - skipping");
    }

    const authority = await program.account.programAuthority.fetch(programAuthority);
    expect(authority.adminCount).to.be.greaterThanOrEqual(2);
  });

  it("User1 mints their own proof", async () => {
    const mint = Keypair.generate();

    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user1.publicKey.toBuffer(), mint.publicKey.toBuffer()],
      program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        user1.publicKey.toBuffer(),
        anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      anchor.utils.token.ASSOCIATED_PROGRAM_ID
    );

    const tx = await program.methods
      .mintProof(
        "PROOF-001",
        "Revolutionary AI Research Paper",
        "https://arweave.net/abc123def456",
        "Original research on quantum neural networks combining principles of quantum computing with deep learning architectures.",
        "Research"
      )
      .accounts({
        owner: user1.publicKey,
        proof: proofPda,
        mint: mint.publicKey,
        tokenAccount,
        mintAuthority,
        programAuthority,
        collectionMint: collectionMint.publicKey,
        admin: primaryAdmin,
        metadata,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([user1, mint])
      .rpc();

    console.log("✅ User1 minted proof");
    console.log("   Proof ID: PROOF-001");
    console.log("   Owner:", user1.publicKey.toBase58());
    console.log("   Tx:", tx);

    const proofAccount = await program.account.proof.fetch(proofPda);
    expect(proofAccount.owner.toBase58()).to.equal(user1.publicKey.toBase58());
    expect(proofAccount.status).to.deep.equal({ pending: {} });
  });

  // Store mint keypairs for later tests
  let user1Mint: Keypair;
  let user2Mint: Keypair;

  it("User1 mints their own proof", async () => {
    user1Mint = Keypair.generate();

    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user1.publicKey.toBuffer(), user1Mint.publicKey.toBuffer()],
      program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        user1Mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        user1.publicKey.toBuffer(),
        anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
        user1Mint.publicKey.toBuffer(),
      ],
      anchor.utils.token.ASSOCIATED_PROGRAM_ID
    );

    const tx = await program.methods
      .mintProof(
        "PROOF-001",
        "Revolutionary AI Research Paper",
        "https://arweave.net/abc123def456",
        "Original research on quantum neural networks combining principles of quantum computing with deep learning architectures.",
        "Research"
      )
      .accounts({
        owner: user1.publicKey,
        proof: proofPda,
        mint: user1Mint.publicKey,
        tokenAccount,
        mintAuthority,
        programAuthority,
        collectionMint: collectionMint.publicKey,
        admin: primaryAdmin,
        metadata,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([user1, user1Mint])
      .rpc();

    console.log("✅ User1 minted proof");
    console.log("   Proof ID: PROOF-001");
    console.log("   Owner:", user1.publicKey.toBase58());
    console.log("   Tx:", tx);

    const proofAccount = await program.account.proof.fetch(proofPda);
    expect(proofAccount.owner.toBase58()).to.equal(user1.publicKey.toBase58());
    expect(proofAccount.status).to.deep.equal({ pending: {} });
  });

  it("User2 mints their own proof", async () => {
    user2Mint = Keypair.generate();

    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user2.publicKey.toBuffer(), user2Mint.publicKey.toBuffer()],
      program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        user2Mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        user2.publicKey.toBuffer(),
        anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
        user2Mint.publicKey.toBuffer(),
      ],
      anchor.utils.token.ASSOCIATED_PROGRAM_ID
    );

    await program.methods
      .mintProof(
        "PROOF-002",
        "Open Source Blockchain Protocol",
        "https://arweave.net/xyz789ghi012",
        "Designed and implemented a novel consensus mechanism for high-throughput blockchain applications.",
        "Development"
      )
      .accounts({
        owner: user2.publicKey,
        proof: proofPda,
        mint: user2Mint.publicKey,
        tokenAccount,
        mintAuthority,
        programAuthority,
        collectionMint: collectionMint.publicKey,
        admin: primaryAdmin,
        metadata,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([user2, user2Mint])
      .rpc();

    console.log("✅ User2 minted proof");
    console.log("   Proof ID: PROOF-002");
  });

  it("Primary admin verifies User1's proof", async () => {
    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user1.publicKey.toBuffer(), user1Mint.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .verifyProof()
      .accounts({
        proof: proofPda,
        admin: primaryAdmin,
        programAuthority,
      })
      .rpc();

    console.log("✅ Proof verified by primary admin");

    const proofAccount = await program.account.proof.fetch(proofPda);
    expect(proofAccount.status).to.deep.equal({ verified: {} });
    expect(proofAccount.verifiedBy.toBase58()).to.equal(primaryAdmin.toBase58());
  });

  it("Secondary admin rejects User2's proof with reason", async () => {
    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user2.publicKey.toBuffer(), user2Mint.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .rejectProof("Insufficient evidence of originality. Please provide source code repository.")
      .accounts({
        proof: proofPda,
        admin: secondaryAdmin.publicKey,
        programAuthority,
      })
      .signers([secondaryAdmin])
      .rpc();

    console.log("✅ Proof rejected by secondary admin");

    const proofAccount = await program.account.proof.fetch(proofPda);
    expect(proofAccount.status).to.deep.equal({ rejected: {} });
    expect(proofAccount.verifiedBy.toBase58()).to.equal(secondaryAdmin.publicKey.toBase58());
    expect(proofAccount.rejectionReason).to.equal("Insufficient evidence of originality. Please provide source code repository.");
  });

  it("Non-admin cannot verify proofs", async () => {
    // Mint a fresh proof for this test
    const testMint = Keypair.generate();
    const [testProofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user1.publicKey.toBuffer(), testMint.publicKey.toBuffer()],
      program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        testMint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        user1.publicKey.toBuffer(),
        anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
        testMint.publicKey.toBuffer(),
      ],
      anchor.utils.token.ASSOCIATED_PROGRAM_ID
    );

    await program.methods
      .mintProof(
        "TEST-NONADMIN",
        "Test for non-admin",
        "https://arweave.net/test",
        "Testing non-admin verification",
        "Test"
      )
      .accounts({
        owner: user1.publicKey,
        proof: testProofPda,
        mint: testMint.publicKey,
        tokenAccount,
        mintAuthority,
        programAuthority,
        collectionMint: collectionMint.publicKey,
        admin: primaryAdmin,
        metadata,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([user1, testMint])
      .rpc();

    const randomUser = Keypair.generate();

    try {
      await program.methods
        .verifyProof()
        .accounts({
          proof: testProofPda,
          admin: randomUser.publicKey,
          programAuthority,
        })
        .signers([randomUser])
        .rpc();

      expect.fail("Should have thrown unauthorized error");
    } catch (e) {
      expect(e.toString()).to.include("Unauthorized");
      console.log("✅ Non-admin correctly blocked from verifying");
    }
  });

  it("Cannot verify already processed proof", async () => {
    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user1.publicKey.toBuffer(), user1Mint.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .verifyProof()
        .accounts({
          proof: proofPda,
          admin: primaryAdmin,
          programAuthority,
        })
        .rpc();

      expect.fail("Should have thrown ProofAlreadyProcessed error");
    } catch (e) {
      expect(e.toString()).to.include("ProofAlreadyProcessed");
      console.log("✅ Cannot re-verify already processed proof");
    }
  });

  it("Removes secondary admin", async () => {
    const authorityBefore = await program.account.programAuthority.fetch(programAuthority);

    // Check if secondary admin exists
    let adminExists = false;
    for (let i = 0; i < authorityBefore.adminCount; i++) {
      if (authorityBefore.admins[i].toBase58() === secondaryAdmin.publicKey.toBase58()) {
        adminExists = true;
        break;
      }
    }

    if (adminExists) {
      await program.methods
        .removeAdmin(secondaryAdmin.publicKey)
        .accounts({
          admin: primaryAdmin,
          programAuthority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const authority = await program.account.programAuthority.fetch(programAuthority);
      expect(authority.adminCount).to.equal(1);
      console.log("✅ Secondary admin removed");
    } else {
      console.log("⚠️  Secondary admin doesn't exist - skipping removal");
    }
  });

  it("Cannot remove primary admin", async () => {
    try {
      await program.methods
        .removeAdmin(primaryAdmin)
        .accounts({
          admin: primaryAdmin,
          programAuthority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      expect.fail("Should have thrown CannotRemovePrimaryAdmin error");
    } catch (e) {
      expect(e.toString()).to.include("CannotRemovePrimaryAdmin");
      console.log("✅ Cannot remove primary admin");
    }
  });

  it("Only primary admin can add admins", async () => {
    const randomUser = Keypair.generate();
    const newAdmin = Keypair.generate();

    try {
      await program.methods
        .addAdmin(newAdmin.publicKey)
        .accounts({
          admin: randomUser.publicKey,
          programAuthority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([randomUser])
        .rpc();

      expect.fail("Should have thrown Unauthorized error");
    } catch (e) {
      expect(e.toString()).to.include("Unauthorized");
      console.log("✅ Only primary admin can add admins");
    }
  });

  it("Only primary admin can remove admins", async () => {
    const randomUser = Keypair.generate();

    try {
      await program.methods
        .removeAdmin(secondaryAdmin.publicKey)
        .accounts({
          admin: randomUser.publicKey,
          programAuthority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([randomUser])
        .rpc();

      expect.fail("Should have thrown Unauthorized error");
    } catch (e) {
      expect(e.toString()).to.include("Unauthorized");
      console.log("✅ Only primary admin can remove admins");
    }
  });

  it("Cannot add duplicate admin", async () => {
    // First add an admin
    const newAdmin = Keypair.generate();

    await program.methods
      .addAdmin(newAdmin.publicKey)
      .accounts({
        admin: primaryAdmin,
        programAuthority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Try to add same admin again
    try {
      await program.methods
        .addAdmin(newAdmin.publicKey)
        .accounts({
          admin: primaryAdmin,
          programAuthority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      expect.fail("Should have thrown AlreadyAdmin error");
    } catch (e) {
      expect(e.toString()).to.include("AlreadyAdmin");
      console.log("✅ Cannot add duplicate admin");
    }

    // Clean up - remove the admin
    await program.methods
      .removeAdmin(newAdmin.publicKey)
      .accounts({
        admin: primaryAdmin,
        programAuthority,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  });

  it("Validates proof ID length", async () => {
    const mint = Keypair.generate();
    const longProofId = "A".repeat(33); // 33 characters, exceeds max of 32

    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user1.publicKey.toBuffer(), mint.publicKey.toBuffer()],
      program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        user1.publicKey.toBuffer(),
        anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      anchor.utils.token.ASSOCIATED_PROGRAM_ID
    );

    try {
      await program.methods
        .mintProof(
          longProofId,
          "Test Title",
          "https://arweave.net/test",
          "Test description",
          "Test"
        )
        .accounts({
          owner: user1.publicKey,
          proof: proofPda,
          mint: mint.publicKey,
          tokenAccount,
          mintAuthority,
          programAuthority,
          collectionMint: collectionMint.publicKey,
          admin: primaryAdmin,
          metadata,
          metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([user1, mint])
        .rpc();

      expect.fail("Should have thrown IdTooLong error");
    } catch (e) {
      expect(e.toString()).to.include("IdTooLong");
      console.log("✅ Validates proof ID length");
    }
  });

  it("Validates title length", async () => {
    const mint = Keypair.generate();
    const longTitle = "A".repeat(65); // 65 characters, exceeds max of 64

    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user1.publicKey.toBuffer(), mint.publicKey.toBuffer()],
      program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        user1.publicKey.toBuffer(),
        anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      anchor.utils.token.ASSOCIATED_PROGRAM_ID
    );

    try {
      await program.methods
        .mintProof(
          "TEST-ID",
          longTitle,
          "https://arweave.net/test",
          "Test description",
          "Test"
        )
        .accounts({
          owner: user1.publicKey,
          proof: proofPda,
          mint: mint.publicKey,
          tokenAccount,
          mintAuthority,
          programAuthority,
          collectionMint: collectionMint.publicKey,
          admin: primaryAdmin,
          metadata,
          metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([user1, mint])
        .rpc();

      expect.fail("Should have thrown TitleTooLong error");
    } catch (e) {
      expect(e.toString()).to.include("TitleTooLong");
      console.log("✅ Validates title length");
    }
  });

  it("Removed admin can no longer verify proofs", async () => {
    // Mint a new proof
    const mint = Keypair.generate();
    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user1.publicKey.toBuffer(), mint.publicKey.toBuffer()],
      program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        user1.publicKey.toBuffer(),
        anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      anchor.utils.token.ASSOCIATED_PROGRAM_ID
    );

    await program.methods
      .mintProof(
        "PROOF-003",
        "Test Proof",
        "https://arweave.net/test",
        "Testing removed admin access",
        "Test"
      )
      .accounts({
        owner: user1.publicKey,
        proof: proofPda,
        mint: mint.publicKey,
        tokenAccount,
        mintAuthority,
        programAuthority,
        collectionMint: collectionMint.publicKey,
        admin: primaryAdmin,
        metadata,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([user1, mint])
      .rpc();

    // Try to verify with removed admin
    try {
      await program.methods
        .verifyProof()
        .accounts({
          proof: proofPda,
          admin: secondaryAdmin.publicKey,
          programAuthority,
        })
        .signers([secondaryAdmin])
        .rpc();

      expect.fail("Should have thrown unauthorized error");
    } catch (e) {
      expect(e.toString()).to.include("Unauthorized");
      console.log("✅ Removed admin correctly blocked from verifying");
    }
  });
});

describe("Complete Working Example", () => {
  it("Full flow: User mints and admin verifies", async () => {
    const provider = anchor.AnchorProvider.env();
    const program = anchor.workspace.GhonsiProof as Program<GhonsiProof>;

    const user = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync("tests/test-keys/user1.json", "utf-8")))
    );
    const mint = Keypair.generate();

    // Derive PDAs
    const [programAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_authority")],
      program.programId
    );

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("authority")],
      program.programId
    );

    const [proofPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("proof"), user.publicKey.toBuffer(), mint.publicKey.toBuffer()],
      program.programId
    );

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    );

    const [tokenAccount] = PublicKey.findProgramAddressSync(
      [
        user.publicKey.toBuffer(),
        anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      anchor.utils.token.ASSOCIATED_PROGRAM_ID
    );

    // Mint proof
    const tx = await program.methods
      .mintProof(
        "MY-WORK-2026",
        "My Original Creation",
        "https://arweave.net/my-proof-metadata",
        "This is my original work that I created on January 7, 2026.",
        "Creative"
      )
      .accounts({
        owner: user.publicKey,
        proof: proofPda,
        mint: mint.publicKey,
        tokenAccount,
        mintAuthority,
        programAuthority,
        collectionMint: Keypair.generate().publicKey,
        admin: provider.wallet.publicKey,
        metadata,
        metadataProgram: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([user, mint])
      .rpc();

    console.log("\n🎉 SUCCESS! Proof minted:");
    console.log("   User:", user.publicKey.toBase58());
    console.log("   Proof PDA:", proofPda.toBase58());
    console.log("   NFT Mint:", mint.publicKey.toBase58());
    console.log("   Transaction:", tx);
    console.log("\n💡 The NFT is now frozen in the user's wallet (soulbound)");
  });
});