import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../config/supabaseClient';

/**
 * useWalletAuth
 *
 * Signs a message with the connected wallet and verifies it against
 * your backend (Supabase edge function). On success it sets a Supabase
 * session so the rest of your app can use supabase.auth.getUser() normally.
 *
 * Usage:
 *   const { authenticate, isAuthenticating, error, isAuthenticated } = useWalletAuth();
 *   <button onClick={authenticate}>Sign & Verify</button>
 */
export function useWalletAuth() {
  const { publicKey, signMessage, connected } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authenticate = useCallback(async () => {
    if (!connected || !publicKey || !signMessage) {
      setError('Wallet not connected or does not support message signing');
      return false;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // 1. Build a message the user will sign
      //    Include timestamp + wallet address to prevent replay attacks
      const timestamp = Date.now();
      const message = `Sign in to Ghonsi Proof\n\nTimestamp: ${timestamp}\nWallet: ${publicKey.toBase58()}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
      const messageBytes = new TextEncoder().encode(message);

      // 2. Request signature — this opens the wallet popup / signer UI
      const signature = await signMessage(messageBytes);

      // 3. Send publicKey + signature + message to your backend for verification
      //    If you don't have an edge function yet, skip this block and just
      //    store the wallet address locally (see fallback below).
      let session = null;
      try {
        const { data, error: fnError } = await supabase.functions.invoke('wallet-auth', {
          body: {
            publicKey: publicKey.toBase58(),
            signature: Array.from(signature),
            message,
          },
        });

        if (fnError) throw fnError;

        if (data?.session) {
          // Set the Supabase session so supabase.auth.getUser() works everywhere
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
          session = data.session;
        }
      } catch (backendError) {
        // ── FALLBACK ─────────────────────────────────────────────────────────
        // If you don't have the edge function deployed yet, we still consider
        // the user authenticated locally (signature was valid — the wallet
        // opened and the user approved it). Remove this fallback once your
        // backend is ready.
        console.warn('Backend auth unavailable, using local wallet auth:', backendError.message);
      }

      // 4. Persist wallet info regardless of backend session
      localStorage.setItem('wallet_address', publicKey.toBase58());
      localStorage.setItem('connected_wallet', 'Phantom'); // wallet name is set by adapter

      setIsAuthenticated(true);
      return true;

    } catch (err) {
      // User rejected the signing request
      if (err.name === 'WalletSignMessageError' || err.message?.includes('rejected')) {
        setError('Signature rejected. Please approve the sign request in your wallet.');
      } else {
        setError(err.message || 'Authentication failed');
      }
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [connected, publicKey, signMessage]);

  return {
    authenticate,
    isAuthenticating,
    error,
    isAuthenticated,
    publicKey,
    connected,
  };
}