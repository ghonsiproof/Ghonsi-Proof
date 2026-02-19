
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
import { getCurrentUser } from '../../utils/supabaseAuth';
import { uploadProof } from '../../utils/proofsApi';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import './upload.css';

function Upload() {
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
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  /**
   * Proof type requirements and validation rules
   * Defines placeholder text, valid evidence types, and restricted content for each proof category
   */
  const proofRequirements = {
    certificates: {
      summaryPlaceholder: "Enter: Certificate Title, Issuer Name, Completion Date, Credential Type (Course/Bootcamp), and Instructor Names...",
      validEvidences: [
        "Full certificate file (PDF, PNG, screenshot)",
        "Certificate link",
        "Official issuer message confirming completion of training",
        "Link to public graduate announcement (if issuer posts those)",
      ],
      notAllowed: "NDA-covered materials, proprietary internal tools, certificate PDFs with watermarks forbidding redistribution, documents showing sensitive internal company data."
    },
    job_history: {
      summaryPlaceholder: "Enter: Job Title, Employer Name, Employment Type, Start/End Dates, Job Category,  Internal Work Experience ID...",
      validEvidences: [
        "Snapshot of offer letter (redacted salary)",
        "HR email confirming employment",
        "Work badge snapshot",
        "Public team page snapshot where user’s name appears (if applicable)",
        "GitHub contribution logs linked to the company repo",
        "Public posts (LinkedIn) from the employer announcing new hires"        
      ],
      notAllowed: "Confidential HR portals, salary details, internal documentation, private client data, or anything uniquely traceable to a person."
    },
    skills: {
      summaryPlaceholder: "Enter: Skill Name (e.g., Solidity), Proficiency Level (e.g., Beginner/Intermediate/Advanced) , Skill Category, Internal Skill ID...",
      validEvidences: [
        "GitHub activity screenshots",
        "Snippets of work (non-sensitive)",
        "Public portfolio links",
        "Dribbble/Behance links",
        "Snapshots of skill tests (without sensitive user info)"
      ],
      notAllowed: "Proprietary materials, private client work, snapshots of codebases belonging to employers, or any IP you don't own."
    },
    milestones: {
      summaryPlaceholder: "Enter: Milestone Type (Promotion/Award), Issuer Name, Month & Year, Milestone Summary...",
      validEvidences: [
        "Screenshot of award announcement",
        "Email confirming promotion",
        "Public recognition posts",
        "Certificate of achievement",
        "Screenshot of internal dashboard badge (non-sensitive)"
      ],
      notAllowed: "Performance reviews, salary information, internal feedback, or data regarding other employees."
    },
    community: {
      summaryPlaceholder: "Enter: Contribution Type (Talk, Article, Open Source), Platform Name, Date...",
      validEvidences: [
        "Link to article, talk, or recording",
        "Screenshot of Speaking Engagement Flyer",
        "Screenshot of GitHub PR",
        "Screenshot of community role announcement"
      ],
      notAllowed: "Sensitive community data or private correspondence."
    }
  };
  
  // Dropdown options for proof types
  const proofOptions = [
    { value: 'certificates', label: 'Certificates / Trainings' },
    { value: 'job_history', label: 'Job History (Work Experience)' },
    { value: 'skills', label: 'Skills / Competencies' },
    { value: 'milestones', label: 'Career Milestones (Promotions / Awards)' },
    { value: 'community', label: 'Community Contributions / Public Work' }
  ];
  
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
   * @param {string} value - Selected proof type value
   */
  const handleProofTypeSelect = (value) => {
    setProofType(value);
    setIsDropdownOpen(false);
    setShowInstructions(true);
  };
  
  /**
   * Validates uploaded file against type and size constraints
   * @param {File} file - File object to validate
   * @returns {string|null} Error message if validation fails, null if valid
   */
  const validateFile = (file) => {
    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/i)) {
      return `"${file.name}" is not a supported format.`;
    }
    // Check file size
    if (file.size > MAX_SIZE) {
      return `"${file.name}" exceeds the 2MB size limit.`;
    }
    return null;
  };
  
  /**
   * Handles reference file selection and validation
   * Only allows a single file to be uploaded at a time
   * @param {File[]} files - Array of files from input or drop event
   */
  const handleReferenceFiles = (files) => {
    setSupportingError('');
    if (files.length === 0) return;
    
    const file = files[0];
    const error = validateFile(file);
    
    if (error) {
      setSupportingError(error);
      setTimeout(() => setSupportingError(''), 5000); // Auto-clear error after 5s
      return;
    }
    
    setReferenceFiles([file]);
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
   * Validates required fields, authenticates user, and submits proof data
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    
    let hasError = false;
    
    // Validate required fields
    if (!proofName.trim() || !summary.trim() || !proofType) {
      setUploadError('Please fill in all required fields.');
      hasError = true;
    }
    
    // Reference document is mandatory
    if (referenceFiles.length === 0) {
      setSupportingError('A Reference Document is required.');
      hasError = true;
    }
    
    if (hasError) return;
    
    setIsUploading(true);
    setShowPendingModal(true);
    
    try {
      // Authenticate user before upload
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('You must be logged in to upload proofs');
      }
      
      // Prepare proof data payload
      const proofData = {
        proofType: proofType,
        proofName: proofName,
        summary: summary,
        referenceLink: referenceLink || null
      };
      
      // Submit proof with reference document
      await uploadProof(proofData, [], [referenceFiles[0]]);
      
      // Show success modal after upload completes
      setTimeout(() => {
        setShowPendingModal(false);
        setTimeout(() => setShowSubmittedModal(true), 300);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload proof');
      setShowPendingModal(false);
      setIsUploading(false);
    }
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
    <>
      <Header />
      <main className="flex-grow px-4 py-8 max-w-none mx-auto w-full mt-[105px]">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Upload Your Proof</h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Add a new proof to your on-chain portfolio<br />and get it verified by our community
          </p>
        </div>
        
        {/* Main Form Container */}
        <div className="border border-gray-700 rounded-xl p-5 mb-6 relative bg-brand-card">
          {/* Error Alert */}
          {uploadError && (
            <div className="mb-5 p-3 rounded-lg text-sm bg-red-500/20 text-red-400 border border-red-500/30">
              {uploadError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Proof Name Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Proof Name *</label>
              <input
                type="text"
                value={proofName}
                onChange={(e) => setProofName(e.target.value)}
                placeholder="e.g., Senior Frontend Developer Certification"
                className={`w-full bg-transparent border rounded px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none transition-colors ${!proofName.trim() && 'border-brand-gold'}`}
              />
            </div>
            
            {/* Proof Type Dropdown */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label className="text-sm font-medium">Proof Type *</label>
              <div className={`custom-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="custom-dropdown-selected w-full bg-transparent border border-brand-gold rounded px-3 py-2.5 text-sm cursor-pointer flex justify-between items-center hover:border-white transition-colors"
                >
                  <span className={proofType ? 'text-white' : 'text-gray-500'}>
                    {proofType ? proofOptions.find(opt => opt.value === proofType)?.label : 'Select proof type'}
                  </span>
                  <i className={`fa-solid ${isDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'} text-xs`}></i>
                </div>
                {isDropdownOpen && (
                  <div className="custom-dropdown-options shadow-xl">
                    {proofOptions.map(option => (
                      <div
                        key={option.value}
                        onClick={() => handleProofTypeSelect(option.value)}
                        className={`custom-option ${proofType === option.value ? 'selected' : ''}`}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Summary Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Summary *</label>
              <div className="relative">
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows="4"
                  maxLength="500"
                  className="w-full bg-transparent border border-brand-gold rounded px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none resize-none"
                  placeholder={currentRequirements?.summaryPlaceholder || "Describe your achievement, skills demonstrated or work completed"}
                />
                <div className={`text-right text-xs mt-1 ${summary.length >= 500 ? 'text-red-500' : 'text-gray-400'}`}>
                  {summary.length}/500 characters
                </div>
              </div>
            </div>
            
            {/* Dynamic Instructions Panel - Shows required evidence based on proof type */}
            {showInstructions && currentRequirements && (
              <div className="bg-brand-gold/5 border border-brand-gold/20 rounded p-4 text-xs transition-all duration-300">
                <h4 className="text-brand-gold font-bold mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-clipboard-check"></i> Required Evidence
                </h4>
                <p className="text-gray-300 mb-2 font-medium">Please ensure your Reference Document includes:</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-400 mb-3">
                  {currentRequirements.validEvidences.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <div className="bg-red-500/10 border-l-2 border-red-500/50 p-2 mt-2">
                  <span className="text-red-300 font-bold block mb-1">Not Allowed:</span>
                  <p className="text-gray-400 italic">{currentRequirements.notAllowed}</p>
                </div>
              </div>
            )}
            
            {/* Reference Link Field (Optional) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reference Link</label>
              <input
                type="url"
                value={referenceLink}
                onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="https://github.com/project or https://certificate-url.com"
                className="w-full bg-transparent border border-brand-gold rounded px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-gray-300">Optional: Link to GitHub repo, certificate URL, or other relevant documentation</p>
            </div>
            
            {/* File Upload Area with Drag & Drop */}
            <div className="space-y-1.5 pt-2">
              <label className="flex items-center justify-between text-sm font-medium">
                <span>Reference Document *</span>
                <span className="flex items-center gap-2"><i className="fa-regular fa-circle-question"></i>Get Help</span>
              </label>
              <div
                onClick={() => referenceFileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  handleReferenceFiles(Array.from(e.dataTransfer.files));
                }}
                className="border border-dashed border-gray-500 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group relative"
              >
                <div className="w-8 h-8 rounded flex items-center justify-center border border-brand-gold text-brand-gold mb-3 group-hover:bg-brand-gold group-hover:text-black transition-colors">
                  <i className="fa-solid fa-arrow-up-from-bracket text-sm"></i>
                </div>
                <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-[10px] text-gray-400">PDF, JPG, PNG, DOC up to 2MB</p>
                <input
                  ref={referenceFileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleReferenceFiles(Array.from(e.target.files))}
                />
              </div>
              
              {/* Selected File Display */}
              {referenceFiles.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {referenceFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-white/5 border border-gray-700 rounded px-3 py-2 text-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <i className={`fa-solid ${getFileIcon(file)} text-brand-gold/70`}></i>
                        <span className="truncate text-gray-300 max-w-[150px]">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        {isExtracting && (
                          <span className="text-xs text-brand-gold flex items-center gap-1">
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            Extracting...
                          </span>
                        )}
                      </div>
                      <button type="button" onClick={() => setReferenceFiles([])} className="text-gray-500 hover:text-red-400 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* File Error Display */}
              {supportingError && (
                <p className="text-red-500 text-xs bg-red-500/10 p-2 rounded border border-red-500/50 text-center mt-2">{supportingError}</p>
              )}
            </div>
            
            {/* Upload Requirements Info Box */}
            <div className="border border-brand-gold rounded-xl p-4 bg-brand-gold/5">
              <h4 class="text-brand-gold text-sm font-medium mb-2 flex items-center gap-2"><i class="fa-solid fa-circle-exclamation"></i> Upload Requirements</h4>
              <ul class="text-[11px] text-white space-y-1 list-none pl-1">
                <li class="flex gap-2 items-start"><span class="text-white text-[6px] mt-1.5">●</span> Reference document is required</li>
                <li class="flex gap-2 items-start"><span class="text-white text-[6px] mt-1.5">●</span> Maximum file size: 2MB per document</li>
                <li class="flex gap-2 items-start"><span class="text-white text-[6px] mt-1.5">●</span> Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
                <li class="flex gap-2 items-start"><span class="text-white text-[6px] mt-1.5">●</span> Documents should clearly show your achievement or work</li>
              </ul>
            </div>
            
            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4">
              <button type="button" onClick={resetAll} className="text-white text-sm font-medium hover:text-brand-gold transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="bg-brand-gold text-[#0B0F1B] px-5 py-3 rounded font-semibold text-sm hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      {/* Pending Upload Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center px-4">
          <div className="bg-brand-card border border-brand-border rounded-xl max-w-sm w-full p-8 relative text-center shadow-2xl">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-brand-gold rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Submitting Proof...</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Please wait for your documents.<br />This may take a few moments.
            </p>
          </div>
        </div>
      )}
      
      {/* Success Modal - Shown after instant verification */}
      {showSubmittedModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center px-4">
          <div className="bg-brand-card border border-brand-border rounded-xl max-w-sm w-full p-8 relative text-center shadow-2xl">
            <button
              onClick={() => {
                setShowSubmittedModal(false);
                setIsUploading(false);
                resetAll();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-4">
              <div className="flex items-center justify-center mb-3">
                <i className="fa-solid fa-check-circle text-green-500 text-3xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Verification Submitted!</h3>
              <p className="text-gray-300 text-xs mb-8 leading-relaxed px-2">
                Your proof has been successfully submitted!
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSubmittedModal(false);
                  setIsUploading(false);
                  resetAll();
                }}
                className="flex-1 py-2.5 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Upload Another
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 py-2.5 rounded-lg bg-brand-gold text-[#0B0F1B] text-sm font-semibold hover:bg-yellow-600 transition-colors"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
}

export default Upload;
