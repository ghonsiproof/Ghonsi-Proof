# Quick Fixes for "C is not a function" Error

## Immediate Actions (Try First)

### 1. Clear Cache & Refresh
```bash
# Clear browser cache:
# Chrome/Edge: Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)
# Firefox: Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)

# Then hard refresh:
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### 2. Check Environment Variables
```bash
# Make sure .env has:
echo "REACT_APP_PINATA_JWT should be set"
echo "REACT_APP_TREASURY_WALLET should be set"

# Restart dev server after adding/changing .env
npm start
```

### 3. Verify All Exports Exist
```bash
# Check if these files have proper exports:
grep -n "export const uploadProof" src/utils/proofsApi.js
grep -n "export const submitProofToBlockchain" src/utils/blockchainSubmission.js
grep -n "export const uploadDocumentWithMetadata" src/utils/pinataUpload.js
```

---

## Browser Console Tests

Copy and paste these in browser DevTools Console:

### Test 1: Check if Pinata JWT is configured
```javascript
console.log('Pinata JWT set:', process.env.REACT_APP_PINATA_JWT ? 'YES' : 'NO');
```

### Test 2: Check localStorage wallet session
```javascript
console.log('Wallet session:', {
  wallet: localStorage.getItem('wallet_address'),
  userId: localStorage.getItem('user_id')
});
```

### Test 3: Verify function imports work
```javascript
// This tests if the module can be dynamically imported
import('./utils/proofsApi.js').then(m => {
  console.log('uploadProof type:', typeof m.uploadProof);
}).catch(e => console.error('Import failed:', e));
```

---

## Most Common Causes & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "C is not a function" on submit | Missing Pinata JWT | Add `REACT_APP_PINATA_JWT` to .env, restart server |
| "C is not a function" on submit | Wallet not connected | Connect wallet first, ensure localStorage has data |
| "C is not a function" on submit | User not authenticated | Call `getCurrentUser()` returns null, login first |
| "C is not a function" on submit | Circular dependency | Check imports in proofsApi.js, blockchainSubmission.js |
| Upload fails silently | Pinata API key invalid | Generate new JWT from https://dashboard.pinata.cloud |

---

## What to Check if Error Persists

### File: `src/utils/proofsApi.js`
```javascript
// Line 12-15: Should look like this
export const uploadProof = async (
  proofData,
  referenceFiles = [],
  supportingFiles = []
) => {
  // ... implementation
}
```

### File: `src/utils/blockchainSubmission.js`
```javascript
// Line 21: Should look like this
export const submitProofToBlockchain = async (proofData, walletAddress) => {
  // ... implementation
}
```

### File: `src/utils/pinataUpload.js`
```javascript
// Should have these exports:
export const uploadToPinata = async (...) => { ... }
export const uploadDocumentWithMetadata = async (...) => { ... }
export const retrieveFromPinata = async (...) => { ... }
```

---

## If All Else Fails

1. **Reset Local Storage:**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

2. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

3. **Check for syntax errors:**
   ```bash
   npm run build  # This will show all build errors
   ```

4. **Look for red X in Network tab:**
   - Open DevTools > Network
   - Filter by "js"
   - Look for any 404 or failed requests
   - Check if imports are actually loading

---

## New Features Added

✅ **Progress Bar** - Shows upload speed and percentage
✅ **Toast Notifications** - Top-right notifications instead of alerts
✅ **Auto-scroll** - Scrolls to top when error occurs
✅ **Form Persistence** - Saves form progress automatically

All errors now show as beautiful toast notifications with proper error types!
