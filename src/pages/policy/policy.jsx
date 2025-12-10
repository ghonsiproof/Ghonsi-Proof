import React, { useState } from 'react';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import './policy.css';

function Policy() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const accordionData = [
    {
      title: '1. Information We Collect',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0"><strong>Account Information</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We collect basic information such as:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Name or chosen display name</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Email address</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Password or authentication tokens</li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">Email rotation is supported. We only retain the most recent active email.</p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-4"><strong>Uploaded Profiles</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2"><strong>Reference Images</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Reference images are the main documents a user chooses to display publicly or privately in their portfolio. Examples include certificates, credentials, transcripts, or verified external links. These documents are stored in their original form for as long as the user keeps them in the portfolio. The user can delete them at any time.</p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">Reference images are not used automatically for verification unless the user selects them as part of a verification request.</p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3"><strong>Supporting Documents (Evidences)</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Supporting documents are files used only during the verification process. Examples include screenshots, secondary documents, or written confirmations.</p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">Supporting documents are deleted immediately after verification. We do not keep any copies. Only the verification result and a short status record remain.</p>
          
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3"><strong>System Logs</strong></p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We retain minimal system logs that record actions such as uploads, deletions, verification requests, and approvals. These logs contain only timestamps and action labels and do not contain documents or personal data.</p>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-2">System logs are deleted after the short retention period defined by our security policy.</p>
        </>
      )
    },
    {
      title: '2. Information We Store On Chain',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We store metadata that cannot identify any person. This includes:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Issuer name</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Program or certificate type</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Internal certificate ID</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Completion date</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Extracted text summary</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Metadata hash</li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">This information is public and permanent once committed.</p>
        </>
      )
    },
    {
      title: '3. Information We Store Off Chain',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We store only the information needed for portfolio management and account access, including:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Name</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Email</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Wallet address</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Portfolio summaries</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Certificate summaries</li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">These can be viewed only by the user or by another party the user grants access to.</p>
        </>
      )
    },
    {
      title: '4. How We Use Information',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We use collected information only to:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Create and manage accounts</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Verify user claims</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Display user portfolios</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Prevent misuse and maintain platform integrity</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Communicate important updates related to the account</li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">We do not sell or rent data.</p>
        </>
      )
    },
    {
      title: '5. How We Store and Protect Information',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Here is how we store and protect information:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Reference images are encrypted in storage.</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Supporting documents are automatically deleted after review.</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Minimal logs are kept for a short time.</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">We apply access controls and continuous monitoring.</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Users may delete their account at any time, which permanently removes their data.</li>
          </ul>
        </>
      )
    },
    {
      title: '6. Sharing of Information',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We share information only when required to:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Comply with legal requests</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Investigate fraud or abuse</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Complete requested verifications that involve trusted third parties chosen by the user</li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">We never share supporting evidence documents.</p>
        </>
      )
    },
    {
      title: '7. User Rights',
      content: (
        <>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Users may:</p>
          <ul className="list-none pl-0 mt-3 mb-0">
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Access and download their data</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Request deletion of their account</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">Update login information</li>
            <li className="text-[13px] text-[#CCC] leading-[1.6] mb-2 pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-[#C19A4A] before:font-bold">View verification statuses</li>
          </ul>
          <p className="text-[13px] leading-[1.6] text-[#CCC] m-0 mt-3">On-chain data cannot be removed by its nature.</p>
        </>
      )
    },
    {
      title: "8. Children's Privacy",
      content: (
        <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">Our platform is not designed for users under the legal adult age in their region. We do not knowingly collect information from minors.</p>
      )
    },
    {
      title: '9. Changes to This Policy',
      content: (
        <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">We will notify users of significant updates. Continued use after changes means acceptance of the updated policy.</p>
      )
    },
    {
      title: '10. Contact',
      content: (
        <p className="text-[13px] leading-[1.6] text-[#CCC] m-0">For support contact us at <a href="mailto:ghonsiproof@gmail.com" className="text-[#C19A4A] hover:underline">ghonsiproof@gmail.com</a></p>
      )
    }
  ];

  return (
    <>
      
      <Header />
      
      <main className="flex-grow px-4 pb-12 w-full max-w-lg mx-auto md:max-w-2xl mt-[105px] bg-[#0B0F1B] text-white selection:bg-[#C19A4A] selection:text-[#0B0F1B] min-h-screen">
        
        <div className="text-center mb-8 pt-4">
          <h1 className="text-[28px] font-semibold mb-2 text-[#C19A4A]">Privacy Policy</h1>
          <p className="text-sm text-[#CCC] font-light leading-[1.5] max-w-[520px] mx-auto">This Privacy Policy explains how we collect, use, and protect information on our platform. We are committed to privacy and we store only the minimum data required for verification and portfolio features</p>
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
              <h4 className="text-[#C19A4A] font-medium text-sm mb-1">Policy Updates</h4>
              <p className="text-xs text-[#CCC] leading-relaxed font-light">We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy with a new date and requesting your consent if required.</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </>
  );
}

export default Policy;
