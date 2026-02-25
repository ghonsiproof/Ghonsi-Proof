const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase with SERVICE ROLE key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ghonsi Proof Messages API' });
});

// ─────────────────────────────────────────────
// BLOCKCHAIN: Submit proof to Solana
// ─────────────────────────────────────────────
app.post('/api/submit-proof', async (req, res) => {
  try {
    const { proofId, title, description, proofType, ipfsUri, walletAddress } = req.body;

    if (!proofId || !title || !description || !proofType || !ipfsUri || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('[server] Submitting proof to blockchain:', proofId);

    // Load the backend wallet keypair (this pays for the transaction)
    const privateKeyEnv = process.env.SOLANA_BACKEND_PRIVATE_KEY;
    if (!privateKeyEnv) {
      throw new Error('SOLANA_BACKEND_PRIVATE_KEY not configured in environment');
    }

    const privateKeyArray = JSON.parse(privateKeyEnv);
    const backendKeypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));

    // Connect to Solana
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Load the IDL
    const idl = require('../ghonsi_proof/target/idl/ghonsi_proof.json');
    const programId = new PublicKey(process.env.PROGRAM_ID || idl.address);

    // Set up Anchor provider using backend keypair
    const provider = new anchor.AnchorProvider(
      connection,
      new anchor.Wallet(backendKeypair),
      { commitment: 'confirmed' }
    );
    anchor.setProvider(provider);

    const program = new anchor.Program(idl, provider);

    // Derive proof PDA
    const userPublicKey = new PublicKey(walletAddress);
    const [proofPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('proof'),
        userPublicKey.toBuffer(),
        Buffer.from(proofId),
      ],
      programId
    );

    console.log('[server] Proof PDA:', proofPda.toString());

    // Submit to blockchain
    const tx = await program.methods
      .submitProof(proofId, title, description, proofType, ipfsUri)
      .accounts({
        proof: proofPda,
        user: userPublicKey,
        payer: backendKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([backendKeypair])
      .rpc();

    console.log('[server] Blockchain tx successful:', tx);

    res.json({
      success: true,
      tx,
      proofPda: proofPda.toString(),
      mint: null, // populate if your program mints an NFT
    });
  } catch (error) {
    console.error('[server] Blockchain submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

// Send message
app.post('/api/messages', async (req, res) => {
  try {
    const { sender_id, receiver_id, portfolio_id, message, sender_name, sender_email, type } = req.body;

    if (!sender_id || !receiver_id || !portfolio_id || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id,
        receiver_id,
        portfolio_id,
        message,
        sender_name,
        sender_email,
        type,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a user
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
app.patch('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete message
app.delete('/api/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Respond to profile request
app.patch('/api/messages/:messageId/respond', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .update({ status, read: true })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error responding to request:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});