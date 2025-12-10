import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, ArrowRight, Check } from 'lucide-react';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import './contact.css';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  
  const dropdownRef = useRef(null);

  const messageTemplates = {
    default: "",
    verification: "Hi team, I'm having trouble with the verification process for my Solana project. Specifically...",
    feedback: "I really like the platform, but I think it could be improved by...",
    partnership: "Hello! We are interested in exploring partnership opportunities with Ghonsi Proof. Our project focuses on...",
    other: "I have a question about something not listed above..."
  };

  const subjects = [
    { value: 'verification', label: 'Verification help' },
    { value: 'feedback', label: 'General feedback' },
    { value: 'partnership', label: 'Partnership Inquiry' },
    { value: 'other', label: 'Other' }
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

  const handleSubjectChange = (value, label) => {
    setSelectedSubject(label);
    setSelectedValue(value);
    setIsDropdownOpen(false);
    const newMessage = messageTemplates[value] || messageTemplates.default;
    setMessage(newMessage);
    setCharCount(newMessage.length);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
    // Reset form state
    setName('');
    setEmail('');
    setSelectedSubject('');
    setSelectedValue('');
    setMessage('');
    setCharCount(0);
  };

  return (
    <>
      <div className="selection:bg-[#C19A4A] selection:text-[#0B0F1B] min-h-screen flex flex-col" style={{backgroundColor: '#0B0F1B', color: 'white'}}>
        <Header />

        <main className="flex-grow px-4 pb-12 w-full max-w-lg mx-auto md:max-w-2xl mt-[105px]">
          <div className="text-center mb-8 space-y-3 pt-4">
            <h1 className="text-3xl font-bold text-white">Get in Touch</h1>
            <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-sm mx-auto">
              Have questions about verification, a partnership inquiry, or just want to explore partnership opportunities? We're here to help you build your on-chain portfolio
            </p>
          </div>

          <div className="bg-[#131825] rounded-2xl p-6 md:p-8 border border-gray-800 shadow-xl mb-8">
            <h2 className="font-semibold text-lg mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Name *</label>
                <input type="text" placeholder="Your full name" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0B0F1B] border border-[#C19A4A] rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#d4a852] focus:ring-2 focus:ring-[#C19A4A]/50 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Email *</label>
                <input
                  type="email"
                  placeholder="Your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0F1B] border border-[#C19A4A] rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#d4a852] focus:ring-2 focus:ring-[#C19A4A]/50 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Subject *</label>
                <div className="relative" ref={dropdownRef}>
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-[#0B0F1B] border border-[#C19A4A] rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#d4a852] focus:ring-2 focus:ring-[#C19A4A]/50 transition-colors cursor-pointer flex justify-between items-center">
                    <span className={!selectedSubject ? 'text-gray-400' : ''}>{selectedSubject || 'Select a subject'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" className="w-5 h-5 transition-transform duration-200" style={{transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>
                      <path stroke="#9CA3AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4"></path>
                    </svg>
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-[#131825] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {subjects.map(subject => (
                        <div 
                          key={subject.value}
                          onClick={() => handleSubjectChange(subject.value, subject.label)}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-colors">
                          {subject.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Message *</label>
                <textarea 
                  rows="4" 
                  required
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Tell us how we can help you build your verified portfolio on Ghonsi proof"
                  maxLength="500"
                  className="w-full bg-[#0B0F1B] border border-[#C19A4A] rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#d4a852] focus:ring-2 focus:ring-[#C19A4A]/50 transition-colors resize-none"></textarea>
                <div className="text-right text-[10px] text-gray-600">{charCount}/500 characters</div>
              </div>

              <button type="submit" 
                className="w-full bg-[#C19A4A] text-[#0B0F1B] font-bold py-3.5 rounded-lg hover:bg-[#d4a852] transition-colors mt-2">
                Send Message
              </button>
            </form>
          </div>

          <div className="bg-[#131825] rounded-2xl p-6 border border-gray-800 shadow-xl mb-6">
            <h3 className="font-semibold text-white mb-4">Other Ways to Reach Us</h3>
            
            <div className="space-y-3">
              <a href="mailto:support@ghonsiproof.com" className="bg-[#0B0F1B]/50 rounded-lg p-4 flex items-start gap-4 hover:bg-[#0B0F1B] transition-colors cursor-pointer group block focus:outline-none focus:ring-2 focus:ring-[#C19A4A]/50">
                <div className="bg-[#C19A4A]/10 p-2 rounded-lg text-[#C19A4A] mt-1 group-hover:bg-[#C19A4A] group-hover:text-[#0B0F1B] transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Email Support</div>
                  <div className="text-xs text-[#9CA3AF] mt-1">Send us an email and we'll respond within 24 hours</div>
                  <span className="text-[10px] text-[#C19A4A] mt-1 block hover:underline">support@ghonsiproof.com</span>
                </div>
              </a>

              <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer" className="bg-[#0B0F1B]/50 rounded-lg p-4 flex items-start gap-4 hover:bg-[#0B0F1B] transition-colors cursor-pointer group block focus:outline-none focus:ring-2 focus:ring-[#C19A4A]/50">
                <div className="bg-[#C19A4A]/10 p-2 rounded-lg text-[#C19A4A] mt-1 group-hover:bg-[#C19A4A] group-hover:text-[#0B0F1B] transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Discord Community</div>
                  <div className="text-xs text-[#9CA3AF] mt-1">Join our active community for real-time support and discussions</div>
                  <span className="text-[10px] text-[#C19A4A] mt-1 block hover:underline">ProofHub Discord</span>
                </div>
              </a>

              <a href="https://x.com/Ghonsiproof" target="_blank" rel="noopener noreferrer" className="bg-[#0B0F1B]/50 rounded-lg p-4 flex items-start gap-4 hover:bg-[#0B0F1B] transition-colors cursor-pointer group block focus:outline-none focus:ring-2 focus:ring-[#C19A4A]/50">
                <div className="bg-[#C19A4A]/10 p-2 rounded-lg text-[#C19A4A] mt-1 group-hover:bg-[#C19A4A] group-hover:text-[#0B0F1B] transition-colors flex items-center justify-center">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Follow Us</div>
                  <div className="text-xs text-[#9CA3AF] mt-1">Get the latest updates and announcements</div>
                  <span className="text-[10px] text-[#C19A4A] mt-1 block hover:underline">@Ghonsiproof</span>
                </div>
              </a>
            </div>
          </div>

          <Link to="/faq" className="block bg-[#1A1810] border border-[#C19A4A]/20 rounded-xl p-5 hover:border-[#C19A4A]/50 transition-colors group focus:outline-none focus:ring-2 focus:ring-[#C19A4A]/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[#C19A4A] text-sm font-semibold mb-1">Quick Answers</h4>
                <p className="text-xs text-[#9CA3AF] max-w-[250px]">Looking for immediate answers? Check out our comprehensive FAQ section.</p>
                <div className="text-xs text-[#C19A4A] mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Visit FAQ <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>
        </main>

        <Footer />

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-[#131825] rounded-2xl p-8 border border-gray-800 shadow-xl text-center max-w-sm w-full transform transition-all opacity-100 scale-100" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#C19A4A]/10 mb-5">
                <Check className="w-10 h-10 text-[#C19A4A]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Message Sent!</h3>
              <p className="text-sm text-[#9CA3AF] mb-6">
                Thank you for contacting us. We will reach out to you via email within 24 hours.
              </p>
              <button onClick={() => setShowModal(false)} className="w-full bg-[#C19A4A] text-[#0B0F1B] font-bold py-3 rounded-lg hover:bg-[#d4a852] transition-colors">
                Great!
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Contact;
