-- Migration: Add IPFS and transaction tracking to proofs table
-- Purpose: Store IPFS hashes and transaction hashes for proof verification

-- Add new columns to proofs table if they don't exist
ALTER TABLE proofs ADD COLUMN IF NOT EXISTS ipfs_hash VARCHAR UNIQUE;
ALTER TABLE proofs ADD COLUMN IF NOT EXISTS ipfs_url VARCHAR;
ALTER TABLE proofs ADD COLUMN IF NOT EXISTS transaction_hash VARCHAR UNIQUE;

-- Add index for faster lookup
CREATE INDEX IF NOT EXISTS idx_proofs_ipfs_hash ON proofs(ipfs_hash);
CREATE INDEX IF NOT EXISTS idx_proofs_transaction_hash ON proofs(transaction_hash);

-- Migration: Create admin_approvals table
-- Purpose: Track admin approval workflow for proofs

CREATE TABLE IF NOT EXISTS admin_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proof_id UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_approvals_proof_id ON admin_approvals(proof_id);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_admin_id ON admin_approvals(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_status ON admin_approvals(status);

-- Migration: Create admin_settings table
-- Purpose: Store admin role and permissions for users

CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_super_admin BOOLEAN DEFAULT FALSE,
  admin_since TIMESTAMP,
  permissions JSONB DEFAULT '{"approve_proofs": false, "manage_admins": false, "view_analytics": false}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_is_admin ON admin_settings(is_admin);
CREATE INDEX IF NOT EXISTS idx_admin_settings_user_id ON admin_settings(user_id);

-- Migration: Enhance user_wallets table if needed
-- Purpose: Better wallet management

ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS wallet_name VARCHAR DEFAULT 'Connected Wallet';
ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;
ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;
ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_user_wallets_is_primary ON user_wallets(user_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_user_wallets_wallet_address ON user_wallets(wallet_address);

-- Migration: Create proof_history table for audit trail
-- Purpose: Track all changes to proofs for auditing

CREATE TABLE IF NOT EXISTS proof_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proof_id UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
  action VARCHAR NOT NULL CHECK (action IN ('created', 'updated', 'approved', 'rejected', 'verified', 'deleted')),
  changed_by UUID REFERENCES users(id),
  changes JSONB, -- Track what changed (old values vs new values)
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_proof_history_proof_id ON proof_history(proof_id);
CREATE INDEX IF NOT EXISTS idx_proof_history_action ON proof_history(action);
CREATE INDEX IF NOT EXISTS idx_proof_history_created_at ON proof_history(created_at);

-- Enable RLS on new tables
ALTER TABLE admin_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_approvals
-- Admins can view all approvals, users can only view their own proof approvals
CREATE POLICY "Admins can view all approvals" 
  ON admin_approvals FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_settings 
      WHERE admin_settings.user_id = auth.uid() 
      AND admin_settings.is_admin = TRUE
    )
  );

CREATE POLICY "Users can view approvals for their proofs" 
  ON admin_approvals FOR SELECT 
  USING (
    proof_id IN (
      SELECT id FROM proofs WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for admin_settings
-- Users can only view their own admin settings
CREATE POLICY "Users can view their own admin settings" 
  ON admin_settings FOR SELECT 
  USING (user_id = auth.uid());

-- Only super admins can create admin users
CREATE POLICY "Only super admins can manage admin settings" 
  ON admin_settings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM admin_settings 
      WHERE admin_settings.user_id = auth.uid() 
      AND admin_settings.is_super_admin = TRUE
    )
  );

-- RLS Policies for proof_history
-- Users can view history for their own proofs, admins can view all
CREATE POLICY "Users can view history for their proofs" 
  ON proof_history FOR SELECT 
  USING (
    proof_id IN (
      SELECT id FROM proofs WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM admin_settings 
      WHERE admin_settings.user_id = auth.uid() 
      AND admin_settings.is_admin = TRUE
    )
  );

-- Create system function to track proof changes
CREATE OR REPLACE FUNCTION track_proof_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO proof_history (proof_id, action, changed_by, changes)
  VALUES (
    NEW.id,
    CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END,
    auth.uid(),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for proof changes
DROP TRIGGER IF EXISTS proof_change_trigger ON proofs;
CREATE TRIGGER proof_change_trigger
AFTER INSERT OR UPDATE ON proofs
FOR EACH ROW
EXECUTE FUNCTION track_proof_change();

-- Commit message: Added IPFS, transaction tracking, admin approval system, and audit trail
