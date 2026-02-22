# Ghonsi Proof Setup Guide

## Quick Start

### 1. Database Setup (Critical)

You MUST run the database migration before using the app:

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Create a new query
3. Copy the contents of `scripts/database-setup.sql`
4. Paste into the SQL editor
5. Click "Run" to execute

This script:
- Adds required columns to the users table
- Enables Row Level Security (RLS)
- Creates RLS policies for wallet and email authentication
- Creates indices for performance
- Sets up automatic timestamp triggers

### 2. Environment Variables

Create a `.env.local` file in the project root with:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project settings.

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Start Development Server

```bash
npm start
# or
yarn start
# or
pnpm start
```

The app will start on http://localhost:3000

## Features Overview

### Authentication Methods
- **Wallet Connect**: Connect Solana wallet via Phantom, Backpack, etc.
- **Email + OTP**: Sign in with email and 6-digit code
- **Account Linking**: Link wallet to email account or vice versa

### User Flows

#### First Time Wallet User
1. Click "Wallet Connect" tab
2. Connect your wallet
3. Fill in profile (name, optional avatar)
4. Optionally add email with OTP
5. Redirected to portfolio

#### Email User Adding Wallet
1. Sign in with email
2. Go to Portfolio → Account Settings
3. Click "Bind Wallet to Account"
4. Enter wallet address
5. Wallet is now linked

#### Wallet User Adding Email
1. Sign in with wallet
2. Go to Portfolio → Account Settings
3. Click "Add Email to Account"
4. Enter email, verify OTP
5. Email is now linked

## Configuration

### Solana Wallet Adapter
- Phantom: Recommended for desktop and mobile
- Backpack: Good desktop alternative
- Glow: Mobile-first wallet
- Solflare: Web-based wallet

All are automatically supported via WalletMultiButton component.

### Email Verification
- OTP sent via Supabase Auth
- Valid for 10 minutes
- 6-digit numeric code

### Animation Timing
- Menu slide: 300ms
- Dropdown: 250ms
- Easing: ease-in-out

## Troubleshooting

### Database RLS Error
**Error**: "new row violates row-level security policy"

**Solution**: Run `scripts/database-setup.sql` in Supabase SQL Editor

### Wallet Not Connecting
- Ensure wallet extension is installed
- Try refreshing the page
- Check wallet is on Solana mainnet
- Try a different wallet

### OTP Not Received
- Check spam folder
- Verify email address is correct
- Wait a few seconds
- Try sending again

### User Not Found After Signup
- Wait a moment for database sync
- Clear browser cache
- Check browser console for errors

## Development Tips

### Console Logging
The app uses `console.log("[v0] ...")` for debugging:
```javascript
console.log("[v0] User logged in:", user);
console.log("[v0] Wallet connected:", address);
```

### Testing New Features
1. Create test user with email
2. Bind test wallet to it
3. Sign out and try both auth methods
4. Verify all redirects work correctly

### CSS Animations
Header menu animations are in `src/components/header/header.css`:
- `.menu-enter`: Slide in from left
- `.menu-exit`: Slide out to left
- `.dropdown-enter`: Slide down
- `.dropdown-exit`: Slide up

## File Structure

```
src/
├── components/
│   ├── WalletOnboardingModal.jsx    (New wallet signup)
│   ├── AccountSettings.jsx            (Account linking)
│   └── header/
│       ├── header.jsx
│       └── header.css                 (Animations added)
├── pages/
│   ├── login/
│   │   └── login.jsx                 (Back button, onboarding modal)
│   └── portfolio/
│       └── portfolio.jsx              (Add AccountSettings component)
└── utils/
    ├── walletEmailLinking.js          (New linking functions)
    └── supabaseAuth.js                (Existing auth)

scripts/
└── database-setup.sql                 (RLS and schema fixes)
```

## Next Steps

1. Run database setup
2. Add AccountSettings to portfolio page
3. Test all auth flows
4. Customize branding/colors as needed
5. Deploy to production

## Support

For detailed feature documentation, see `WALLET_EMAIL_LINKING.md`

For wallet setup details, see `WALLET_SETUP.md`

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Framer Motion](https://www.framer.com/motion/) (for animations)
- [React Router](https://reactrouter.com/)
