/**
 * Blockchain Submission API
 * Handles submission of proofs to the Solana blockchain
 */

import { supabase } from '../config/supabaseClient';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Submit proof to blockchain via backend
 * This calls a backend endpoint that executes the submit-proof script
 * @param {Object} proofData - Proof information to submit
 * @param {string} proofData.proofId - Unique proof ID
 * @param {string} proofData.title - Proof title
 * @param {string} proofData.description - Proof description
 * @param {string} proofData.proofType - Type of proof
 * @param {string} proofData.ipfsUri - IPFS URI for metadata
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} Transaction result with hash, PDA, mint, URI
 */
export const submitProofToBlockchain = async (proofData, walletAddress) => {
  try {
    console.log('[v0] Submitting proof to blockchain:', proofData.proofId);

    // Prepare submission data
    const submissionData = {
      proofId: proofData.proofId,
      title: proofData.title,
      description: proofData.description,
      proofType: proofData.proofType,
      ipfsUri: proofData.ipfsUri,
      walletAddress: walletAddress,
      timestamp: new Date().toISOString(),
    };

    // Call backend API to submit to blockchain
    const response = await fetch('/api/submit-proof', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit proof to blockchain');
    }

    const result = await response.json();
    console.log('[v0] Blockchain submission successful:', result);

    return result;
  } catch (error) {
    console.error('[v0] Blockchain submission error:', error);
    throw error;
  }
};

/**
 * Update proof with blockchain transaction data
 * @param {string} proofId - Proof database ID
 * @param {Object} blockchainData - Data from blockchain submission
 */
export const updateProofWithBlockchainData = async (proofId, blockchainData) => {
  try {
    const { data, error } = await supabase
      .from('proofs')
      .update({
        transaction_hash: blockchainData.tx,
        proof_pda: blockchainData.proofPda,
        nft_mint: blockchainData.mint,
        status: 'submitted_onchain',
        updated_at: new Date().toISOString(),
      })
      .eq('id', proofId)
      .select()
      .single();

    if (error) throw error;
    console.log('[v0] Proof updated with blockchain data:', proofId);
    return data;
  } catch (error) {
    console.error('[v0] Error updating proof with blockchain data:', error);
    throw error;
  }
};

/**
 * Get proof status including blockchain verification
 * @param {string} proofId - Proof database ID
 * @returns {Promise<Object>} Proof with blockchain status
 */
export const getProofBlockchainStatus = async (proofId) => {
  try {
    const { data, error } = await supabase
      .from('proofs')
      .select('id, proof_name, transaction_hash, proof_pda, nft_mint, status, created_at')
      .eq('id', proofId)
      .single();

    if (error) throw error;

    return {
      ...data,
      isSubmittedOnchain: !!data.transaction_hash,
      transactionLink: data.transaction_hash 
        ? `https://explorer.solana.com/tx/${data.transaction_hash}?cluster=devnet`
        : null,
      pdaLink: data.proof_pda
        ? `https://explorer.solana.com/address/${data.proof_pda}?cluster=devnet`
        : null,
    };
  } catch (error) {
    console.error('[v0] Error fetching proof blockchain status:', error);
    throw error;
  }
};

/**
 * Check wallet balance before submission
 * @param {PublicKey} publicKey - Wallet public key
 * @param {Connection} connection - Solana connection
 * @returns {Promise<number>} Balance in SOL
 */
export const checkWalletBalance = async (publicKey, connection) => {
  try {
    const balance = await connection.getBalance(publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log('[v0] Wallet balance:', balanceInSol, 'SOL');
    return balanceInSol;
  } catch (error) {
    console.error('[v0] Error checking wallet balance:', error);
    throw error;
  }
};

/**
 * Verify blockchain transaction
 * @param {string} txHash - Transaction hash to verify
 * @param {Connection} connection - Solana connection
 * @returns {Promise<boolean>} Whether transaction was confirmed
 */
export const verifyBlockchainTransaction = async (txHash, connection) => {
  try {
    const signature = txHash;
    const status = await connection.getSignatureStatus(signature);
    
    if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
      console.log('[v0] Transaction verified as confirmed');
      return true;
    }
    
    console.log('[v0] Transaction status:', status.value?.confirmationStatus);
    return false;
  } catch (error) {
    console.error('[v0] Error verifying transaction:', error);
    throw error;
  }
};
