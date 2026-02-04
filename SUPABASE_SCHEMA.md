# Supabase Database Schema

This document contains the complete SQL schema for the Ghonsi Proof database. Execute these commands in your Supabase SQL Editor.

## Setup Instructions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste each section below
5. Execute each section one at a time

---

## 1. Enable UUID Extension

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 2. Users Table

```sql
-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster wallet lookups
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

---

## 3. Profiles Table

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  profession TEXT,
  location TEXT,
  social_links JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for faster user lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_is_public ON profiles(is_public);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Anyone can view public profiles" ON profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 4. Proofs Table

```sql
-- Proof types enum
CREATE TYPE proof_type AS ENUM (
  'certificates',
  'job_history',
  'skills',
  'milestones',
  'community'
);

-- Proof status enum
CREATE TYPE proof_status AS ENUM (
  'pending',
  'verified',
  'rejected'
);

-- Proofs table
CREATE TABLE proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  proof_type proof_type NOT NULL,
  proof_name TEXT NOT NULL,
  summary TEXT,
  reference_link TEXT,
  status proof_status DEFAULT 'pending',
  verifier_id UUID REFERENCES users(id),
  blockchain_tx TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Indexes for faster queries
CREATE INDEX idx_proofs_user_id ON proofs(user_id);
CREATE INDEX idx_proofs_status ON proofs(status);
CREATE INDEX idx_proofs_proof_type ON proofs(proof_type);
CREATE INDEX idx_proofs_created_at ON proofs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proofs
CREATE POLICY "Users can view their own proofs" ON proofs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view verified proofs of public profiles" ON proofs
  FOR SELECT USING (
    status = 'verified' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = proofs.user_id
      AND profiles.is_public = true
    )
  );

CREATE POLICY "Users can insert their own proofs" ON proofs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proofs" ON proofs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proofs" ON proofs
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 5. Files Table

```sql
-- File types enum
CREATE TYPE file_type AS ENUM ('reference', 'supporting');

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proof_id UUID REFERENCES proofs(id) ON DELETE CASCADE,
  file_type file_type NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster proof file lookups
CREATE INDEX idx_files_proof_id ON files(proof_id);

-- Enable Row Level Security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for files
CREATE POLICY "Users can view files of their own proofs" ON files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proofs
      WHERE proofs.id = files.proof_id
      AND proofs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view files of verified public proofs" ON files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proofs
      JOIN profiles ON profiles.user_id = proofs.user_id
      WHERE proofs.id = files.proof_id
      AND proofs.status = 'verified'
      AND profiles.is_public = true
    )
  );

CREATE POLICY "Users can insert files for their own proofs" ON files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM proofs
      WHERE proofs.id = files.proof_id
      AND proofs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from their own proofs" ON files
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM proofs
      WHERE proofs.id = files.proof_id
      AND proofs.user_id = auth.uid()
    )
  );
```

---

## 6. Verification Requests Table

```sql
-- Verification request status enum
CREATE TYPE verification_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

-- Verification requests table
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  proof_id UUID REFERENCES proofs(id) ON DELETE CASCADE,
  verifier_email TEXT NOT NULL,
  verifier_name TEXT,
  relationship TEXT,
  message TEXT,
  status verification_status DEFAULT 'pending',
  verifier_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_proof_id ON verification_requests(proof_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- Enable Row Level Security
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests for their proofs" ON verification_requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM proofs
      WHERE proofs.id = verification_requests.proof_id
      AND proofs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own verification requests" ON verification_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verification requests" ON verification_requests
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 7. Messages Table

```sql
-- Messages table for user notifications
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert messages for themselves" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 8. Storage Bucket for Proof Files

```sql
-- Create storage bucket for proof files
-- Note: Run this in the SQL Editor, then configure in Storage settings
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof-files', 'proof-files', true);

-- Storage policies
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'proof-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'proof-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view files in public proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'proof-files');

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'proof-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 8. Functions and Triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proofs_updated_at BEFORE UPDATE ON proofs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at BEFORE UPDATE ON verification_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 10. Initial Data (Optional)

```sql
-- Insert sample proof types documentation (optional)
-- You can create a separate table for proof type definitions if needed
```

---

## Verification Steps

After running all the SQL commands:

1. **Check Tables**: Go to Table Editor and verify all tables are created
2. **Check Indexes**: Go to Database → Indexes to see all indexes
3. **Check Storage**: Go to Storage and verify 'proof-files' bucket exists
4. **Test RLS**: Try inserting test data to ensure policies work correctly

---

## Database Diagram

```
users
├── id (PK)
├── wallet_address (UNIQUE)
├── email (UNIQUE)
└── timestamps

profiles
├── id (PK)
├── user_id (FK → users.id)
├── display_name
├── bio
├── social_links (JSONB)
└── is_public

proofs
├── id (PK)
├── user_id (FK → users.id)
├── proof_type (ENUM)
├── status (ENUM)
├── verifier_id (FK → users.id)
└── blockchain_tx

files
├── id (PK)
├── proof_id (FK → proofs.id)
├── file_type (ENUM)
├── file_url
└── file_path

verification_requests
├── id (PK)
├── user_id (FK → users.id)
├── proof_id (FK → proofs.id)
├── verifier_email
└── status (ENUM)
```

---

## Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data by default
- Public profiles and verified proofs are viewable by anyone
- File uploads are organized by user_id/proof_id in storage
- All timestamps use UTC (TIMESTAMPTZ)
- UUIDs are used for all primary keys

## Next Steps

After setting up the database:

1. Configure environment variables in Vercel
2. Test authentication flow
3. Test file upload to storage
4. Implement frontend integration
5. Test RLS policies thoroughly
