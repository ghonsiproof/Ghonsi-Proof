/**
 * API Endpoint: Submit Proof to Blockchain
 * Handles the blockchain submission of verified proofs
 * 
 * Usage:
 * POST /api/submit-proof
 * Body: {
 *   proofId: string,
 *   title: string,
 *   description: string,
 *   proofType: string,
 *   ipfsUri: string,
 *   walletAddress: string
 * }
 */

import { execSync } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { proofId, title, description, proofType, ipfsUri, walletAddress } = req.body;

  // Validate required fields
  if (!proofId || !title || !description || !proofType || !ipfsUri || !walletAddress) {
    return res.status(400).json({
      error: 'Missing required fields: proofId, title, description, proofType, ipfsUri, walletAddress'
    });
  }

  try {
    console.log('[API] Submitting proof to blockchain:', proofId);

    // Get the submit-proof script path
    const scriptPath = path.join(process.cwd(), 'ghonsi_proof', 'submit-proof.ts');

    // Execute the submit-proof script with the proof data
    // This would normally run: npm run submit -- "proofId" "title" "description" "proofType"
    // But since the script expects to be run directly, we need to handle this carefully
    
    // For now, we'll mock the blockchain submission
    // In production, this would call the actual Anchor program
    const transactionHash = generateMockTransactionHash();
    const proofPda = generateMockPDA();
    const mint = generateMockMint();

    // Simulated blockchain submission result
    const result = {
      tx: transactionHash,
      proofPda: proofPda,
      mint: mint,
      uri: ipfsUri,
      status: 'submitted',
      timestamp: new Date().toISOString(),
    };

    console.log('[API] Blockchain submission result:', result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[API] Blockchain submission error:', error);
    return res.status(500).json({
      error: 'Failed to submit proof to blockchain',
      message: error.message
    });
  }
}

/**
 * Generate a mock transaction hash for development
 * In production, this would be the actual Solana transaction hash
 */
function generateMockTransactionHash() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hash = '';
  for (let i = 0; i < 88; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

/**
 * Generate a mock PDA (Program Derived Address)
 * In production, this would be the actual PDA from the blockchain
 */
function generateMockPDA() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pda = '';
  for (let i = 0; i < 44; i++) {
    pda += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pda;
}

/**
 * Generate a mock NFT mint address
 * In production, this would be the actual mint address from the transaction
 */
function generateMockMint() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let mint = '';
  for (let i = 0; i < 44; i++) {
    mint += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return mint;
}
