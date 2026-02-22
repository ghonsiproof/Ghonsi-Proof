# Wallet-Email Account Linking Feature

## Overview

Ghonsi Proof now supports bidirectional wallet-email account linking, allowing users to:
- Sign up with a wallet and later add an email
- Sign up with an email and later bind a wallet
- Seamlessly authenticate using either method

## Key Features

### 1. Wallet Signup Onboarding
When a new user connects a wallet for the first time:
1. A modal appears asking for basic profile info (name, optional avatar)
2. User can optionally add an email with OTP verification
3. Profile is created and user is authenticated
4. User is redirected to the home page

**File**: `src/components/WalletOnboardingModal.jsx`

### 2. Email User Binding Wallet
Email-authenticated users can bind a wallet from their portfolio account settings:
1. Navigate to Portfolio → Account Settings
2. Click "Bind Wallet to Account"
3. Enter their Solana wallet address
4. Wallet is linked and both auth methods are now available

**File**: `src/components/AccountSettings.jsx`

### 3. Wallet User Adding Email
Wallet-authenticated users can add an email from their portfolio account settings:
1. Navigate to Portfolio → Account Settings
2. Click "Add Email to Account"
3. Enter email and verify with OTP
4. Email is linked and both auth methods are now available

**File**: `src/components/AccountSettings.jsx`

### 4. Enhanced Login Page
- Back button for better navigation
- Wallet connect tab with onboarding for new users
- Email login tab with OTP verification
- Smooth animations and consistent styling

**File**: `src/pages/login/login.jsx`

### 5. Header Navigation Animations
Menu opening/closing now includes smooth slide animations:
- Menu slide-in animation: 300ms
- Dropdown slide-in animation: 250ms
- Smooth transforms and opacity transitions

**Files**: 
- `src/components/header/header.jsx`
- `src/components/header/header.css`

## New Files Created

### Utilities
- `src/utils/walletEmailLinking.js` - Core linking functions:
  - `linkWalletToEmail()` - Link wallet to email user
  - `linkEmailToWallet()` - Link email to wallet user
  - `createWalletOnboardingUser()` - Create new wallet user with profile
  - `updateUserProfile()` - Update user profile data
  - `getUserByWalletAddress()` - Lookup user by wallet
  - `getUserByEmail()` - Lookup user by email

### Components
- `src/components/WalletOnboardingModal.jsx` - New wallet signup flow
- `src/components/AccountSettings.jsx` - Account linking management

### Database
- `scripts/database-setup.sql` - Database schema and RLS policies

## Database Setup

### Required Columns in `users` Table

```sql
- id: UUID (primary key)
- email: TEXT (optional, nullable)
- wallet_address: TEXT (optional, unique, nullable)
- wallet_type: TEXT (default: 'solana')
- name: TEXT (optional, nullable)
- avatar: TEXT (optional, nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### RLS Policies

Run `scripts/database-setup.sql` in your Supabase SQL editor to:
1. Add missing columns
2. Enable RLS on users table
3. Create appropriate policies for wallet and email auth
4. Create indices for fast lookups
5. Set up automatic `updated_at` timestamp

Key policies:
- Allow anonymous users to insert with wallet_address
- Allow users to read/update their own data
- Support both authenticated (email) and unauthenticated (wallet) access

## Authentication Flows

### Wallet User Signup (New)
```
1. User connects wallet
2. Check if wallet exists in database
3. IF new: Show onboarding modal
   - Collect name and optional avatar
   - Optionally collect and verify email
   - Create user profile
   ELSE: Proceed to wallet signature
4. User signs message
5. User authenticated and redirected home
```

### Wallet User Linking Email
```
1. Email-authenticated user navigates to Account Settings
2. Clicks "Add Email to Account"
3. Enters email address
4. System sends OTP to email
5. User enters OTP
6. Email is linked to existing wallet account
7. User can now authenticate with either method
```

### Email User Binding Wallet
```
1. Wallet-authenticated user navigates to Account Settings
2. Clicks "Bind Wallet to Account"
3. Enters wallet address
4. Wallet is linked to existing email account
5. User can now authenticate with either method
```

## Usage Examples

### Check if User Exists by Wallet
```javascript
import { getUserByWalletAddress } from '@/utils/walletEmailLinking';

const user = await getUserByWalletAddress('SOL...address...');
if (!user) {
  // New wallet user - show onboarding
}
```

### Link Wallet to Email User
```javascript
import { linkWalletToEmail } from '@/utils/walletEmailLinking';

await linkWalletToEmail(userId, walletAddress, 'solana');
```

### Link Email to Wallet User
```javascript
import { linkEmailToWallet } from '@/utils/walletEmailLinking';

await linkEmailToWallet(userId, emailAddress);
```

### Create Wallet User with Onboarding Data
```javascript
import { createWalletOnboardingUser } from '@/utils/walletEmailLinking';

const result = await createWalletOnboardingUser(
  walletAddress,
  'solana',
  {
    name: 'John Doe',
    avatar: 'https://...',
    email: 'john@example.com'
  }
);
```

## Components Integration

### AccountSettings Component
Should be integrated into the Portfolio page to show current auth methods and provide linking options.

```jsx
import AccountSettings from '@/components/AccountSettings';

<AccountSettings 
  user={currentUser}
  onUpdate={refreshUserData}
/>
```

### WalletOnboardingModal Component
Automatically shown in Login page for new wallet users, but can be used elsewhere if needed.

```jsx
import WalletOnboardingModal from '@/components/WalletOnboardingModal';

{showOnboarding && (
  <WalletOnboardingModal
    walletAddress={address}
    walletType="solana"
    onComplete={handleSuccess}
    onClose={handleCancel}
  />
)}
```

## Security Considerations

1. **Wallet Address Uniqueness**: Wallet addresses must be unique across users
2. **Email Verification**: Emails must be verified via OTP before linking
3. **RLS Policies**: Database enforces row-level security for all operations
4. **Message Signing**: Wallets must sign a message to prove ownership
5. **OTP Expiry**: OTP codes expire after 10 minutes

## Error Handling

All linking functions include error handling with descriptive messages:
- Invalid wallet address format
- Email already associated with another account
- OTP verification failures
- Database constraint violations

## Testing

### Test Wallet Signup
1. Go to `/login` with mode=wallet
2. Connect a new wallet (first time)
3. Should see onboarding modal
4. Fill in name and optional email
5. Should be redirected to home authenticated

### Test Email User Binding Wallet
1. Log in with email
2. Go to Portfolio → Account Settings
3. See "Bind Wallet" button
4. Enter wallet address
5. Wallet should appear as linked

### Test Wallet User Adding Email
1. Log in with wallet
2. Go to Portfolio → Account Settings
3. See "Add Email" button
4. Enter email and verify OTP
5. Email should appear as linked

## Future Enhancements

- Multiple wallets per account
- Social recovery with friends
- Hardware wallet support
- Biometric authentication
- Account verification badges

## Support

For issues or questions about wallet-email linking:
1. Check `scripts/database-setup.sql` for database configuration
2. Review `WALLET_SETUP.md` for wallet adapter details
3. Ensure RLS policies are properly configured
4. Check browser console for detailed error messages
