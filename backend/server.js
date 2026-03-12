const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ghonsi Proof API' });
});

// ─────────────────────────────────────────────
// BLOCKCHAIN: Submit proof to Solana
// Calls mint_proof instruction from the IDL
// ─────────────────────────────────────────────
app.post('/api/submit-proof', async (req, res) => {
  try {
    const { proofId, title, description, proofType, ipfsUri, walletAddress } = req.body;

    if (!proofId || !title || !description || !proofType || !ipfsUri || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate field lengths against program constraints
    if (proofId.length > 32) return res.status(400).json({ error: 'proofId max 32 characters' });
    if (title.length > 64) return res.status(400).json({ error: 'title max 64 characters' });
    if (ipfsUri.length > 200) return res.status(400).json({ error: 'ipfsUri max 200 characters' });
    if (description.length > 500) return res.status(400).json({ error: 'description max 500 characters' });

    console.log('[server] Minting proof NFT on blockchain:', proofId);

    // Load backend wallet
    const privateKeyEnv = process.env.SOLANA_BACKEND_PRIVATE_KEY;
    if (!privateKeyEnv) throw new Error('SOLANA_BACKEND_PRIVATE_KEY not configured');
    const backendKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKeyEnv)));

    // Connect to Solana
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Load IDL
    const idl = require('../ghonsi_proof/target/idl/ghonsi_proof.json');
    const programId = new PublicKey(process.env.PROGRAM_ID || idl.address);

    // Anchor provider — backend keypair is the payer/owner
    const provider = new anchor.AnchorProvider(
      connection,
      new anchor.Wallet(backendKeypair),
      { commitment: 'confirmed' }
    );
    anchor.setProvider(provider);
    const program = new anchor.Program(idl, provider);

    const ownerPublicKey = new PublicKey(walletAddress);

    // Generate a new mint keypair for the NFT
    const mintKeypair = Keypair.generate();

    // Derive PDAs matching the IDL seeds exactly
    // proof PDA seeds: ["proof", owner, mint]
    const [proofPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('proof'),
        ownerPublicKey.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      programId
    );

    // mint_authority PDA seeds: ["authority"]
    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('authority')],
      programId
    );

    // program_authority PDA seeds: ["program_authority"]
    const [programAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_authority')],
      programId
    );

    // Derive associated token account
    const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } = require('@solana/spl-token');
    const tokenAccount = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      ownerPublicKey
    );

    // Metadata account (Metaplex)
    const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    // You need a collection mint — if you don't have one yet use backendKeypair.publicKey as placeholder
    // Replace COLLECTION_MINT_ADDRESS in .env with your actual collection mint once initialized
    const collectionMint = process.env.COLLECTION_MINT_ADDRESS
      ? new PublicKey(process.env.COLLECTION_MINT_ADDRESS)
      : backendKeypair.publicKey;

    console.log('[server] Proof PDA:', proofPda.toString());
    console.log('[server] Mint:', mintKeypair.publicKey.toString());

    // Call mint_proof instruction
    const tx = await program.methods
      .mintProof(proofId, title, ipfsUri, description, proofType)
      .accounts({
        owner: ownerPublicKey,
        proof: proofPda,
        mint: mintKeypair.publicKey,
        tokenAccount: tokenAccount,
        mintAuthority: mintAuthorityPda,
        programAuthority: programAuthorityPda,
        collectionMint: collectionMint,
        admin: backendKeypair.publicKey,
        metadata: metadataPda,
        metadataProgram: METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([backendKeypair, mintKeypair])
      .rpc();

    console.log('[server] mint_proof tx successful:', tx);

    res.json({
      success: true,
      tx,
      proofPda: proofPda.toString(),
      mint: mintKeypair.publicKey.toString(),
    });
  } catch (error) {
    console.error('[server] Blockchain submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

app.post('/api/messages', async (req, res) => {
  try {
    const { sender_id, receiver_id, portfolio_id, message, sender_name, sender_email, type } = req.body;
    if (!sender_id || !receiver_id || !portfolio_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id, receiver_id, portfolio_id, message, sender_name, sender_email, type, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', req.params.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', req.params.messageId)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/messages/:messageId', async (req, res) => {
  try {
    const { error } = await supabase.from('messages').delete().eq('id', req.params.messageId);
    if (error) throw error;
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/messages/:messageId/respond', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ status: req.body.status, read: true })
      .eq('id', req.params.messageId)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});