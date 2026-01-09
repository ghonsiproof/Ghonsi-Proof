# Migration Guide: localStorage → Supabase

This guide helps you migrate existing components from localStorage to Supabase authentication and database.

## Overview

### What's Changing

**Before (localStorage):**
```javascript
localStorage.setItem('userLoggedIn', 'true');
localStorage.getItem('userEmail');
```

**After (Supabase):**
```javascript
await signInWithEmail(email, password);
const user = await getCurrentUser();
```

---

## Step-by-Step Migration

### 1. Login Page Migration

**File**: `src/pages/login/login.jsx`

#### Current Code (lines 24-28, 32-46):
```javascript
const handleWalletConnect = (walletName) => {
  console.log('Connected with:', walletName);
  localStorage.setItem('userLoggedIn', 'true');
  localStorage.setItem('userWallet', walletName);
  navigate('/home');
};

const handleEmailSignIn = (e) => {
  e.preventDefault();
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    alert('Please enter your email address');
    return;
  }
  if (!validateEmail(trimmedEmail)) {
    alert('Please enter a valid email address');
    return;
  }
  
  localStorage.setItem('userLoggedIn', 'true');
  localStorage.setItem('userEmail', trimmedEmail);
  navigate('/dashboard');
};
```

#### New Code:
```javascript
import { signInWithMagicLink, signInWithWallet } from '../../utils/supabaseAuth';
import { useState } from 'react';

// Add loading state
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleWalletConnect = async (walletName) => {
  setLoading(true);
  setError('');
  
  try {
    // TODO: Get actual wallet signature
    // For now, just simulate wallet connection
    console.log('Connecting wallet:', walletName);
    
    // This will be replaced with actual Solana wallet adapter
    const walletAddress = 'temp-wallet-address'; // Replace with real address
    await signInWithWallet(walletAddress, null, null);
    
    navigate('/home');
  } catch (err) {
    console.error('Wallet connection error:', err);
    setError('Failed to connect wallet. Please try again.');
  } finally {
    setLoading(false);
  }
};

const handleEmailSignIn = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    setError('Please enter your email address');
    setLoading(false);
    return;
  }
  if (!validateEmail(trimmedEmail)) {
    setError('Please enter a valid email address');
    setLoading(false);
    return;
  }
  
  try {
    await signInWithMagicLink(trimmedEmail);
    alert('Check your email for a magic link to sign in!');
    // Don't navigate yet - wait for email confirmation
  } catch (err) {
    console.error('Email sign-in error:', err);
    setError('Failed to send magic link. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

#### Add UI for Loading/Error:
```jsx
{error && (
  <div className="text-red-500 text-sm mb-3 bg-red-500/10 p-3 rounded-lg">
    {error}
  </div>
)}

<button 
  className="..." 
  onClick={handleEmailSignIn}
  disabled={loading}
>
  {loading ? 'Signing In...' : 'Sign In'}
</button>
```

---

### 2. Header Component Migration

**File**: `src/components/header/header.jsx`

#### Add Authentication Check:
```javascript
import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '../../utils/supabaseAuth';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    // Your existing JSX
    // Replace logout button onClick with handleLogout
  );
}
```

---

### 3. Dashboard Migration

**File**: `src/pages/dashboard/dashboard.jsx`

#### Add Real Data Fetching:
```javascript
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../utils/supabaseAuth';
import { getUserProofs, getProofStats } from '../../utils/proofsApi';
import { getProfile } from '../../utils/profileApi';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (!currentUser) {
        navigate('/login');
        return;
      }

      // Get user profile
      const userProfile = await getProfile(currentUser.id);
      setProfile(userProfile);

      // Get user proofs
      const userProofs = await getUserProofs(currentUser.id);
      setProofs(userProofs);

      // Get stats
      const proofStats = await getProofStats(currentUser.id);
      setStats(proofStats);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    // Use real data instead of mock data
    // stats.total instead of hardcoded 12
    // stats.verified instead of hardcoded 4
  );
}
```

---

### 4. Upload Page Migration

**File**: `src/pages/upload/upload.jsx`

#### Replace Form Submission:
```javascript
import { uploadProof } from '../../utils/proofsApi';
import { getCurrentUser } from '../../utils/supabaseAuth';

const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);
  setUploadError('');

  try {
    // Validate user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Validate form
    if (!proofType || !proofName || !summary) {
      setUploadError('Please fill in all required fields');
      setUploading(false);
      return;
    }

    if (referenceFiles.length === 0) {
      setUploadError('Please upload at least one reference file');
      setUploading(false);
      return;
    }

    // Upload proof
    const result = await uploadProof(
      {
        proofType,
        proofName,
        summary,
        referenceLink
      },
      referenceFiles,
      supportingFiles
    );

    // Show success
    setShowSubmittedModal(true);
    
    // Reset form
    setProofType('');
    setProofName('');
    setSummary('');
    setReferenceLink('');
    setReferenceFiles([]);
    setSupportingFiles([]);
    
  } catch (error) {
    console.error('Upload error:', error);
    setUploadError('Failed to upload proof. Please try again.');
  } finally {
    setUploading(false);
  }
};
```

---

### 5. Create Profile Migration

**File**: `src/pages/createProfile/createProfile.jsx`

#### Add Profile Management:
```javascript
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../../utils/supabaseAuth';
import { createProfile, getProfile, updateProfile } from '../../utils/profileApi';

function CreateProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    profession: '',
    location: '',
    is_public: false
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const existingProfile = await getProfile(currentUser.id);
      
      if (existingProfile) {
        setProfile(existingProfile);
        setFormData(existingProfile);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await updateProfile(user.id, formData);
        alert('Profile updated successfully!');
      } else {
        await createProfile(formData);
        alert('Profile created successfully!');
        setIsEditing(true);
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile save error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your form JSX
    // Change button text based on isEditing
    // {isEditing ? 'Update Profile' : 'Create Profile'}
  );
}
```

---

## Common Patterns

### Pattern 1: Check Authentication

**Old:**
```javascript
const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
```

**New:**
```javascript
import { isAuthenticated } from './utils/supabaseAuth';

const checkAuth = async () => {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    navigate('/login');
  }
};
```

### Pattern 2: Get User Info

**Old:**
```javascript
const email = localStorage.getItem('userEmail');
const wallet = localStorage.getItem('walletAddress');
```

**New:**
```javascript
import { getCurrentUser } from './utils/supabaseAuth';

const user = await getCurrentUser();
// user.email
// user.wallet_address
```

### Pattern 3: Logout

**Old:**
```javascript
localStorage.removeItem('userLoggedIn');
localStorage.removeItem('userEmail');
navigate('/login');
```

**New:**
```javascript
import { logout } from './utils/supabaseAuth';

await logout();
navigate('/login');
```

---

## Testing Your Migration

### Checklist

- [ ] Login with email works
- [ ] Magic link arrives in email
- [ ] Clicking magic link signs you in
- [ ] Dashboard shows user data
- [ ] Profile creation works
- [ ] Proof upload works
- [ ] Files appear in Supabase Storage
- [ ] Logout works correctly
- [ ] Protected routes redirect to login when not authenticated
- [ ] No localStorage auth code remains

### Debug Tips

1. **Check Browser Console** - Look for errors
2. **Check Network Tab** - See API calls
3. **Check Supabase Logs** - See backend errors
4. **Use React DevTools** - Check component state

---

## Migration Priority

### Do First (Critical)
1. ✅ Login page - email authentication
2. ✅ Header - check auth status, logout
3. ✅ Protected routes - redirect if not authenticated

### Do Second (Important)
4. ✅ Dashboard - fetch real proof data
5. ✅ Upload page - connect to Supabase
6. ✅ Create profile - connect to Supabase

### Do Third (Nice to Have)
7. Public profile page
8. Request verification page
9. Real-time updates

---

## Rollback Plan

If something goes wrong, you can temporarily keep both systems:

```javascript
// Hybrid approach (temporary)
const checkAuth = async () => {
  // Try Supabase first
  try {
    const user = await getCurrentUser();
    if (user) return true;
  } catch (error) {
    console.error('Supabase auth error:', error);
  }
  
  // Fall back to localStorage
  return localStorage.getItem('userLoggedIn') === 'true';
};
```

---

## Need Help?

- Review `DEPLOYMENT_GUIDE.md` for setup issues
- Review `SUPABASE_INTEGRATION.md` for API usage
- Check Supabase docs: https://supabase.com/docs
- Email: support@ghonsiproof.com

---

**Good luck with the migration! 🚀**
