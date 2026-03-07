# ❗ Problem







Professionals often struggle to prove their contributions across multiple ecosystems.







Certificates, job records, community contributions, and project work are often scattered across different platforms and are difficult to verify.







Traditional resumes and centralized platforms do not provide **tamper-resistant verification of professional achievements**.







Because of this:







* Credentials can be falsified



* Contributions are hard to validate



* Professional reputation becomes fragmented across platforms







---







# 💡 Solution


# Ghonsi Proof

**The On-Chain Trust Engine for the Web3 Workforce.**

Ghonsi Proof is a decentralized platform that transforms scattered professional contributions into a single verifiable on-chain identity. We help Web3 professionals prove their skills, authenticate their work, and showcase verified credentials through blockchain-anchored NFT certificates.

---

## 📋 Table of Contents

* [Overview](https://www.google.com/search?q=%23overview)
* [Features](https://www.google.com/search?q=%23features)
* [Architecture](https://www.google.com/search?q=%23architecture)
* [Tech Stack](https://www.google.com/search?q=%23tech-stack)
* [Project Structure](https://www.google.com/search?q=%23project-structure)
* [Prerequisites](https://www.google.com/search?q=%23prerequisites)
* [Installation](https://www.google.com/search?q=%23installation)
* [Configuration](https://www.google.com/search?q=%23configuration)
* [Running the Application](https://www.google.com/search?q=%23running-the-application)
* [CRE Workflow Simulation](https://www.google.com/search?q=%23cre-workflow-simulation)
* [Smart Contract](https://www.google.com/search?q=%23smart-contract)
* [Backend API](https://www.google.com/search?q=%23backend-api)
* [Extraction API](https://www.google.com/search?q=%23extraction-api)
* [Frontend Application](https://www.google.com/search?q=%23frontend-application)
* [Deployment](https://www.google.com/search?q=%23deployment)
* [API Documentation](https://www.google.com/search?q=%23api-documentation)
* [Contributing](https://www.google.com/search?q=%23contributing)
* [Team](https://www.google.com/search?q=%23team)
* [License](https://www.google.com/search?q=%23license)

---


## ✨ Features

### Core Platform Features

* **Multi-Wallet Support**: Phantom, Solflare, Backpack, Glow wallet integration.
* **Email Authentication**: Magic link authentication via Supabase.
* **Proof Types**: Certificates, Job History, Skills, Milestones, Community Contributions.
* **Document Upload**: Support for PDF, JPG, PNG, DOC, DOCX (up to 2MB).
* **AI Extraction**: Automatic field extraction and confidence scoring.
* **Background Validation**: Chainlink CRE workflow orchestration triggers post-upload to verify data accuracy.
* **Blockchain Minting**: Soulbound NFT certificates on Solana.
* **IPFS Storage**: Dual upload (file + metadata) to IPFS via Pinata.
* **Public Profiles**: Shareable portfolio pages with verified credentials.
* **Peer Verification Requests**: Request proof verification from peers.
* **Real-time Notifications**: Toast notifications for user actions and CRE verification updates.

### Security Features

* **Row Level Security (RLS)**: Database-level access control.
* **Soulbound NFTs**: Non-transferable proof certificates.
* **Wallet Signatures**: Cryptographic proof of ownership.
* **Admin Multi-Sig**: Support for up to 10 program admins.
* **Encrypted Storage**: Secure file storage on Supabase.

---

## 🏗 Architecture

Ghonsi Proof uses an **event-driven verification pipeline** where CRE orchestrates the processing of uploaded proofs.

```text
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  - User Interface                                           │
│  - Wallet Integration                                       │
│  - Form Management                                          │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
             ▼              ▼              ▼              ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase     │ │   Backend    │ │ Extraction   │ │   Solana     │
│   Database     │ │     API      │ │     API      │ │   Blockchain │
│                │ │              │ │              │ │              │
│ - PostgreSQL   │ │ - Messages   │ │ - AI OCR     │ │ - Smart      │
│ - Auth         │ │ - Blockchain │ │ - Document   │ │   Contract   │
│ - Storage      │ │   Submit     │ │   Processing │ │ - NFT Mint   │
│ - RLS          │ │ - CRE Webhook│ │ - Confidence │ │ - Verify     │
└───────┬────────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
        │                 │                │                │
        │                 ▼                │                │
        │          ┌──────────────┐        │                │
        │          │  Chainlink   │        │                │
        └─────────>│  CRE Agent   │<───────┘                │
                   │ (Background) │                         │
                   └──────┬───────┘                         │
                          │                                 │
                          ▼                                 ▼
                   ┌──────────────┐                  ┌──────────────┐
                   │    IPFS      │                  │    IPFS      │
                   │   (Pinata)   │                  │   (Pinata)   │
                   │              │                  │              │
                   │ - Files      │                  │ - Files      │
                   │ - Metadata   │                  │ - Metadata   │
                   └──────────────┘                  └──────────────┘

```

### Workflow Explanation

1. **Upload:** User submits a document and metadata.
2. **Database Record:** Proof is stored in Supabase with status `pending`.
3. **AI Extraction:** Claude extracts structured metadata and assigns confidence scores.
4. **IPFS Storage:** Evidence file and metadata are uploaded to IPFS via Pinata.
5. **Blockchain Anchoring:** Proof metadata hash is anchored on Solana.
6. **CRE Workflow:** Chainlink CRE orchestrates the background verification pipeline.
7. **Portfolio Update:** Upon CRE success, user portfolio auto-updates from `pending` to `verified`.

---

## 🛠 Tech Stack

### Frontend

* **React** 18.2.0, **React Router DOM**, **Tailwind CSS**, **Framer Motion**, **Lucide React**

### Blockchain & Verification

* **Solana Web3.js**, **Wallet Adapter**, **Anchor Framework**, **SPL Token**, **Chainlink CRE**

### Backend & Infrastructure

* **Node.js**, **Express**, **Supabase** (PostgreSQL + Auth + Storage), **IPFS (Pinata)**

### Extraction API

* **Django**, **Django REST Framework**, **Anthropic Claude**, **Tesseract OCR**, **PyPDF2**, **Pillow**

---

## 📁 Project Structure

```text
ghonsi-proof/
├── src/                          # Frontend React application
├── backend/                      # Node.js backend API
├── extraction_api/               # Django AI extraction service
├── ghonsi_proof/                 # Solana smart contract
├── cre-agent/                    # CRE orchestration scripts
├── public/                       # Static files
├── scripts/                      # Database migration scripts
├── package.json                  # Frontend dependencies
├── tailwind.config.js            # Tailwind configuration
└── README.md                     # This file

```

---

## 📦 Prerequisites

### Required Software

* **Node.js** 18.x+ and **npm** 8.x+
* **Python** 3.11+ (for extraction API)
* **Rust** 1.70+ and **Anchor CLI** 0.32+
* **Solana CLI** 1.18+
* **Git**

### Required Accounts

* **Supabase Account**, **Pinata Account**, **Anthropic API Key**, **Solana Wallet**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ghonsiproof/Ghonsi-Proof.git
cd Ghonsi-Proof/ghonsi-proof

```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend && npm install && cd ..

# Extraction API
cd extraction_api && pip install -r requirements.txt && cd ..

# Smart Contract
cd ghonsi_proof && npm install && anchor build && cd ..

```

---

## ⚙️ Configuration

Create `.env` files for each service.

**Frontend (`.env`)**

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
REACT_APP_API_URL=https://your-render-app.onrender.com
STANDARD_API_KEY=https://your-extraction-api.onrender.com
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=your_solana_program_id_here
REACT_APP_PINATA_JWT=your_pinata_jwt_here
REACT_APP_CRE_ENDPOINT=https://your-cre-webhook.com

```

---

## 🏃 Running the Application

### Development Mode (All Services)

**Frontend**: `npm start` (Runs on http://localhost:3000)
**Backend**: `cd backend && npm start` (Runs on http://localhost:3001)
**Extraction API**: `cd extraction_api && python manage.py runserver` (Runs on http://localhost:8000)

---

## 🔄 CRE Workflow Simulation

For development and demonstration, the CRE pipeline can be simulated locally.

Navigate to the CRE agent directory and run the workflow simulation:

```bash
cd cre-agent
node simulate.js

```

**Simulation Flow:**
`Step 1` → Fetch pending proofs from Supabase
`Step 2` → Run AI extraction on uploaded documents
`Step 3` → Upload metadata to IPFS via Pinata
`Step 4` → Anchor proof record on Solana
`Step 5` → Update status from `pending` → `verified`

---

## 🔗 Smart Contract

The Solana smart contract manages proof credentials, including minting proof NFTs, verifying/rejecting proofs, and enforcing soulbound tokens.

### Program ID

```text
5N6CH3GTndpqdiTHrqPutaypu5Zxy4BDVMwnq88LckNv

```

### Instructions

`initialize`, `add_admin`, `remove_admin`, `mint_proof`, `verify_proof`, `reject_proof`

---

## 🔌 Backend API

Handles the messaging system, blockchain submission, CRE webhook triggers, and Supabase service operations.

**Key Endpoints:**

```text
GET  /health
POST /api/messages
POST /api/submit-proof
POST /api/cre/trigger

```

---

## 🤖 Extraction API

AI document extraction service using Claude AI and OCR.

**Endpoint:** `POST /api/extract/`

**Example Response:**

```json
{
  "proof_type": "certificate",
  "extracted_data": {
    "title": "Advanced React",
    "issuer": "Udemy",
    "completion_date": "2024-01-15"
  },
  "confidence": 0.95
}

```

---

## 💻 Frontend Application

### Upload Pipeline & CRE Integration (`/upload`)

1. **Details:** Select proof type and fill details.
2. **Extraction:** Upload document (AI extraction runs).
3. **Anchor:** File stored on IPFS & Metadata anchored on Solana.
4. **CRE Validation:** CRE Agent triggers silently in the background.

### Portfolio & Public Profile (`/portfolio`)

* Displays user's proof collection.
* **Dynamic Updates:** The portfolio page automatically changes a proof's status to **Verified** from **Pending** as soon as the background CRE process is completed.

---

## 🌐 Deployment

* **Frontend:** Vercel ([https://ghonsi-proof.vercel.app](https://ghonsi-proof.vercel.app))
* **Backend / Extraction API:** Render
* **Blockchain:** Solana Devnet

---

## 📚 API Documentation

### Supabase Database Schema

**proofs**

* `id` (uuid, primary key)
* `user_id` (uuid, foreign key)
* `proof_type`, `proof_name`, `summary`, `reference_link` (text)
* `status` (text: pending/verified/rejected) *— Managed by CRE background agent*
* `ai_confidence_score` (numeric)
* `ipfs_hash`, `file_ipfs_hash`, `transaction_hash` (text)
* `extracted_data` (jsonb)

*(Additional tables: `users`, `profiles`, `verification_requests`, `messages`)*

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes (Use convention: `feat:`, `fix:`, `docs:`, etc.)
4. Push to branch and open a Pull Request.

---

## 👥 Team

* **Prosper Ayere** — Founder & Product Lead
* **Godwin Adakonye John** — Blockchain Engineer
* **Nofiu Moruf Pelumi** — Lead Backend Engineer
* **Progress Ayere** — Lead Frontend Engineer
* **Gunduor Victor** — Frontend Engineer
* **Nie Osaoboh** — Product Designer
* **Success Ola-Ojo** — Advisor

---

## 📄 License

Proprietary — All rights reserved by Ghonsi Proof.

---

## 🙏 Acknowledgments

* Solana Foundation
* Anchor Framework Team
* Supabase Team
* Chainlink Build
* Anthropic (Claude AI)
* Pinata
* Web3 Community & All contributors

---

**Built with ❤️ by the Ghonsi Proof Team**

*Making Web3 professional verification accessible to everyone.*
