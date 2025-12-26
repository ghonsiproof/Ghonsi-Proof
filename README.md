# Ghonsi Proof

**The On-Chain Trust Engine for the Web3 Workforc**

Ghonsi Proof is a decentralized platform built on Solana that transforms scattered professional contributions into a single verifiable on-chain identity. We help Web3 professionals prove their skills, authenticate their work, and showcase verified credentials..

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Environment Setup](#environment-setup)
- [Pages Overview](#pages-overview)
- [Components](#components)
- [Styling Architecture](#styling-architecture)
- [Authentication Flow](#authentication-flow)
- [API Integration Guide](#api-integration-guide)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

- **Wallet Authentication**: Connect with Phantom, Solflare, Backpack, and Glow wallets
- **Email Authentication**: Alternative login method for users without wallets
- **Proof Upload System**: Upload and verify certificates, work history, skills, milestones, and community contributions
- **On-Chain Verification**: All proofs are recorded on the Solana blockchain
- **Portfolio Management**: Create and manage your professional portfolio
- **Public Profiles**: Share your verified credentials with employers and communities
- **Proof Request System**: Request verification from peers and organizations
- **Responsive Design**: Fully responsive UI built with Tailwind CSS

---

## 🛠 Tech Stack

### Frontend
- **React** (v19.2.0) - UI library
- **React Router DOM** (v7.9.6) - Client-side routing
- **Tailwind CSS** (v3.4.18) - Utility-first CSS framework
- **Lucide React** (v0.555.0) - Icon library
- **FontAwesome** (v7.1.0) - Additional icons

### Backend & Database
- **Supabase** - PostgreSQL database, authentication, and file storage
- **Supabase Auth** - Email and wallet authentication
- **Supabase Storage** - Secure file uploads
- **Row Level Security (RLS)** - Database-level access control

### Build Tools
- **React Scripts** (v5.0.1) - Create React App build configuration
- **PostCSS** (v8.5.6) - CSS processing
- **Autoprefixer** (v10.4.22) - CSS vendor prefixing

### Testing
- **Jest** - Testing framework
- **React Testing Library** (v16.3.0) - Component testing

### Deployment
- **Vercel** - Frontend hosting and CI/CD
- **Supabase Cloud** - Backend as a Service (BaaS)

### Blockchain (Integration Ready)
- **Solana** - Blockchain platform
- **Wallet Adapters** - For wallet connections (to be integrated)

---

## 📁 Project Structure.

```
ghonsi-proof/
├── public/                      # Static files
├── src/
│   ├── assets/                  # Images, logos, icons
│   │   ├── ghonsi-proof-logos/  # Brand logos (PNG, SVG)
│   │   ├── team/                # Team member photos
│   │   └── wallet-icons/        # Wallet provider icons
│   ├── components/              # Reusable components
│   │   ├── header/              # Navigation header
│   │   └── footer/              # Footer component
│   ├── config/                  # Configuration files
│   │   └── supabaseClient.js    # Supabase client setup
│   ├── hooks/                   # Custom React hooks
│   │   └── useAuth.js           # Authentication hook
│   ├── pages/                   # Page components
│   │   ├── about/               # About page
│   │   ├── contact/             # Contact page
│   │   ├── createProfile/       # Profile creation
│   │   ├── dashboard/           # User dashboard
│   │   ├── faq/                 # FAQ page
│   │   ├── home/                # Landing page
│   │   ├── login/               # Login page
│   │   ├── policy/              # Privacy policy
│   │   ├── portfolio/           # Portfolio view
│   │   ├── publicProfile/       # Public profile view
│   │   ├── request/             # Proof request page
│   │   ├── terms/               # Terms of service
│   │   └── upload/              # Proof upload page
│   ├── utils/                   # Utility functions
│   │   ├── auth.js              # Legacy auth utilities
│   │   ├── supabaseAuth.js      # Supabase authentication
│   │   ├── profileApi.js        # Profile management API
│   │   ├── proofsApi.js         # Proof management API
│   │   └── verificationApi.js   # Verification request API
│   ├── App.js                   # Main app component
│   ├── App.css                  # Global styles
│   ├── index.js                 # App entry point
│   │   └── useAuth.js           # Authentication hook
│   ├── pages/                   # Page components
│   │   ├── about/               # About page
│   │   ├── contact/             # Contact page
│   │   ├── createProfile/       # Profile creation
│   │   ├── dashboard/           # User dashboard
│   │   ├── faq/                 # FAQ page
│   │   ├── home/                # Landing page
│   │   ├── login/               # Login page
│   │   ├── policy/              # Privacy policy
│   │   ├── portfolio/           # Portfolio view
│   │   ├── publicProfile/       # Public profile view
│   │   ├── request/             # Proof request page
│   │   ├── terms/               # Terms of service
│   │   └── upload/              # Proof upload page
│   ├── utils/                   # Utility functions
│   │   └── auth.js              # Authentication utilities
│   ├── App.js                   # Main app component
│   ├── App.css                  # Global styles
│   ├── index.js                 # App entry point
│   └── index.css                # Base styles
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
└── README.md                    # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.x or higher) - [Download](https://nodejs.org/)
- **npm** (v8.x or higher) or **yarn** (v1.22.x or higher)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ghonsiproof/Ghonsi-Proof.git
cd Ghonsi-Proof
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Install Additional Dependencies (if needed)

```bash
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-brands-svg-icons @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome lucide-react react-router-dom
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

### Run Tests

```bash
npm test
```

Launches the test runner in interactive watch mode.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Runs the app in development mode |
| `npm run build` | Builds the app for production |
| `npm test` | Runs the test suite |
| `npm run eject` | Ejects from Create React App (irreversible) |

---

## 🔧 Environment Setup

### Create `.env` file in the root directory:

```env
# Supabase Configuration (REQUIRED)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Solana Configuration (for future blockchain integration)
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com

# Optional: Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
```

### How to Get Supabase Credentials:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon/public key** → `REACT_APP_SUPABASE_ANON_KEY`

### Complete Setup Guide:

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed Supabase + Vercel setup instructions.

---

## 📄 Pages Overview

### Public Pages
- **Home** (`/` or `/home`) - Landing page with hero section and features
- **About** (`/about`) - Company information, mission, team
- **FAQ** (`/faq`) - Frequently asked questions
- **Contact** (`/contact`) - Contact form and information
- **Terms** (`/terms`) - Terms of service
- **Policy** (`/policy`) - Privacy policy

### Authentication
- **Login** (`/login`) - Wallet and email authentication

### Protected Pages (Require Authentication)
- **Dashboard** (`/dashboard`) - User dashboard overview
- **Create Profile** (`/createProfile`) - Initial profile setup
- **Portfolio** (`/portfolio`) - User's proof portfolio
- **Upload** (`/upload`) - Upload new proofs
- **Request** (`/request`) - Request proof verification
- **Public Profile** (`/publicProfile`) - Shareable public profile

---

## 🧩 Components

### Header Component
- Navigation menu
- Wallet connection button
- Responsive mobile menu
- Active route highlighting

**Location**: `src/components/header/header.jsx`

### Footer Component
- Social media links
- Quick navigation
- Copyright information

**Location**: `src/components/footer/footer.jsx`

---

## 🎨 Styling Architecture

### Global Styles
- **App.css**: Global styles, scrollbar customization, resets
- **index.css**: Base Tailwind imports

### Component Styles
Each page has its own CSS file for component-specific styles:
- Custom animations (e.g., `faq.css` - slideDown animation)
- Unique utility classes (e.g., `portfolio.css` - no-scrollbar, cursor utilities)
- Component-specific overrides

### Tailwind CSS
- Utility-first approach for rapid development
- Custom color palette:
  - Primary: `#C19A4A` (Gold)
  - Background: `#0B0F1B` (Dark Blue)
  - Card: `#111625` (Dark Gray)

### Color Scheme
```css
--bg: #0B0F1B;           /* Main background */
--gold: #C19A4A;         /* Primary accent */
--text: #FFFFFF;         /* Text color */
--card: #111625;         /* Card background */
--border: #2A3040;       /* Border color */
```

---

## 🔐 Authentication Flow

### Supabase Authentication

The app now uses **Supabase Auth** for secure authentication:

### Email Authentication
1. User enters email address on `/login`
2. Supabase sends magic link to email
3. User clicks link → automatically signed in
4. Session stored securely by Supabase
5. Redirect to dashboard

### Wallet Authentication (Hybrid Approach)
1. User clicks wallet (Phantom, Solflare, Backpack, Glow)
2. Wallet signature is verified
3. User record created/retrieved with wallet address
4. Custom session management for wallet users
5. Redirect to home/dashboard

### Session Management
```javascript
// Check if user is authenticated
import { isAuthenticated } from './utils/supabaseAuth';

const checkAuth = async () => {
  const authenticated = await isAuthenticated();
  // Returns true if email or wallet session exists
};
```

### Using Authentication in Components
```javascript
import { getCurrentUser, logout } from './utils/supabaseAuth';

// Get current user
const user = await getCurrentUser();

// Logout
await logout();
```

### Protected Routes

To protect routes, wrap them with authentication check:

```javascript
// Example: src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '../utils/supabaseAuth';

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);
  
  useEffect(() => {
    isAuthenticated().then(setAuth);
  }, []);
  
  if (auth === null) return <div>Loading...</div>;
  return auth ? children : <Navigate to="/login" />;
};
```

---

## 🔌 API Integration Guide

### Supabase Backend Architecture

Ghonsi Proof uses **Supabase** as its backend, which provides:
- PostgreSQL database
- Authentication (email + magic links)
- File storage
- Row Level Security (RLS)
- Real-time subscriptions (optional)

### API Modules

All API functions are organized in `src/utils/`:

#### 1. Authentication API (`supabaseAuth.js`)

```javascript
import { 
  signUp, 
  signInWithEmail, 
  signInWithMagicLink,
  signInWithWallet,
  logout, 
  getCurrentUser,
  isAuthenticated 
} from './utils/supabaseAuth';

// Sign up with email
await signUp('user@example.com', 'password123');

// Sign in with magic link (passwordless)
await signInWithMagicLink('user@example.com');

// Sign in with wallet
await signInWithWallet(walletAddress, signature, message);

// Logout
await logout();

// Get current user
const user = await getCurrentUser();
```

#### 2. Profile API (`profileApi.js`)

```javascript
import { 
  createProfile, 
  getProfile, 
  updateProfile,
  deleteProfile 
} from './utils/profileApi';

// Create profile
await createProfile({
  display_name: 'John Doe',
  bio: 'Web3 Developer',
  profession: 'Frontend Developer',
  is_public: true
});

// Get profile
const profile = await getProfile(userId);

// Update profile
await updateProfile(userId, { bio: 'Updated bio' });
```

#### 3. Proofs API (`proofsApi.js`)

```javascript
import { 
  uploadProof, 
  getUserProofs, 
  getProof,
  updateProof,
  deleteProof,
  updateProofStatus 
} from './utils/proofsApi';

// Upload proof with files
const result = await uploadProof(
  {
    proofType: 'certificates',
    proofName: 'React Certification',
    summary: 'Advanced React course',
    referenceLink: 'https://certificate-url.com'
  },
  referenceFiles,  // File[] array
  supportingFiles  // File[] array
);

// Get all proofs for user
const proofs = await getUserProofs(userId);

// Get single proof
const proof = await getProof(proofId);

// Update proof status (admin)
await updateProofStatus(proofId, 'verified', verifierId);
```

#### 4. Verification Requests API (`verificationApi.js`)

```javascript
import { 
  createVerificationRequest,
  getUserVerificationRequests,
  updateVerificationRequestStatus 
} from './utils/verificationApi';

// Create verification request
await createVerificationRequest({
  proofId: 'uuid-here',
  verifierEmail: 'verifier@example.com',
  verifierName: 'Jane Smith',
  relationship: 'Former Manager',
  message: 'Please verify my work'
});

// Get user's requests
const requests = await getUserVerificationRequests(userId);

// Approve/reject request
await updateVerificationRequestStatus(requestId, 'approved', 'Great work!');
```

### Database Schema

See [SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md) for complete database structure.

**Main Tables:**
- `users` - User accounts and wallet addresses
- `profiles` - User profile information
- `proofs` - Uploaded proof records
- `files` - File metadata and storage links
- `verification_requests` - Peer verification requests

### File Upload Flow

```javascript
// 1. User selects files in upload form
const files = event.target.files;

// 2. Call uploadProof API
const result = await uploadProof(proofData, files, []);

// 3. Files are uploaded to Supabase Storage
// 4. File URLs are stored in database
// 5. User can access files via public URL
```

### Error Handling

```javascript
try {
  await uploadProof(data, files, []);
} catch (error) {
  if (error.code === 'PGRST116') {
    // Record not found
  } else if (error.message.includes('JWT')) {
    // Authentication error - redirect to login
  } else {
    // Other error
    console.error('Upload failed:', error);
  }
}
```

### Real-Time Updates (Optional)

```javascript
import { supabase } from './config/supabaseClient';

// Subscribe to proof updates
const subscription = supabase
  .channel('proofs-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'proofs' },
    (payload) => {
      console.log('Proof updated:', payload);
    }
  )
  .subscribe();

// Unsubscribe when done
subscription.unsubscribe();
```

---

## 🌐 Deployment

### Production Deployment

**Live URL**: [https://ghonsi-proof.vercel.app](https://ghonsi-proof.vercel.app)

The application is automatically deployed to Vercel via GitHub integration.

### Automatic Deployment Flow

```
1. Push code to GitHub (main branch)
   ↓
2. Vercel detects changes
   ↓
3. Build & deploy automatically
   ↓
4. Live at ghonsi-proof.vercel.app
```

### Deployment Stack

- **Frontend Hosting**: Vercel
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **CI/CD**: GitHub → Vercel integration
- **Database**: Supabase Cloud PostgreSQL
- **File Storage**: Supabase Storage

### Environment Variables (Vercel)

Configure in Vercel Dashboard → Settings → Environment Variables:

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
```

### Quick Deployment Guide

**Step 1: Setup Supabase**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run SQL schema from `SUPABASE_SCHEMA.md`
4. Copy API credentials

**Step 2: Configure Vercel**
1. Connect GitHub repo to Vercel
2. Add environment variables
3. Deploy!

**Detailed Instructions**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Branch Previews

- `main` branch → Production (`ghonsi-proof.vercel.app`)
- Feature branches → Preview URLs (`ghonsi-proof-git-feature-name.vercel.app`)

### Manual Build

```bash
# Build production bundle
npm run build

# Output in /build directory
# Upload to any static hosting service
```

### Performance

- **Lighthouse Score**: 95+ (target)
- **Time to First Byte**: < 200ms (Vercel Edge Network)
- **CDN**: Automatic via Vercel
- **SSL**: Automatic HTTPS via Vercel

---

## 🔄 Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 🤝 Contributing

### For Frontend Developers
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### For Backend Developers
1. Review the [API Integration Guide](#api-integration-guide)
2. Implement the required endpoints
3. Test with the frontend application
4. Document any changes to the API

### Code Style
- Use ESLint and Prettier
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

---

## 🐛 Known Issues & Roadmap

### Current Status

✅ **Completed:**
- Frontend UI/UX design
- React routing and components
- Supabase integration
- Authentication system (email + wallet hybrid)
- Database schema and RLS policies
- File upload to Supabase Storage
- Proof management API
- Profile management API
- Verification request system
- Vercel deployment with CI/CD

⚠️ **In Progress:**
- Wallet signature verification
- Blockchain integration (Solana)
- Admin verification dashboard
- Email notifications (via Supabase)

### Roadmap

#### Phase 1: Core Features (Current)
- [x] Supabase backend integration
- [x] Authentication (email + wallet)
- [x] Profile creation and management
- [x] Proof upload system
- [x] File storage (Supabase Storage)
- [ ] Protected routes implementation
- [ ] Admin verification dashboard

#### Phase 2: Blockchain Integration
- [ ] Solana wallet adapter integration
- [ ] Wallet signature verification
- [ ] On-chain proof hash storage
- [ ] Smart contract deployment
- [ ] NFT-based credentials (optional)

#### Phase 3: Enhanced Features
- [ ] Email notifications (Supabase triggers)
- [ ] Real-time updates (Supabase subscriptions)
- [ ] Search and filter functionality
- [ ] Analytics dashboard
- [ ] Public profile sharing
- [ ] Proof verification badges

#### Phase 4: Scaling & Optimization
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Progressive Web App (PWA)
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Caching strategy

---

## 📞 Support

For questions or issues:
- **Email**: ghonsiproof@gmail.com
- **Twitter**: [@Ghonsiproof](https://x.com/Ghonsiproof)
- **Discord**: [Join our community](https://discord.com/)

---

## 📄 License

This project is proprietary and confidential. All rights reserved by Ghonsi Proof.

---

## 👥 Team

- **Prosper Ayere** - Founder & Product Lead
- **Godwin Adakonye John** - Blockchain Engineer
- **Nofiu Moruf Pelumi** - Lead Backend Engineer
- **Progress Ayere** - Lead Frontend Engineer
- **Nie Osaoboh** - Product Designer
- **Success Ola-Ojo** - Advisor

---

## 🙏 Acknowledgments.

- Solana Foundation
- Web3 Community
- All contributors and supporters

---

**Built with ❤️ by the Ghonsi Proof Team**

*Making Web3 professional verification accessible to everyone*
