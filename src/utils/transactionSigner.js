import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

/**
 * Creates a transaction to transfer SOL to the treasury wallet
 * Uses devnet by default
 * @param {PublicKey} fromPublicKey - User's wallet public key
 * @param {number} amount - Amount in SOL (e.g., 0.01)
 * @param {string} toAddress - Treasury wallet address
 * @returns {Transaction} The unsigned transaction
 */
export const createTransferTransaction = async (
  fromPublicKey,
  amount,
  toAddress,
  connection
) => {
  try {
    console.log('[v0] Creating transfer transaction:', {
      from: fromPublicKey.toString(),
      to: toAddress,
      amount: `${amount} SOL`,
    });

    const toPublicKey = new PublicKey(toAddress);
    const lamports = amount * LAMPORTS_PER_SOL;

    // Create the transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports: Math.floor(lamports),
    });

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();

    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromPublicKey,
    });

    transaction.add(instruction);

    console.log('[v0] Transaction created successfully');
    return transaction;
  } catch (error) {
    console.error('[v0] Error creating transfer transaction:', error);
    throw error;
  }
};

/**
 * Validates a Solana wallet address
 * @param {string} address - The wallet address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets the transaction size in bytes (approximate)
 * @param {Transaction} transaction - The transaction to measure
 * @returns {number} Size in bytes
 */
export const getTransactionSize = (transaction) => {
  return transaction.serialize().length;
};

/**
 * Estimates the transaction fee based on recent fees
 * @param {Connection} connection - Solana connection
 * @param {Transaction} transaction - The transaction
 * @returns {Promise<number>} Fee in lamports
 */
export const estimateTransactionFee = async (connection, transaction) => {
  try {
    const feeCalculator = await connection.getRecentBlockhash();
    // Default fee per byte is 0.00001 lamports but can vary
    const baseFee = feeCalculator.feeCalculator?.lamportsPerSignature || 5000;
    return baseFee;
  } catch (error) {
    console.error('[v0] Error estimating fee:', error);
    return 5000; // Default fallback
  }
};

/**
 * Formats lamports to SOL with decimals
 * @param {number} lamports - Amount in lamports
 * @returns {string} Formatted SOL amount
 */
export const formatLamportsToSol = (lamports) => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(9);
};
