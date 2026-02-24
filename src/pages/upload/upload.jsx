/**
 * Upload Component
 *
 * Manages the upload and submission of professional proofs (certificates, job history, skills, etc.)
 * to the verification system. Handles file validation, form state management, and submission workflow.
 *
 * @component
 * @requires supabaseAuth - Authentication utilities
 * @requires proofsApi - API layer for proof submission
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '../../utils/supabaseAuth';
import { uploadProof } from '../../utils/proofsApi';
import { extractDocumentData, supportsExtraction } from '../../utils/extractionApi';
import { uploadDocumentWithMetadata } from '../../utils/pinataUpload';
import { submitProofToBlockchain, updateProofWithBlockchainData } from '../../utils/blockchainSubmission';
import { useWallet } from '../../hooks/useWallet';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import TransactionSignerModal from '../../components/TransactionSignerModal';
import './upload.css';

function Upload() {
  // Wallet and connection hooks
  const { publicKey, connected } = useWallet();

  // Form state management
  const [proofType, setProofType] = useState('');
  const [proofName, setProofName] = useState('');
  const [summary, setSummary] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [referenceFiles, setReferenceFiles] = useState([]);

  // UI state management
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [supportingError, setSupportingError] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Transaction signer modal state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [extractedDocumentData, setExtractedDocumentData] = useState(null);
  const [pendingProofData, setPendingProofData] = useState(null);

  // Refs for DOM manipulation and click-outside detection
  const dropdownRef = useRef(null);
  const referenceFileInputRef = useRef(null);

  // File validation constants
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  const ACCEPTED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  /**
   * Proof type requirements and validation rules
   * Defines placeholder text, valid evidence types, and restricted content for each proof category
   */
  const proofRequirements = {
    certificates: {
      summaryPlaceholder:
        'Enter: Certificate Title, Issuer Name, Completion Date, Credential Type (Course/Bootcamp), and Instructor Names...',
      validEvidences: [
        'Full certificate file (PDF, PNG, screenshot)',
        'Certificate link',
        'Official issuer message confirming completion of training',
        'Link to public graduate announcement (if issuer posts those)',
      ],
      notAllowed:
        'NDA-covered materials, proprietary internal tools, certificate PDFs with watermarks forbidding redistribution, documents showing sensitive internal company data.',
    },
    job_history: {
      summaryPlaceholder:
        'Enter: Job Title, Employer Name, Employment Type, Start/End Dates, Job Category, Internal Work Experience ID...',
      validEvidences: [
        'Snapshot of offer letter (redacted salary)',
        'HR email confirming employment',
        'Work badge snapshot',
        "Public team page snapshot where user's name appears (if applicable)",
        'GitHub contribution logs linked to the company repo',
        'Public posts (LinkedIn) from the employer announcing new hires',
      ],
      notAllowed:
        'Confidential HR portals, salary details, internal documentation, private client data, or anything uniquely traceable to a person.',
    },
    skills: {
      summaryPlaceholder:
        'Enter: Skill Name (e.g., Solidity), Proficiency Level (e.g., Beginner/Intermediate/Advanced), Skill Category, Internal Skill ID...',
      validEvidences: [
        'GitHub activity screenshots',
        'Snippets of work (non-sensitive)',
        'Public portfolio links',
        'Dribbble/Behance links',
        'Snapshots of skill tests (without sensitive user info)',
      ],
      notAllowed:
        "Proprietary materials, private client work, snapshots of codebases belonging to employers, or any IP you don't own.",
    },
    milestones: {
      summaryPlaceholder:
        'Enter: Milestone Type (Promotion/Award/Recognition/Key Result), Issuer Name(company or platform), Month & Year, Internal Milestone ID...',
      validEvidences: [
        'Snapshot of award announcement',
        'Email confirming promotion',
        'Public recognition posts',
        'Certificate of achievement',
      ],
      notAllowed:
        'Performance reviews, salary information, internal feedback or one-on-one reports, data regarding other employees.',
    },
    community_contributions: {
      summaryPlaceholder:
        'Enter: Contribution Type (Talk, Article, Open Source, Community Role), Platform Name, Date, Internal Contribution ID...',
      validEvidences: [
        'Link to article, talk, or recording',
        'Snapshot of Speaking Engagement Flyer',
        'Image of GitHub PR',
        'Snapshot of community role announcement',
      ],
      notAllowed: 'Sensitive community data or private correspondence.',
    },
  };

  // Dropdown options for proof types
  const proofOptions = [
    { value: 'certificates', label: 'Certificates / Trainings' },
    { value: 'job_history', label: 'Job History (Work Experience)' },
    { value: 'skills', label: 'Skills / Competencies' },
    { value: 'milestones', label: 'Career Milestones (Promotions / Awards)' },
    { value: 'community_contributions', label: 'Community Contributions / Public Work' },
  ];

  /**
   * Extracts proof data from uploaded document using the extraction API
   * Automatically fills in summary and proof name if not already set
   * @param {File} file - The file to extract data from
   * @param {string} selectedProofType - The proof type for extraction
   * @returns {Promise<Object|null>} - Extracted data or null if extraction fails
   */
  const extractProofData = async (file, selectedProofType) => {
    if (!supportsExtraction(selectedProofType)) {
      console.log(`Extraction not supported for proof type: ${selectedProofType}`);
      return null;
    }
    try {
      setIsExtracting(true);
      const data = await extractDocumentData(file, selectedProofType);
      if (!data) throw new Error('No response from extraction API');
      console.log('===== EXTRACTION RESULT =====');
      console.log(data);
      console.log('Title:', data.title);
      console.log('Summary:', data.summary);
      console.log('=============================');
      return data;
    } catch (error) {
      console.error('Extraction error:', error);
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  /**
   * Setup click-outside listener for dropdown
   * Closes the dropdown when user clicks anywhere outside of it
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  /**
   * Handles proof type selection from dropdown
   * Triggers extraction if a file has already been uploaded
   * @param {string} value - Selected proof type value
   */
  const handleProofTypeSelect = async (value) => {
    setProofType(value);
    setIsDropdownOpen(false);
    setShowInstructions(true);
    if (referenceFiles.length > 0) {
      const extracted = await extractProofData(referenceFiles[0], value);
      if (extracted) {
        if (!summary.trim() && extracted.summary) setSummary(extracted.summary);
        if (!proofName.trim() && extracted.title) setProofName(extracted.title);
      }
    }
  };

  /**
   * Validates uploaded file against type and size constraints
   * @param {File} file - File object to validate
   * @returns {string|null} Error message if validation fails, null if valid
   */
  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/i)) {
      return `"${file.name}" is not a supported format.`;
    }
    if (file.size > MAX_SIZE) {
      return `"${file.name}" exceeds the 2MB size limit.`;
    }
    return null;
  };

  /**
   * Handles reference file selection and validation
   * Only allows a single file to be uploaded at a time
   * Triggers extraction API when file is selected and proof type is chosen
   * @param {File[]} files - Array of files from input or drop event
   */
  const handleReferenceFiles = async (files) => {
    setSupportingError('');
    if (files.length === 0) return;
    const file = files[0];
    const error = validateFile(file);
    if (error) {
      setSupportingError(error);
      setTimeout(() => setSupportingError(''), 5000);
      return;
    }
    setReferenceFiles([file]);
    if (proofType) {
      const extracted = await extractProofData(file, proofType);
      if (extracted) {
        if (!summary.trim() && extracted.summary) setSummary(extracted.summary);
        if (!proofName.trim() && extracted.title) setProofName(extracted.title);
      }
    }
  };

  /**
   * Prevents default browser behavior for drag events
   * Required for custom drag-and-drop functionality
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Handles form submission and proof upload
   * Now shows transaction signer modal after validation
   * After transaction is signed, uploads to Pinata and saves proof to database
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    let hasError = false;
    if (!proofName.trim() || !summary.trim() || !proofType) {
      setUploadError('Please fill in all required fields.');
      hasError = true;
    }
    if (referenceFiles.length === 0) {
      setSupportingError('A Reference Document is required.');
      hasError = true;
    }
    if (!connected) {
      setUploadError('Please connect your wallet to upload proofs.');
      hasError = true;
    }
    if (hasError) return;

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('You must be logged in to upload proofs');

      // Prepare the document data for IPFS storage
      const documentData = {
        proofType: proofType,
        proofName: proofName,
        summary: summary,
        referenceLink: referenceLink || null,
        walletAddress: publicKey?.toString() || null,
        userId: user.id,
        uploadedAt: new Date().toISOString(),
      };

      // Store data and show transaction modal
      setExtractedDocumentData(documentData);
      setPendingProofData({
        proofType: proofType,
        proofName: proofName,
        summary: summary,
        referenceLink: referenceLink || null,
      });
      setShowTransactionModal(true);
    } catch (error) {
      console.error('[v0] Error preparing proof submission:', error);
      setUploadError(error.message || 'Failed to prepare proof submission');
    }
  };

  /**
   * Handles successful transaction
   * Uploads document to Pinata IPFS, saves proof to database, and submits to blockchain
   * @param {Object} txData - Transaction data from modal (txHash, amount, documentData)
   */
  const handleTransactionSuccess = async (txData) => {
    setShowTransactionModal(false);
    setShowPendingModal(true);

    try {
      console.log('[v0] Transaction successful, uploading to Pinata:', txData.txHash);

      // Prepare metadata with transaction hash
      const metadata = {
        transactionHash: txData.txHash,
        walletAddress: publicKey?.toString() || null,
        amount: txData.amount,
        timestamp: new Date().toISOString(),
      };

      // Upload to Pinata IPFS
      const ipfsResult = await uploadDocumentWithMetadata(extractedDocumentData, metadata);
      console.log('[v0] Pinata upload successful:', ipfsResult);

      // Upload proof to database with IPFS hash
      const proofDataWithIPFS = {
        ...pendingProofData,
        ipfsHash: ipfsResult.hash,
        ipfsUrl: ipfsResult.url,
        transactionHash: txData.txHash,
      };

      const uploadedProof = await uploadProof(proofDataWithIPFS, [], [referenceFiles[0]]);
      const proofId = uploadedProof.proof.id;

      console.log('[v0] Proof saved to database:', proofId);

      // Now submit to blockchain
      console.log('[v0] Submitting proof to blockchain...');
      const blockchainResult = await submitProofToBlockchain(
        {
          proofId: proofId,
          title: pendingProofData.proofName,
          description: pendingProofData.summary,
          proofType: pendingProofData.proofType,
          ipfsUri: ipfsResult.url,
        },
        publicKey?.toString()
      );

      console.log('[v0] Blockchain submission successful:', blockchainResult);

      // Update proof with blockchain data
      await updateProofWithBlockchainData(proofId, blockchainResult);

      console.log('[v0] Proof fully submitted: database + IPFS + blockchain');

      setTimeout(() => {
        setShowPendingModal(false);
        setTimeout(() => setShowSubmittedModal(true), 300);
      }, 1500);
    } catch (error) {
      console.error('[v0] Error completing proof submission:', error);
      setUploadError(error.message || 'Failed to complete proof submission. IPFS upload may have succeeded but blockchain submission failed.');
      setShowPendingModal(false);
      setIsUploading(false);
    }
  };

  /**
   * Handles transaction modal close
   * Resets modal state without completing upload
   */
  const handleTransactionModalClose = () => {
    setShowTransactionModal(false);
    setExtractedDocumentData(null);
    setPendingProofData(null);
  };

  /**
   * Resets all form fields and state to initial values
   * Used after successful submission or when user cancels
   */
  const resetAll = () => {
    setProofType('');
    setProofName('');
    setSummary('');
    setReferenceLink('');
    setReferenceFiles([]);
    setShowInstructions(false);
    setSupportingError('');
    setUploadError('');
    setIsUploading(false);
    setIsExtracting(false);
    setShowTransactionModal(false);
    setExtractedDocumentData(null);
    setPendingProofData(null);
  };

  /**
   * Returns appropriate Font Awesome icon class based on file type
   * @param {File} file - File object to get icon for
   * @returns {string} Font Awesome icon class name
   */
  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) return 'fa-file-pdf';
    if (file.type.includes('image')) return 'fa-file-image';
    if (file.type.includes('word') || file.name.includes('doc')) return 'fa-file-word';
    return 'fa-file';
  };

  // Get requirements for currently selected proof type
  const currentRequirements = proofType ? proofRequirements[proofType] : null;

  return (
    <div className="min-h-screen bg-[#0B0F1B] text-white selection:bg-[#C19A4A]/30 relative overflow-hidden flex flex-col">

      {/* Background Elements – matches Home & Portfolio */}
      <div className="fixed inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-grid z-0" />

      <Header />

      {/* Transaction Signer Modal */}
      <TransactionSignerModal
        isOpen={showTransactionModal}
        onClose={handleTransactionModalClose}
        onSuccess={handleTransactionSuccess}
        amount={0.01}
        treasuryAddress={process.env.REACT_APP_TREASURY_WALLET || 'EKGNwqNBUBtH5Fnmcjjoj4Tci6dCXdcCrxcjTaWm5bLf'}
        documentData={extractedDocumentData}
      />

      <main className="relative z-10 flex-grow px-4 py-8 max-w-4xl mx-auto w-full mt-[105px]">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
            Upload Your Proof
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Add a new proof to your on-chain portfolio<br /></p>
        </motion.div>

        {/* Main Form Container – gradient border card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 shadow-2xl mb-10"
        >
          <div className="bg-[#111625] rounded-[14px] p-6 md:p-8 relative overflow-hidden">

            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-blue-500/5 pointer-events-none" />

            {/* Error Alert */}
            <AnimatePresence>
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-3 relative z-10"
                >
                  <i className="fa-solid fa-circle-exclamation text-lg"></i>
                  {uploadError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

              {/* Proof Name Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                  Proof Name *
                </label>
                <input
                  type="text"
                  value={proofName}
                  onChange={(e) => setProofName(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer Certification"
                  className="w-full glass-input rounded-xl px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* Proof Type Dropdown */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                  Proof Type *
                </label>
                <div className={`custom-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full glass-input rounded-xl px-4 py-3.5 text-sm cursor-pointer flex justify-between items-center hover:border-[#aa8944]/60 transition-colors"
                  >
                    <span className={proofType ? 'text-white' : 'text-gray-500'}>
                      {proofType
                        ? proofOptions.find((opt) => opt.value === proofType)?.label
                        : 'Select proof type'}
                    </span>
                    <i
                      className={`fa-solid ${
                        isDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'
                      } text-[#aa8944] text-xs transition-transform duration-300`}
                    ></i>
                  </div>

                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="custom-dropdown-options"
                    >
                      {proofOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleProofTypeSelect(option.value)}
                          className={`custom-option ${proofType === option.value ? 'selected' : ''}`}
                        >
                          {option.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Summary Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                  Summary *
                </label>
                <div className="relative">
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows="4"
                    maxLength="500"
                    className="w-full glass-input rounded-xl px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
                    placeholder={
                      currentRequirements?.summaryPlaceholder ||
                      'Describe your achievement, skills demonstrated or work completed'
                    }
                  />
                  <div
                    className={`absolute bottom-3 right-4 text-[10px] font-mono tracking-wider ${
                      summary.length >= 500 ? 'text-red-400' : 'text-gray-500'
                    }`}
                  >
                    {summary.length}/500 characters
                  </div>
                </div>
              </div>

              {/* Dynamic Instructions Panel – shows required evidence based on proof type */}
              <AnimatePresence>
                {showInstructions && currentRequirements && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-[#C19A4A]/10 to-transparent border border-[#C19A4A]/20 rounded-xl p-5 mb-2">
                      <h4 className="text-[#C19A4A] font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-check"></i> Required Evidence
                      </h4>
                      <p className="text-gray-300 text-xs mb-3 font-medium">
                        Please ensure your Reference Document includes:
                      </p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400 mb-4">
                        {currentRequirements.validEvidences.map((item, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-[#C19A4A] mt-0.5">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <div className="bg-red-500/10 border-l-2 border-red-500/50 p-3 rounded-r-lg">
                        <span className="text-red-400 font-bold text-[10px] uppercase tracking-wider block mb-1">
                          Not Allowed:
                        </span>
                        <p className="text-gray-400 text-[11px] italic leading-relaxed">
                          {currentRequirements.notAllowed}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reference Link Field (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                  Reference Link{' '}
                  <span className="text-gray-600 normal-case tracking-normal font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={referenceLink}
                  onChange={(e) => setReferenceLink(e.target.value)}
                  placeholder="https://github.com/project or https://certificate-url.com"
                  className="w-full glass-input rounded-xl px-4 py-3.5 text-sm placeholder-gray-500 focus:outline-none"
                />
                <p className="text-[10px] text-gray-400 ml-1">
                  Optional: Link to GitHub repo, certificate URL, or other relevant documentation
                </p>
              </div>

              {/* File Upload Area with Drag & Drop */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">
                  <span>Reference Document *</span>
                  <span className="flex items-center gap-1.5 text-[#C19A4A]/80 cursor-help hover:text-[#C19A4A] transition-colors normal-case tracking-normal font-normal">
                    <i className="fa-regular fa-circle-question"></i> Get Help
                  </span>
                </label>

                <div
                  onClick={() => referenceFileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleReferenceFiles(Array.from(e.dataTransfer.files));
                  }}
                  className="border-2 border-dashed border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#C19A4A]/50 transition-all cursor-pointer group relative"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-[#C19A4A]/30 text-[#C19A4A] mb-4 group-hover:bg-gradient-to-br group-hover:from-[#C19A4A] group-hover:to-[#d9b563] group-hover:text-[#0B0F1B] transition-all duration-300 group-hover:scale-110 shadow-lg">
                    <i className="fa-solid fa-arrow-up-from-bracket text-xl"></i>
                  </div>
                  <p className="text-sm font-semibold mb-1 text-gray-200">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC up to 2MB</p>
                  <input
                    ref={referenceFileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleReferenceFiles(Array.from(e.target.files))}
                  />
                </div>

                {/* Selected File Display */}
                <AnimatePresence>
                  {referenceFiles.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-2 mt-2"
                    >
                      {referenceFiles.map((file, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between bg-[#1A1F2E] border border-[#C19A4A]/30 rounded-xl px-4 py-3 shadow-lg"
                        >
                          <div className="flex items-center gap-4 overflow-hidden">
                            <i className={`fa-solid ${getFileIcon(file)} text-[#C19A4A] text-lg`}></i>
                            <div className="flex flex-col">
                              <span className="truncate text-sm font-medium text-gray-200 max-w-[200px] sm:max-w-[300px]">
                                {file.name}
                              </span>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[10px] text-gray-500 font-mono">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                                {isExtracting && (
                                  <span className="text-[10px] text-[#C19A4A] flex items-center gap-1.5 font-medium">
                                    <i className="fa-solid fa-spinner fa-spin"></i> Extracting...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReferenceFiles([])}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>

                {/* File Error Display */}
                <AnimatePresence>
                  {supportingError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-xs bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center mt-3 font-medium"
                    >
                      {supportingError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Upload Requirements Info Box */}
              <div className="relative p-[1px] rounded-xl bg-gradient-to-br from-[#C19A4A]/60 to-[#C19A4A]/10">
                <div className="rounded-xl p-5 bg-[#0d1020]">
                  <h4 className="text-[#C19A4A] text-sm font-semibold mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-circle-exclamation"></i> Upload Requirements
                  </h4>
                  <ul className="text-[11px] text-gray-300 space-y-2 list-none">
                    <li className="flex gap-2 items-start">
                      <span className="text-[#C19A4A] text-[6px] mt-1.5">●</span>
                      Reference document is required
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-[#C19A4A] text-[6px] mt-1.5">●</span>
                      Maximum file size: 2MB per document
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-[#C19A4A] text-[6px] mt-1.5">●</span>
                      Accepted formats: PDF, JPG, PNG, DOC, DOCX
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-[#C19A4A] text-[6px] mt-1.5">●</span>
                      Documents should clearly show your achievement or work
                    </li>
                  </ul>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-8 mt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-white text-sm font-medium hover:text-[#C19A4A] transition-colors px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="group relative px-8 py-3.5 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(193,154,74,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span className="relative z-10">{isUploading ? 'Uploading...' : 'Upload'}</span>
                  {!isUploading && (
                    <i className="fa-solid fa-arrow-right relative z-10 text-sm group-hover:translate-x-1 transition-transform"></i>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#d9b563] to-[#C19A4A] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </main>

      {/* Pending Upload Modal */}
      <AnimatePresence>
        {showPendingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0B0F1B]/90 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500 max-w-sm w-full shadow-2xl"
            >
              <div className="bg-[#111625] rounded-[14px] p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(193,154,74,0.1)_0%,transparent_70%)]" />
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#C19A4A] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white relative z-10">Submitting Proof...</h3>
                <p className="text-gray-400 text-xs leading-relaxed relative z-10">
                  Please wait for your documents.<br />This may take a few moments.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal – Shown after instant verification */}
      <AnimatePresence>
        {showSubmittedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0B0F1B]/90 backdrop-blur-sm z-[60] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#22c55e] to-blue-500 max-w-sm w-full shadow-2xl"
            >
              <div className="bg-[#111625] rounded-[14px] p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)]" />

                <button
                  onClick={() => {
                    setShowSubmittedModal(false);
                    setIsUploading(false);
                    resetAll();
                  }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-20"
                  aria-label="Close"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="mb-6 relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                  >
                    <i className="fa-solid fa-check-circle text-green-400 text-4xl"></i>
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Verification Submitted!</h3>
                  <p className="text-gray-300 text-xs leading-relaxed px-2">
                    Your proof has been successfully submitted!
                  </p>
                </div>

                <div className="flex gap-3 mt-8 relative z-10">
                  <button
                    onClick={() => {
                      setShowSubmittedModal(false);
                      setIsUploading(false);
                      resetAll();
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                  >
                    Upload Another
                  </button>
                  <button
                    onClick={() => (window.location.href = '/dashboard')}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] text-sm font-bold hover:shadow-[0_0_20px_rgba(193,154,74,0.4)] transition-all"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default Upload;
