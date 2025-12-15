# Ghonsi Proof

**The On-Chain Trust Engine for the Web3 Workforce**

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

### Build Tools
- **React Scripts** (v5.0.1) - Create React App build configuration
- **PostCSS** (v8.5.6) - CSS processing
- **Autoprefixer** (v10.4.22) - CSS vendor prefixing

### Testing
- **Jest** - Testing framework
- **React Testing Library** (v16.3.0) - Component testing

### Blockchain (Backend Integration Ready)
- **Solana** - Blockchain platform
- **Wallet Adapters** - For wallet connections (to be integrated)

---

## 📁 Project Structure

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
# API Configuration (Backend Integration)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOLANA_NETWORK=devnet

# Solana Configuration
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com

# Optional: Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=your_ga_id
```

### Environment Variables Explained:

- `REACT_APP_API_URL`: Backend API endpoint
- `REACT_APP_SOLANA_NETWORK`: Solana network (devnet/testnet/mainnet-beta)
- `REACT_APP_SOLANA_RPC_URL`: Solana RPC endpoint

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

### Wallet Authentication
1. User clicks "Connect Wallet"
2. Selects wallet provider (Phantom, Solflare, Backpack, Glow)
3. Wallet connection is established
4. User data is stored in `localStorage`
5. Redirect to dashboard

### Email Authentication
1. User enters email address
2. Email validation
3. User data is stored in `localStorage`
4. Redirect to dashboard

### Authentication Hook
```javascript
// src/hooks/useAuth.js
import { useAuth } from '../hooks/useAuth';

const { isAuthenticated, user, logout } = useAuth();
```

### Protected Routes (To Be Implemented)
```javascript
// Example protected route wrapper
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('userLoggedIn');
  return isLoggedIn ? children : <Navigate to="/login" />;
};
```

---

## 🔌 API Integration Guide

### For Backend Developers

#### Expected API Endpoints

##### Authentication
```
POST /api/auth/wallet-login
POST /api/auth/email-login
POST /api/auth/logout
GET  /api/auth/verify
```

##### User Profile
```
GET    /api/profile/:userId
POST   /api/profile/create
PUT    /api/profile/update
DELETE /api/profile/delete
```

##### Proofs
```
GET    /api/proofs/:userId
POST   /api/proofs/upload
PUT    /api/proofs/:proofId
DELETE /api/proofs/:proofId
GET    /api/proofs/verify/:proofId
```

##### Verification Requests
```
POST   /api/requests/create
GET    /api/requests/:userId
PUT    /api/requests/:requestId/approve
PUT    /api/requests/:requestId/reject
```

#### Request/Response Format

**Upload Proof Request:**
```json
{
  "proofType": "certificates",
  "proofName": "Senior Frontend Developer Certification",
  "summary": "Advanced React certification...",
  "referenceLink": "https://certificate-url.com",
  "referenceFiles": ["file1.pdf"],
  "supportingFiles": ["file2.pdf"]
}
```

**Upload Proof Response:**
```json
{
  "success": true,
  "proofId": "GH-C-012",
  "message": "Proof submitted for verification",
  "verificationStatus": "pending",
  "estimatedTime": "2-5 business days"
}
```

#### File Upload
- Maximum file size: 2MB
- Accepted formats: PDF, JPG, PNG, DOC, DOCX
- Use multipart/form-data for file uploads

#### Authentication Headers
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `build` folder to Netlify

### Manual Deployment

1. Build:
```bash
npm run build
```

2. Upload the `build` folder to your hosting provider

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

### Current Limitations
- [ ] Wallet integration is UI-only (needs blockchain connection)
- [ ] No backend API integration yet
- [ ] Email authentication is mock (needs real authentication)
- [ ] File uploads are client-side only (needs server storage)

### Roadmap
- [ ] Integrate Solana wallet adapters
- [ ] Connect to backend API
- [ ] Implement real authentication
- [ ] Add file upload to IPFS/Arweave
- [ ] Implement on-chain proof verification
- [ ] Add notification system
- [ ] Implement search and filter functionality
- [ ] Add analytics dashboard

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

*Making Web3 professional verification accessible to everyone.*
