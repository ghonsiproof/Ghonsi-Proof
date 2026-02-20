import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight, Send, BookOpen } from 'lucide-react';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import './faq.css';

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Ghonsi Proof?",
      answer: "Ghonsi Proof is the on-chain trust engine for the Web3 workforce. We transform scattered contributions (work histories, career milestones, certificates, career breaks, etc) into a single verifiable professional identity."
    },
    {
      question: "How do I get my proofs verified?",
      answer: "Verification is a multi-step process. You upload supporting documents. Our engine then reviews and validates these claims through integrated project data and social attestations."
    },
    {
      question: "What kind of proof can I upload?",
      answer: "You can upload any proof that validates your contributions. This includes documents, screenshots of acceptance emails, links to published articles, certificates of contribution, records of career milestones or project roles."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes. Your core identity is tied to your wallet, which you control. We only temporarily store verifiable proofs and credentials, and you decide what information is public on your profile"
    },
    {
      question: "How much does Ghonsi proof cost?",
      answer: "Creating your profile and verifying your core credentials is free."
    },
    {
      question: "Can I share my Ghonsi proof profile on social media?",
      answer: "Absolutely. Every Ghonsi proof profile has a shareable link. You can easily share your verified track record on X, LinkedIn, Telegram, and other platforms to showcase your credibility."
    },
    {
      question: "What wallets are supported?",
      answer: "Ghonsi proof is currently built on the Solana blockchain. We support all major Solana-compatible wallets, including Phantom and Solflare."
    },
    {
      question: "Can organisations use Ghonsi proof for hiring?",
      answer: "Yes. Organizations, founders, and DAOs can use Ghonsi proof to find and verify talent based on proven contribution. This reduces the risk of hiring unverified contributors."
    },
    {
      question: "What happens if I lose access to my wallet?",
      answer: "We strongly recommend using our optional email backup feature during sign-up. This provides a secure recovery path for your profile, ensuring you never lose access to your verified on-chain portfolio."
    },
    {
      question: "Do you offer API access for developers?",
      answer: "Yes. We offer API access for developers and organizations who want to integrate Ghonsi proof's verification and reputation scoring into their own platforms or hiring tools. Contact us for more details."
    }
  ];

  return (
    <>
      <Header />
      <main>
        <section className="mt-[115px] bg-[#0B0F1B] py-10 px-5 pb-20">
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-bold mb-[15px] text-white">Frequently Asked Questions</h1>
            <p className="text-sm text-white leading-[1.6]">Find answers to common questions about Ghonsi Proof, verification process, and building your on-chain professional identity.</p>
          </div>

          <div className="max-w-[500px] mx-auto">
            {faqs.map((faq, index) => (
              <article key={index} className="mb-[15px] bg-[rgba(193,154,74,0.1)] border border-[#C19A4A] rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:bg-[#0B0F1B]">
                <div className="flex justify-between items-center p-[18px] cursor-pointer select-none" onClick={() => toggleQuestion(index)}>
                  <p className="text-base font-semibold text-white m-0 flex-1">{faq.question}</p>
                  <button className="bg-none border-none text-[#C19A4A] text-lg cursor-pointer flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out p-0 hover:scale-110" type="button">
                    {openQuestion === index ? (
                      <span className="flex items-center justify-center">
                        <ChevronUp size={18} color="#C19A4A" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <ChevronDown size={18} color="#C19A4A" />
                      </span>
                    )}
                  </button>
                </div>
                {openQuestion === index && (
                  <div className="bg-[#C19A4A] pt-2.5 px-5 pb-5 animate-[slideDown_0.3s_ease-out] max-h-[1000px] overflow-hidden">
                    <p className="text-sm text-white leading-[1.6] m-0">{faq.answer}</p>
                  </div>
                )}
              </article>
            ))}
          </div>

         <div className="mt-[75px] mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="rounded-xl py-6 px-4 bg-[rgba(193,154,74,0.1)] border border-[rgba(193,154,74,0.3)]
  transition-all duration-300 ease-in-out flex flex-col items-center
  hover:bg-[rgba(193,154,74,0.15)] hover:border-[#C19A4A]">

    <Send size={36} className="text-[#C19A4A]" />
    <h3 className="mt-[17px] text-base font-bold text-white mb-2.5 text-center">
      Telegram community
    </h3>
    <span className="text-xs text-[#CCC] leading-[1.5] mb-[15px] text-center">
      Join our active community for real time supports and discussions
    </span>
    <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="text-[#C19A4A] text-[13px] font-semibold flex items-center gap-2 hover:text-[#d9b563]">
      Join Telegram <ArrowRight size={15} />
    </a>
  </div>

  <div className="rounded-xl py-6 px-4 bg-[rgba(193,154,74,0.1)] border border-[rgba(193,154,74,0.3)]
  transition-all duration-300 ease-in-out flex flex-col items-center
  hover:bg-[rgba(193,154,74,0.15)] hover:border-[#C19A4A]">

    <BookOpen size={50} className="text-[#C19A4A]" />
    <h3 className="mt-[17px] text-base font-bold text-white mb-2.5 text-center">
      Documentation
    </h3>
    <span className="text-xs text-[#CCC] leading-[1.5] mb-[15px] text-center">
      Comprehensive guides and tutorials to get you started.
    </span>
    <a href="https://docs.google.com/document/d/11i4kNIQrShArWAIAWOppRJKZ7Go_rkkgDu2b98cQqT8/edit" target="_blank" rel="noopener noreferrer" className="text-[#C19A4A] text-[13px] font-semibold flex items-center gap-2 hover:text-[#d9b563]">
      View Docs <ArrowRight size={15} />
    </a>
  </div>
         </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default FAQ;
