import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../../utils/supabaseAuth';
import { uploadProof } from '../../utils/proofsApi';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import './upload.css';

function Upload() {
  const [proofType, setProofType] = useState('');
  const [proofName, setProofName] = useState('');
  const [summary, setSummary] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [supportingFiles, setSupportingFiles] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [referenceError, setReferenceError] = useState('');
  const [supportingError, setSupportingError] = useState('');

  const dropdownRef = useRef(null);
  const referenceFileInputRef = useRef(null);
  const supportingFileInputRef = useRef(null);

  const MAX_SIZE = 2 * 1024 * 1024;
  const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const proofRequirements = {
    certificates: {
      summaryPlaceholder: "Enter: Certificate Title, Issuer Name, Completion Date, Credential Type (Course/Bootcamp), and Instructor Names...",
      validEvidences: [
        "Full certificate file (PDF, PNG, screenshot)",
        "Email confirmation screenshot",
        "LMS dashboard showing 'Completed'",
        "Screenshot of 'Congratulations, you passed'",
        "Official issuer message confirming completion"
      ],
      notAllowed: "NDA-covered materials, proprietary internal tools, certificate PDFs with watermarks forbidding redistribution."
    },
    job_history: {
      summaryPlaceholder: "Enter: Job Title, Employer Name, Employment Type, Start/End Dates, Job Category...",
      validEvidences: [
        "Screenshot of offer letter (redacted salary)",
        "Proof of workspace (company welcome message)",
        "LinkedIn announcement from company",
        "Work dashboard screenshot (non-sensitive)",
        "HR email confirming employment"
      ],
      notAllowed: "Confidential HR portals, salary details, internal documentation, private client data, or anything uniquely traceable to a person."
    },
    skills: {
      summaryPlaceholder: "Enter: Skill Name (e.g., Solidity), Proficiency Level, Skill Category...",
      validEvidences: [
        "GitHub activity screenshots",
        "Snippets of work (non-sensitive)",
        "Public portfolio links",
        "Dribbble/Behance links",
        "Screenshots of skill tests (without sensitive user info)"
      ],
      notAllowed: "Proprietary materials, private client work, codebases belonging to employers, or any IP you don't own."
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

  const proofOptions = [
    { value: 'certificates', label: 'Certificates / Trainings' },
    { value: 'job_history', label: 'Job History (Work Experience)' },
    { value: 'skills', label: 'Skills / Competencies' },
    { value: 'milestones', label: 'Career Milestones (Promotions / Awards)' },
    { value: 'community', label: 'Community Contributions / Public Work' }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleProofTypeSelect = (value) => {
    setProofType(value);
    setIsDropdownOpen(false);
    setShowInstructions(true);
  };

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/i)) {
      return `"${file.name}" is not a supported format.`;
    }
    if (file.size > MAX_SIZE) {
      return `"${file.name}" exceeds the 2MB size limit.`;
    }
    return null;
  };

  const handleReferenceFiles = (files) => {
    setReferenceError('');
    if (files.length === 0) return;
    const file = files[0];
    const error = validateFile(file);
    if (error) {
      setReferenceError(error);
      setTimeout(() => setReferenceError(''), 5000);
      return;
    }
    setReferenceFiles([file]);
  };

  const handleSupportingFiles = (files) => {
    setSupportingError('');
    if (files.length === 0) return;
    const file = files[0];
    const error = validateFile(file);
    if (error) {
      setSupportingError(error);
      setTimeout(() => setSupportingError(''), 5000);
      return;
    }
    setSupportingFiles([file]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    let hasError = false;

    if (!proofName.trim() || !summary.trim() || !proofType) {
      setUploadError('Please fill in all required fields.');
      hasError = true;
    }

    if (supportingFiles.length === 0) {
      setSupportingError('A Supporting Document is required.');
      hasError = true;
    }

    const isLinkPresent = !!referenceLink.trim();
    const isReferenceFilePresent = referenceFiles.length > 0;
    const isSupportingFilePresent = supportingFiles.length > 0;
    const filledCount = (isLinkPresent ? 1 : 0) + (isReferenceFilePresent ? 1 : 0) + (isSupportingFilePresent ? 1 : 0);

    if (filledCount < 2) {
      if (!isReferenceFilePresent) {
        setReferenceError("Please provide a Reference Link or a Reference Image.");
      }
      setSupportingError("You must fill at least two fields among Reference Link, Reference Image, and Supporting Document.");
      hasError = true;
    }

    if (hasError) return;

    setIsUploading(true);
    setShowPendingModal(true);

    try {
      // Get current user
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('You must be logged in to upload proofs');
      }

      // Prepare proof data
      const proofData = {
        proofType: proofType,
        proofName: proofName,
        summary: summary,
        referenceLink: referenceLink || null
      };

      // Upload with files
      await uploadProof(proofData, [referenceFiles[0] || null].filter(Boolean), [supportingFiles[0]]);

      // Success
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

  const resetAll = () => {
    setProofType('');
    setProofName('');
    setSummary('');
    setReferenceLink('');
    setReferenceFiles([]);
    setSupportingFiles([]);
    setShowInstructions(false);
    setReferenceError('');
    setSupportingError('');
    setUploadError('');
    setIsUploading(false);
  };

  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) return 'fa-file-pdf';
    if (file.type.includes('image')) return 'fa-file-image';
    if (file.type.includes('word') || file.name.includes('doc')) return 'fa-file-word';
    return 'fa-file';
  };

  const currentRequirements = proofType ? proofRequirements[proofType] : null;

  return (
    <>
      <Header />
      <main className="flex-grow px-4 py-8 max-w-none sm:max-w-lg mx-auto w-full mt-[105px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Upload Your Proof</h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Add a new proof to your on-chain portfolio<br />and get it verified by our community
          </p>
        </div>

        <div className="border border-gray-700 rounded-xl p-5 mb-6 relative bg-brand-card">
          {uploadError && (
            <div className="mb-5 p-3 rounded-lg text-sm bg-red-500/20 text-red-400 border border-red-500/30">
              {uploadError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
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

            {showInstructions && currentRequirements && (
              <div className="bg-brand-gold/5 border border-brand-gold/20 rounded p-4 text-xs transition-all duration-300">
                <h4 className="text-brand-gold font-bold mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-clipboard-check"></i> Required Evidence
                </h4>
                <p className="text-gray-300 mb-2 font-medium">Please ensure your Supporting Document or Reference Image includes:</p>
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

            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-medium">Reference Image</label>
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
              {referenceFiles.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {referenceFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-white/5 border border-gray-700 rounded px-3 py-2 text-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <i className={`fa-solid ${getFileIcon(file)} text-brand-gold/70`}></i>
                        <span className="truncate text-gray-300 max-w-[150px]">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button type="button" onClick={() => setReferenceFiles([])} className="text-gray-500 hover:text-red-400 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {referenceError && (
                <p className="text-red-500 text-xs bg-red-500/10 p-2 rounded border border-red-500/50 text-center mt-2">{referenceError}</p>
              )}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="flex items-center justify-between text-sm font-medium">
                <span>Supporting Document *</span>
                <span className="flex items-center gap-2"><i className="fa-regular fa-circle-question"></i>Get Help</span>
              </label>
              <div
                onClick={() => supportingFileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  e.preventDefault();
                  handleSupportingFiles(Array.from(e.dataTransfer.files));
                }}
                className="border border-dashed border-gray-500 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group relative"
              >
                <div className="w-8 h-8 rounded flex items-center justify-center border border-brand-gold text-brand-gold mb-3 group-hover:bg-brand-gold group-hover:text-black transition-colors">
                  <i className="fa-solid fa-arrow-up-from-bracket text-sm"></i>
                </div>
                <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-[10px] text-gray-400">PDF, JPG, PNG, DOC up to 2MB</p>
                <input
                  ref={supportingFileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleSupportingFiles(Array.from(e.target.files))}
                />
              </div>
              {supportingFiles.length > 0 && (
                <ul className="space-y-2 mt-2">
                  {supportingFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-white/5 border border-gray-700 rounded px-3 py-2 text-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <i className={`fa-solid ${getFileIcon(file)} text-brand-gold/70`}></i>
                        <span className="truncate text-gray-300 max-w-[150px]">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button type="button" onClick={() => setSupportingFiles([])} className="text-gray-500 hover:text-red-400 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {supportingError && (
                <p className="text-red-500 text-xs bg-red-500/10 p-2 rounded border border-red-500/50 text-center mt-2">{supportingError}</p>
              )}
            </div>

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

      {showSubmittedModal && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center px-4">
          <div className="bg-brand-card border border-brand-border rounded-xl max-w-sm w-full p-8 relative text-center shadow-2xl">
            {/* Close Button */}
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
              <h3 className="text-xl font-semibold mb-3 text-white">Verification Submitted!</h3>
              <p className="text-gray-300 text-xs mb-8 leading-relaxed px-2">
                Your proof has been successfully submitted!
              </p>
              <div className="p-3 bg-white/5 rounded border border-white/10 text-left">
                <h4 className="text-sm font-semibold mb-2 text-brand-gold">Verification Process</h4>
                <ul className="text-[11px] text-white space-y-1 list-none pl-1">
                  <li className="flex gap-2 items-start"><span className="text-white text-[6px] mt-1.5">●</span> Your proof will be reviewed by our verification team</li>
                  <li className="flex gap-2 items-start"><span className="text-white text-[6px] mt-1.5">●</span> Verification typically takes 2-5 business days</li>
                  <li className="flex gap-2 items-start"><span className="text-white text-[6px] mt-1.5">●</span> Once verified, your proof will be recorded on-chain</li>
                  <li className="flex gap-2 items-start"><span className="text-white text-[6px] mt-1.5">●</span> You'll receive a notification when verification is complete</li>
                </ul>
              </div>
            </div>
            
            {/* Action Buttons */}
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
