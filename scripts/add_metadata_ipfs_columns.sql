-- Add metadata IPFS columns to proofs table
ALTER TABLE proofs 
ADD COLUMN IF NOT EXISTS metadata_ipfs_hash TEXT,
ADD COLUMN IF NOT EXISTS metadata_ipfs_url TEXT;
