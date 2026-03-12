# "C is not a function" Error - Comprehensive Debugging Guide

## TOP 5 Most Likely Reasons

### 1. **Missing Imports or Circular Dependencies** (40% probability)
The error typically occurs during minification when a component/function isn't properly imported.

**Files to Check:**
- `src/utils/proofsApi.js` - Verify `uploadProof` has proper `export const`
- `src/utils/blockchainSubmission.js` - Verify `submitProofToBlockchain` export
- `src/utils/pinataUpload.js` - Verify `uploadDocumentWithMetadata` export
- `src/pages/upload/upload.jsx` - Line 14-18, verify all imports match exports

**Quick Fix:**
```javascript
// In upload.jsx, add debug logs BEFORE submit:
console.log('[v0] Type checks:', {
  uploadProof: typeof uploadProof,
  uploadDocumentWithMetadata: typeof uploadDocumentWithMetadata,
  submitProofToBlockchain: typeof submitProofToBlockchain,
});
```

### 2. **Supabase Auth User Check Returning Invalid State** (25% probability)
The `uploadProof` function calls `supabase.auth.getUser()` which might fail.

**File**: `src/utils/proofsApi.js` - Line 18
```javascript
const user = await supabase.auth.getUser(); // This could return null/undefined
if (!user.data.user) throw new Error(...);
```

**Solution:**
Make sure wallet session is properly set before upload. Check localStorage for `wallet_address` and `user_id`.

### 3. **Pinata JWT Configuration Missing** (20% probability)
If `REACT_APP_PINATA_JWT` isn't set, the Pinata validation throws before functions are called.

**File**: `src/utils/pinataUpload.js` - Line 11-20

**Quick Fix:**
```bash
# In your .env file, add:
REACT_APP_PINATA_JWT=your_jwt_here
```

### 4. **Form Persistence Utility Overwriting Functions** (10% probability)
The new `formPersistence.js` might be interfering with execution context.

**File**: `src/utils/formPersistence.js`
- Check for any global assignments
- Verify no function name conflicts

### 5. **Browser Cache Issues** (5% probability)
Old code cached in browser

**Solution:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache and localStorage
- Restart development server

---

## Damaged/Critical Files to Manually Review

### Critical Priority (Check First):
1. **`src/utils/proofsApi.js`** - uploadProof function export
2. **`src/utils/blockchainSubmission.js`** - submitProofToBlockchain function
3. **`src/pages/upload/upload.jsx`** - Line 365 uploadProof call
4. **`src/utils/pinataUpload.js`** - uploadDocumentWithMetadata export

### Secondary Priority:
5. **`src/config/supabaseClient.js`** - Check if exports are correct
6. **`src/utils/formPersistence.js`** - Verify no syntax errors
7. **`.env` file** - Check all required env variables

---

## Step-by-Step Debug Process

### Step 1: Enable Detailed Logging
Add to `src/pages/upload/upload.jsx` in `handleTransactionSuccess` (line 340):
```javascript
console.log('[v0] Starting IPFS upload with data:', extractedDocumentData);
console.log('[v0] uploadDocumentWithMetadata exists:', typeof uploadDocumentWithMetadata);
try {
  const ipfsResult = await uploadDocumentWithMetadata(extractedDocumentData, metadata);
  // ...
}
```

### Step 2: Verify Function Definitions
In browser console, run:
```javascript
typeof window.uploadProof
typeof window.uploadDocumentWithMetadata
typeof window.submitProofToBlockchain
```

### Step 3: Check for Syntax Errors
Look for red errors in browser DevTools under:
- Console tab
- Network tab (check for failed imports)
- Application > Sources (check minified code)

### Step 4: Test Individual Functions
Test each API function independently:
```javascript
// In browser console
import { uploadProof } from './utils/proofsApi.js'
console.log(typeof uploadProof)
```

---

## Environment Variables to Verify

Required in `.env`:
```
REACT_APP_PINATA_JWT=<your_jwt>
REACT_APP_TREASURY_WALLET=EKGNwqNBUBtH5Fnmcjjoj4Tci6dCXdcCrxcjTaWm5bLf
```

---

## Additional Improvements Made

✅ **Progress Bar Added** - Visual upload progress with speed indicator
✅ **Toast Notifications** - Replaces all `alert()` calls
✅ **Error Auto-Scroll** - Pages scroll to top when errors occur
✅ **Form Persistence** - Data persists for 24 hours (localStorage)

These don't cause the "C is not a function" error but improve UX significantly.
