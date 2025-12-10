import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import { ArrowLeft, ArrowRight, User, Award, Share2, Settings, Camera, Upload, ChevronDown, Check, ShieldCheck } from 'lucide-react';

function CreateProfile() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
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

  const totalSteps = 4;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

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
            setProfilePhoto(event.target.result);
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailAddress.trim())) {
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

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowSuccess(true);
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
        <main className="flex-grow w-full max-w-lg mx-auto md:max-w-2xl px-6 py-8">
          <a href="/dashboard" className="inline-flex items-center text-[#C19A4A] text-sm mb-8 hover:underline gap-1 font-light tracking-wide">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>

          {!showSuccess && (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-semibold mb-3 text-white tracking-tight">Create Your Profile</h1>
                <p className="text-white/60 text-sm font-light leading-relaxed">Build your professional Web3 identity and showcase your verified credentials</p>
              </div>

              <div className="flex justify-between items-start mb-12 w-full px-1">
                {[1, 2, 3, 4].map((step, idx) => (
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
                        {step === 4 && 'Preferences'}
                      </span>
                    </div>
                    {idx < 3 && (
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
              <h2 className="text-3xl font-semibold text-white mb-3">Profile Created!</h2>
              <p className="text-white/60 text-sm mb-10 max-w-xs mx-auto leading-relaxed">Your Web3 identity has been successfully established on Ghonsi Proof.</p>
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
                        style={profilePhoto ? { backgroundImage: `url(${profilePhoto})` } : {}}
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
                      <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Enter your full name" className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all ${errors.fullName ? 'border-red-500 animate-[shake_0.5s]' : 'border-white/20'}`} />
                      {errors.fullName && <span className="text-red-500 text-[10px] mt-1 block">{errors.fullName}</span>}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Email Address *</label>
                      <input name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} type="email" placeholder="Youremail@example.com" className={`w-full bg-transparent border rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all ${errors.emailAddress ? 'border-red-500 animate-[shake_0.5s]' : 'border-white/20'}`} />
                      {errors.emailAddress && <span className="text-red-500 text-[10px] mt-1 block">{errors.emailAddress}</span>}
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Phone Number</label>
                      <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} type="tel" placeholder="+234890124832" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Location</label>
                      <input name="location" value={formData.location} onChange={handleInputChange} type="text" placeholder="Enter your city, country" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all" />
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
                      <input name="professionalTitle" value={formData.professionalTitle} onChange={handleInputChange} type="text" placeholder="e.g, smart contract developer, web3 designer" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all" />
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
                      <input name="skills" value={formData.skills} onChange={handleInputChange} type="text" placeholder="e.g., solidity, Rust, React, web3.js" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all" />
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
                      <input name="website" value={formData.website} onChange={handleInputChange} type="url" placeholder="http://yourwebsite.com" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">GitHub</label>
                      <input name="github" value={formData.github} onChange={handleInputChange} type="text" placeholder="github.com/username" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Twitter / X</label>
                      <input name="twitter" value={formData.twitter} onChange={handleInputChange} type="text" placeholder="twitter.com/username" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">LinkedIn</label>
                      <input name="linkedin" value={formData.linkedin} onChange={handleInputChange} type="text" placeholder="linkedin.com/in/yourusername" className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white placeholder-white/50 focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="animate-[fadeIn_0.4s_ease-in-out]">
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-white mb-1">Preferences</h2>
                    <p className="text-xs text-white/50 font-light">Customize your visibility and notification settings</p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest font-medium text-white/60 mb-2">Profile Visibility</label>
                      <div className="relative">
                        <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="w-full bg-transparent border border-white/20 rounded-lg py-3 px-4 text-sm text-white focus:border-[#C19A4A] focus:ring-1 focus:ring-[#C19A4A] outline-none transition-all appearance-none cursor-pointer">
                          <option className="bg-[#0B0F1B]">Public - Anyone can view</option>
                          <option className="bg-[#0B0F1B]">Private - Only connections</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-white/40 pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-white/40 mt-2 font-light">Control who can see your profile details.</p>
                    </div>

                    <div className="flex items-center justify-between border border-white/10 p-4 rounded-lg bg-white/5">
                      <div>
                        <label className="block text-sm font-medium text-white">Email Notifications</label>
                        <p className="text-[10px] text-white/50 mt-1 font-light">Receive updates about your profile and activity</p>
                      </div>
                      <div className="relative inline-block w-11 mr-1 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="emailNotifications" checked={formData.emailNotifications} onChange={handleInputChange} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-white/30 transition-all duration-300 checked:right-0 checked:border-[#C19A4A]" style={{ right: formData.emailNotifications ? '0' : 'auto', left: formData.emailNotifications ? 'auto' : '0' }} />
                        <label className={`block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${formData.emailNotifications ? 'bg-[#C19A4A]' : 'bg-white/10'}`}></label>
                      </div>
                    </div>

                    <div className="border border-[#C19A4A]/30 bg-[#C19A4A]/5 rounded-lg p-4 flex gap-3 items-start">
                      <ShieldCheck className="w-5 h-5 text-[#C19A4A] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[#C19A4A] font-medium text-sm mb-1">Privacy Notice</h4>
                        <p className="text-[11px] text-white/70 leading-relaxed font-light">Your wallet address and email will be perfectly hidden on your public profile. Only Verified connections can see your full contact information.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/10">
                <button type="button" onClick={handlePrev} className={`text-[#C19A4A] text-sm font-medium flex items-center gap-1 transition-all hover:-translate-x-1 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}>
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-6">
                  <button type="button" className="text-[#C19A4A] hover:text-[#A8863D] text-sm font-medium transition-colors">Cancel</button>
                  <button type="button" onClick={handleNext} className="bg-[#C19A4A] hover:bg-[#A8863D] text-black text-sm font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#C19A4A]/20">
                    {currentStep === totalSteps ? (
                      <>Submit <Check className="w-4 h-4" /></>
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
