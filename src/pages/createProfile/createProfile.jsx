import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/supabaseAuth';
import { createProfile, getProfile, updateProfile } from '../../utils/profileApi';
import { saveFormData, getFormData, clearFormData } from '../../utils/formPersistence';
import { supabase } from '../../config/supabaseClient';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import { ArrowLeft, ArrowRight, User, Award, Share2, Settings, Camera, Upload, ChevronDown, Check } from 'lucide-react';

function CreateProfile() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingProfileId, setExistingProfileId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', emailAddress: '', phoneNumber: '', location: '',
    professionalTitle: '', professionalBio: '', skills: '', experience: '',
    website: '', github: '', twitter: '', linkedin: '',
    visibility: 'Public - Anyone can view', emailNotifications: false
  });
  const [errors, setErrors] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);

  const totalSteps = 3;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First, try to restore saved form data (in case of page refresh)
        const savedFormData = getFormData('createProfile');
        if (savedFormData) {
          console.log('Restoring saved form data');
          setFormData(savedFormData.formData);
          setCurrentStep(savedFormData.currentStep || 1);
          if (savedFormData.profilePhoto) {
            setProfilePhoto(savedFormData.profilePhoto);
          }
          return; // Don't load from DB if we have recent form data
        }

        const user = await getCurrentUser();
        if (!user) return;

        // Load email (may be null for wallet-only users)
        setFormData(prev => ({ ...prev, emailAddress: user.email || '' }));

        // Try to load existing profile
        const profile = await getProfile(user.id);
        
        if (profile) {
          // Profile exists - populate form with existing data
          setIsEditMode(true);
          setExistingProfileId(profile.id);
          
          setFormData({
            fullName: profile.display_name || '',
            emailAddress: user.email || '',
            phoneNumber: profile.social_links?.phone || '',
            location: profile.location || '',
            professionalTitle: profile.profession || '',
            professionalBio: profile.bio || '',
            skills: profile.social_links?.skills || '',
            experience: profile.social_links?.experience || '',
            website: profile.social_links?.website || '',
            github: profile.social_links?.github || '',
            twitter: profile.social_links?.twitter || '',
            linkedin: profile.social_links?.linkedin || '',
            visibility: profile.is_public ? 'Public - Anyone can view' : 'Private - Only you can view',
            emailNotifications: false
          });

          // Load avatar if exists
          if (profile.avatar_url) {
            setProfilePhoto({ preview: profile.avatar_url, file: null });
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Auto-save form data whenever it changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveFormData('createProfile', {
        formData,
        currentStep,
        profilePhoto: profilePhoto ? { preview: profilePhoto.preview, file: null } : null,
      });
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(saveTimeout);
  }, [formData, currentStep, profilePhoto]);

  const handlePhotoUpload = (e) => {
    setPhotoError('');
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setPhotoError('File too large. Max size is 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          if (img.width < 200 || img.height < 200) {
            setPhotoError('Image too small. Minimum dimensions are 200x200px.');
          } else {
            // Store both the preview URL and the file
            setProfilePhoto({ preview: event.target.result, file });
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      const nameValue = formData.fullName.trim();
      const parts = nameValue.split(' ').filter(part => part.length > 0);
      const nameRegex = /^[a-zA-Z\u00C0-\u00FF]+(['-][a-zA-Z\u00C0-\u00FF]+)*$/;
      if (parts.length < 2 || parts.some(part => part.length < 2 || !nameRegex.test(part))) {
        newErrors.fullName = 'Please enter a valid full name (e.g. First Last)';
      }
      // Email is optional for wallet-only users
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.emailAddress.trim() && !emailRegex.test(formData.emailAddress.trim())) {
        newErrors.emailAddress = 'Please enter a valid email address';
      }
    }
    if (step === 2) {
      if (formData.professionalBio.trim().length < 10) {
        newErrors.professionalBio = 'Bio must be at least 10 characters';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final step - save profile to Supabase
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('You must be logged in to create a profile');
        }

        let avatarUrl = null;

        // Upload profile photo if provided and it's a new file
        if (profilePhoto && profilePhoto.file) {
          const fileExt = profilePhoto.file.name.split('.').pop();
          const fileName = `${user.id}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('proof-files')
            .upload(filePath, profilePhoto.file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload profile photo');
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('proof-files')
            .getPublicUrl(filePath);

          avatarUrl = publicUrl;
        } else if (profilePhoto && profilePhoto.preview && !profilePhoto.file) {
          // Keep existing avatar URL if no new file uploaded
          avatarUrl = profilePhoto.preview;
        }

        // Prepare profile data matching the database schema
        const profileData = {
          display_name: formData.fullName,
          email: formData.emailAddress || user.email || null,
          bio: formData.professionalBio || null,
          profession: formData.professionalTitle || null,
          location: formData.location || null,
          avatar_url: avatarUrl,
          social_links: {
            website: formData.website || null,
            github: formData.github || null,
            twitter: formData.twitter || null,
            linkedin: formData.linkedin || null,
            phone: formData.phoneNumber || null,
            skills: formData.skills || null,
            experience: formData.experience || null
          },
          is_public: formData.visibility === 'Public - Anyone can view'
        };

        // Update existing profile or create new one
        if (isEditMode && existingProfileId) {
          await updateProfile(user.id, profileData);
        } else {
          await createProfile({ user_id: user.id, ...profileData });
        }
        
        clearFormData('createProfile'); // Clear saved form data after successful submission
        setShowSuccess(true);
      } catch (error) {
        console.error('Profile save error:', error);
        setSubmitError(error.message || 'Failed to save profile');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0B0F1B] text-white font-sans selection:bg-[#C19A4A] selection:text-black mt-[105px]">
        <main className="flex-grow max-w-full mx-auto px-6 py-8">
          <a href="/dashboard" className="inline-flex items-center text-[#C19A4A] text-sm mb-8 hover:underline gap-1 font-light tracking-wide">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>

          {!showSuccess && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-white tracking-tight">{isEditMode ? 'Edit Your Profile' : 'Create Your Profile'}</h1>
                <p className="text-white/60 text-sm font-light leading-relaxed">{isEditMode ? 'Update your professional Web3 identity and credentials' : 'Build your professional Web3 identity and showcase your verified credentials'}</p>
              </div>

              <div className="flex justify-between items-start mb-12 w-full px-1">
                {[1, 2, 3].map((step, idx) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-2 bg-[#0B0F1B] z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                        step < currentStep ? 'border-[#C19A4A] text-[#C19A4A]' :
                        step === currentStep ? 'bg-[#C19A4A] border-[#C19A4A] text-white' :
                        'border-white/20 text-white/40 bg-[#0B0F1B]'
                      }`}>
                        {step === 1 && <User className="w-4 h-4" />}
                        {step === 2 && <Award className="w-4 h-4" />}
                        {step === 3 && <Share2 className="w-4 h-4" />}
                        {step === 4 && <Settings className="w-4 h-4" />}
                      </div>
                      <span className={`text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold mt-1 ${
                        step <= currentStep ? 'text-[#C19A4A]' : 'text-white/40'
                      }`}>
                        {step === 1 && 'Basic Info'}
                        {step === 2 && 'Professional'}
                        {step === 3 && 'Social Links'}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className={`h-[1px] flex-auto mt-4 mx-1 transition-colors duration-500 ${
                        currentStep > step ? 'bg-white' : 'bg-white/10'
                      }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}

          {showSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-12 animate-[scaleIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 ring-1 ring-green-500/30 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-semibold text-white mb-3">{isEditMode ? 'Profile Updated!' : 'Profile Created!'}</h2>
              <p className="text-white/60 text-sm mb-10 max-w-xs mx-auto leading-relaxed">{isEditMode ? 'Your Web3 identity has been successfully updated.' : 'Your Web3 identity has been successfully established on Ghonsi Proof.'}</p>
              <button onClick={() => navigate('/dashboard')} className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-bold px-8 py-3.5 rounded-lg shadow-lg shadow-[#C19A4A]/20 transition-all transform hover:scale-105 active:scale-95 w-full max-w-xs flex items-center justify-center gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()}>
              {currentStep === 1 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-white mb-1">Basic Information</h2>
                    <p className="text-xs text-white/50 font-light">Tell us about yourself. This information will be visible on your public profile.</p>
                  </div>

                  <div className="mb-8">
                    <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-4">Profile Photo</label>
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex-shrink-0 hover:border-[#C19A4A]/50 transition-colors cursor-pointer group relative overflow-hidden bg-cover bg-center"
                        style={profilePhoto?.preview ? { backgroundImage: `url(${profilePhoto.preview})` } : {}}
                        onClick={() => document.getElementById('fileInput').click()}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <input type="file" id="fileInput" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handlePhotoUpload} />
                        <button type="button" onClick={() => document.getElementById('fileInput').click()} className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-xs font-semibold px-5 py-2.5 rounded transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
                          Upload Photo <Upload className="w-3 h-3" />
                        </button>
                        <p className="text-[10px] text-white/40 mt-2.5 font-light">JPG, PNG or GIF. Max size 2MB. Recommended: 400x400px</p>
                        {photoError && <p className="text-red-500 text-[10px] mt-1">{photoError}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Full Name *</label>
                      <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Enter your full name" className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation ${errors.fullName ? 'border-red-500 animate-[shake_0.5s]' : 'border-white/20'}`} />
                      {errors.fullName && <span className="text-red-500 text-[10px] mt-1 block">{errors.fullName}</span>}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Email Address</label>
                      <input name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} type="email" placeholder="Youremail@example.com (optional for wallet users)" className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation ${errors.emailAddress ? 'border-red-500 animate-[shake_0.5s]' : 'border-white/20'}`} />
                      {errors.emailAddress && <span className="text-red-500 text-[10px] mt-1 block">{errors.emailAddress}</span>}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Phone Number</label>
                      <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} type="tel" placeholder="+234890124832" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Location</label>
                      <input name="location" value={formData.location} onChange={handleInputChange} type="text" placeholder="Enter your city, country" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-white mb-1">Professional Information</h2>
                    <p className="text-xs text-white/50 font-light">Showcase your expertise and experience in the Web3 space.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Professional Title</label>
                      <input name="professionalTitle" value={formData.professionalTitle} onChange={handleInputChange} type="text" placeholder="e.g, smart contract developer, web3 designer" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Bio *</label>
                      <textarea name="professionalBio" value={formData.professionalBio} onChange={handleInputChange} rows="4" placeholder="Tell us about yourself, your experience, and what you are passionate about...." className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all resize-none ${errors.professionalBio ? 'border-red-500' : 'border-white/20'}`} />
                      <div className="flex justify-between mt-1.5">
                        {errors.professionalBio && <span className="text-red-500 text-[10px]">{errors.professionalBio}</span>}
                        <div className="text-[10px] text-white/40 ml-auto">{formData.professionalBio.length}/500 characters</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Skills</label>
                      <input name="skills" value={formData.skills} onChange={handleInputChange} type="text" placeholder="e.g., solidity, Rust, React, web3.js" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                      <div className="text-right text-[10px] text-white/40 mt-1.5">Separate skills with commas</div>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Years of Experience</label>
                      <div className="relative">
                        <div onClick={() => setIsExperienceOpen(!isExperienceOpen)} className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white cursor-pointer flex justify-between items-center">
                          <span className={formData.experience ? 'text-white' : 'text-white/50'}>{formData.experience || 'Select years of experience'}</span>
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        </div>
                        {isExperienceOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-[#0B0F1B] border border-white/20 rounded-lg overflow-hidden">
                            {['0-1 Years', '1-3 Years', '3-5 Years', '5+ Years'].map(exp => (
                              <div key={exp} onClick={() => { setFormData(prev => ({ ...prev, experience: exp })); setIsExperienceOpen(false); }} className="px-4 py-2 text-sm text-white hover:bg-white/10 cursor-pointer">
                                {exp}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-white mb-1">Social Links</h2>
                    <p className="text-xs text-white/50 font-light">Connect your social profiles to build credibility and expand your network.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Personal Website</label>
                      <input name="website" value={formData.website} onChange={handleInputChange} type="url" placeholder="http://yourwebsite.com" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">GitHub</label>
                      <input name="github" value={formData.github} onChange={handleInputChange} type="text" placeholder="github.com/username" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Twitter / X</label>
                      <input name="twitter" value={formData.twitter} onChange={handleInputChange} type="text" placeholder="twitter.com/username" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">LinkedIn</label>
                      <input name="linkedin" value={formData.linkedin} onChange={handleInputChange} type="text" placeholder="linkedin.com/in/yourusername" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all touch-manipulation" />
                    </div>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {submitError}
                </div>
              )}

              <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
                <button type="button" onClick={handlePrev} className={`text-[#C19A4A] text-sm font-medium flex items-center gap-1 transition-all hover:-translate-x-1 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-6">
                  <button type="button" className="text-[#C19A4A] hover:text-[#A8863D] text-sm font-medium transition-colors">Cancel</button>
                  <button 
                    type="button" 
                    onClick={handleNext} 
                    disabled={isSubmitting}
                    className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#C19A4A]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>Saving...</>
                    ) : currentStep === totalSteps ? (
                      <>{isEditMode ? 'Update' : 'Submit'} <Check className="w-4 h-4" /></>
                    ) : (
                      <>Next <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

export default CreateProfile;
