import React, { useState } from 'react';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import './terms.css';

function Terms() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const accordionData = [
    {
      title: '1. Purpose of the Platform',
      content: (
        <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">The platform provides tools for building a verifiable portfolio, submitting documents for verification, and showcasing confirmed skills and experiences.</p>
      )
    },
    {
      title: '2. User Responsibilities',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Users must:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Provide accurate information</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Own the rights to any uploaded documents</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Avoid misuse, fraud, impersonation, or violation of third-party rights</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Keep their login information secure</li>
          </ul>
        </>
      )
    },
    {
      title: '3. Uploading and Verification',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>Reference Images</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Users may upload reference documents to showcase achievements. These remain stored until deleted by the user.</p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3"><strong>Supporting Documents (Evidences)</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Supporting documents are used only during verification and are deleted immediately after the review.</p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3"><strong>Verification Outcomes</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Verification decisions are based on available evidence and reviewer judgment.</p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">Decisions are final unless new evidence is submitted.</p>
        </>
      )
    },
    {
      title: '4. Data Deletion',
      content: (
        <ul className="list-none pl-0 mt-0 mb-0">
          <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Supporting evidence is automatically deleted after review.</li>
          <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Account deletion removes all stored personal data.</li>
          <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">On-chain data cannot be deleted by its nature.</li>
        </ul>
      )
    },
    {
      title: '5. Acceptable Use',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Users agree not to:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Upload harmful or illegal content</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Attempt to breach, reverse engineer, or disrupt the platform</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Impersonate another person</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Use the platform for fraudulent claims</li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">Violation may lead to suspension or termination.</p>
        </>
      )
    },
    {
      title: '6. Intellectual Property',
      content: (
        <ul className="list-none pl-0 mt-0 mb-0">
          <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">All platform content, branding, design, and systems belong to the platform owners.</li>
          <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Users retain rights over the documents they upload.</li>
        </ul>
      )
    },
    {
      title: '7. Service Availability',
      content: (
        <ul className="list-none pl-0 mt-0 mb-0">
          <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">We may update, suspend, or limit certain features for maintenance or security reasons.</li>
          <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">We do not guarantee continuous availability.</li>
        </ul>
      )
    },
    {
      title: '8. Limitation of Liability',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We are not liable for losses resulting from:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">User misuse</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Uploading false documents</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Downtime or technical issues</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Third-party interactions</li>
          </ul>
        </>
      )
    },
    {
      title: '9. Governing Law',
      content: (
        <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">The Terms are governed by the laws of the region where the platform is registered.</p>
      )
    },
    {
      title: '10. Contact',
      content: (
        <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">For questions or support contact at <a href="mailto:ghonsiproof@gmail.com" className="text-[#C19A4A] hover:underline">ghonsiproof@gmail.com</a></p>
      )
    }
  ];

  return (
    <>
      
      <Header />
      
      <main className="flex-grow px-4 pb-12 w-full max-w-lg mx-auto md:max-w-2xl mt-[105px] bg-[#0B0F1B] text-white selection:bg-[#C19A4A] selection:text-[#0B0F1B] min-h-screen">
        
        <div className="text-center mb-8 pt-4">
          <h1 className="text-[28px] font-semibold mb-2 text-[#C19A4A]">Terms of Service</h1>
          <p className="text-sm text-[#CCC] font-light leading-[1.5] max-w-[520px] mx-auto">These Terms govern the use of our platform and services. By creating an account, you agree to these rules.</p>
        </div>

        <div className="mb-8 text-center">
          <p className="text-xs text-[#CCC] font-light">Last updated: 1st December, 2025.</p>
        </div>

        <div className="space-y-3">
          {accordionData.map((item, index) => (
            <div key={index} className="border border-[#C19A4A]/30 rounded-lg mb-3 overflow-hidden">
              <div
                className={`${activeIndex === index ? 'bg-[#C19A4A]/10' : 'bg-[#131825]/80'} p-4 cursor-pointer flex justify-between items-center transition-all duration-300 ease-in-out select-none hover:bg-[#131825]`}
                onClick={() => toggleAccordion(index)}
              >
                <h3 className="text-sm font-semibold text-white m-0">{item.title}</h3>
                <svg
                  className={`w-5 h-5 text-[#C19A4A] transition-transform duration-300 ease-in-out ${activeIndex === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </div>
              {activeIndex === index && (
                <div className="bg-[#131825]/50 p-4 border-t border-[#C19A4A]/20">
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-5 rounded-lg border border-[#C19A4A]/30 bg-[#C19A4A]/5">
          <div className="flex gap-3 items-start">
            <svg className="w-5 h-5 text-[#C19A4A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 -10a8 8 0 1 1 0 16A8 8 0 0 1 12 3z"></path>
            </svg>
            <div>
              <h4 className="text-[#C19A4A] font-medium text-sm mb-1">Terms Updates</h4>
              <p className="text-xs text-[#CCC] leading-relaxed font-light">We may update these Terms of Service from time to time. We will notify you of any material changes by posting the updated terms with a new date and requesting your acceptance if required.</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </>
  );
}

export default Terms;
