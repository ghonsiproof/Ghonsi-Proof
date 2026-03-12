import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedinIn, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0F1B] p-5">

      <div className="flex gap-3 justify-start mb-5 mt-5 pt-5 border-t border-white">
        <a href="https://x.com/Ghonsiproof" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faXTwitter} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" /></a>
        <a href="https://linkedin.com/company/ghonsiproof" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faLinkedinIn} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" /></a>
        <a href="mailto:support@ghonsiproof.com"><FontAwesomeIcon icon={faEnvelope} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" /></a>
        <a href="https://t.me/ghonsiproofhub" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faTelegram} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" /></a>
      </div>

      <ul className="flex flex-row flex-wrap gap-3 list-none justify-center">
        <li><a href="/terms" className="text-[13px] text-white cursor-pointer transition-colors duration-200 py-[5px] no-underline hover:text-[#C19A4A]">Terms of Service</a></li>
        <li><a href="/policy" className="text-[13px] text-white cursor-pointer transition-colors duration-200 py-[5px] no-underline hover:text-[#C19A4A]">Privacy Policy</a></li>
        <li><a href="/contact" className="text-[13px] text-white cursor-pointer transition-colors duration-200 py-[5px] no-underline hover:text-[#C19A4A]">Contact</a></li>
      </ul>

      <div className="text-center text-xs text-white mt-5 pt-5 border-t border-white/5">
        <p> &copy; {currentYear} Ghonsi Proof. All rights reserved</p>
      </div>
    </footer>
  );
}

export default Footer;
