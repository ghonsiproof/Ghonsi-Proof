import React, { useState, useEffect } from 'react';
import { Eye, Users, Lightbulb, Accessibility, ChevronLeft, ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedinIn, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/header/header.jsx';
import missionDiagram from '../../assets/ghonsi-proof-logos/transparent-png-logo/ghonsi-proof2.png';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/ghonsi-proof1.png';
import prosperImg from '../../assets/team/Prosper.png';
import godwinImg from '../../assets/team/godwin.jpg';
import nofiuImg from '../../assets/team/nofiu.jpg';
import progressImg from '../../assets/team/progress.png';
import nieImg from '../../assets/team/nie.jpg';
import successImg from '../../assets/team/success.jpg';
import './about.css';

function About() {
  const [activeValueSlide, setActiveValueSlide] = useState(0);
  const [currentTeamSlide, setCurrentTeamSlide] = useState(0);
  const [hoveredSlide, setHoveredSlide] = useState(null);

  useEffect(() => {
    const valueInterval = setInterval(() => {
      setActiveValueSlide((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(valueInterval);
  }, []);

  useEffect(() => {
    const teamInterval = setInterval(() => {
      setCurrentTeamSlide((prev) => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(teamInterval);
  }, []);

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-[18px]');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(r => obs.observe(r));
  }, []);

  const teamMembers = [
    { 
      name: 'Prosper Ayere', 
      role: 'Founder & Product Lead', 
      bio: 'Prosper Ayere leads Ghonsi’s product direction and partnerships. With experience in Web3 developers, professional and ecosystem operations - she understands the trust issues with unverifiable portfolios and is driving Ghonsi’s mission to make builder records provable on-chain.', 
      image: prosperImg 
    },
    { 
      name: 'Godwin Adakonye John', 
      role: 'Blockchain Engineer', 
      bio: 'Godwin is a Solana smart contract developer skilled in Rust and Anchor. He specializes in building scalable, decentralized applications (DApps) on Solana, combining deep technical expertise with a focus on reliability and real-world usability.', 
      image: godwinImg 
    },
    { 
      name: 'Nofiu Moruf Pelumi', 
      role: 'Lead Backend Engineer', 
      bio: 'Pelumi is a full-stack developer, AI engineer and data-driven problem solver. Proficient in Python, R, SQL, and advanced analytics, he builds scalable web solutions, AI chatbots, and interactive dashboards on PHP/Laravel, JavaScript, and cloud platforms (AWS & Azure), and automates workflows with tools like Selenium and Power Automate. He also teaches and mentors aspiring analysts worldwide, helping them develop practical skills in Python, SQL, and cybersecurity.', 
      image: nofiuImg 
    },
    { 
      name: 'Progress Ayere', 
      role: 'Lead Frontend Engineer', 
      bio: 'Progress is a front-end developer and blockchain educator specializing in clean, scalable, high-performance interfaces with HTML, CSS, JavaScript, and React. He implements UI/UX designs, shapes component architecture, and ensures a seamless user experience. He is also the co-founder of BlockChain on Campus (BCC), a student-led community driving Web3 awareness and adoption.', 
      image: progressImg 
    },
    { 
      name: 'Nie Osaoboh', 
      role: 'Product Lead', 
      bio: 'Nie is a product designer with a background in digital marketing, focused on creating simple, user-friendly experiences. He designs products that are visually appealing and easy to use, helping bring ideas to life seamlessly.', 
      image: nieImg
    },
    { 
      name: 'Success Ola-Ojo', 
      role: 'Advisor', 
      bio: 'Success aka Web3Geek, is a community builder and blockchain educator with years of experience helping top web3 brands grow strong engaged communities. He currently serves as Regional Captain for SuperteamNG North East and North West, while also supporting major projects with community strategy and growth.', 
      image: successImg 
    }
  ];

  return (
    <>
      <Header />
      <div className="max-w-[30rem] mx-auto mt-[70px]">
        <section id="about" className="p-4 text-center max-w-[80%] my-0 mx-auto mt-[110px] rounded-lg bg-white/[0.02] border border-white/5 relative z-10 reveal opacity-0 translate-y-[18px] transition-all duration-[600ms] ease-in-out">
          <div className="opacity-85 font-semibold mb-2 text-xl">
            <span style={{ color: 'var(--gold)' }}>About</span>
            <span style={{ color: 'white' }}> Ghonsi proof</span>
          </div>
          <h1 className="text-base text-center leading-[1.4] mb-3 font-normal">We are building the essential infrastructure that makes your work and project contributions verifiable.</h1>
          <div className="hidden">
            <div className="illu" style={{ minHeight: '100px' }}>
              <div className="text-white/50">Hero illustration</div>
            </div>
          </div>
        </section>

        <section id="mission" className="bg-white text-[#C19A4A] m-4 p-6 rounded-lg border border-white/10 w-auto reveal opacity-0 translate-y-[18px] transition-all duration-[600ms] ease-in-out" aria-labelledby="missionTitle">
          <h2 id="missionTitle" className="text-lg mb-2 text-[#07090d] font-bold tracking-[0.1px]">Our Mission</h2>
          <p className="text-base leading-[1.7] text-[#222]" style={{ textAlign: 'justify' }}>In the rapidly evolving Web3 landscape, trust is the most valuable currency. Traditional credentials and resumes don't capture the full picture of someone's contributions to decentralized projects and communities.</p>
          <p className="text-base leading-[1.7] text-[#222] mt-[15px]" style={{ textAlign: 'justify' }}>Ghonsi Proof bridges this gap by creating an immutable, community-verified record of professional achievements that travels with you across the entire Web3 ecosystem.</p>
          <button className="inline-flex gap-2.5 bg-[#C19A4A] text-[#0B0F1B] py-2.5 px-3.5 rounded-lg font-bold cursor-pointer border-none shadow-[0_6px_18px_rgba(193,154,74,0.12)] mt-[35px]">Join Our Mission</button>
          <div className="my-3.5 mx-4 p-3.5 min-h-[8.75rem] rounded-xl bg-white/[0.04] border border-white/[0.04] flex justify-center items-center reveal opacity-0 translate-y-[18px] transition-all duration-[600ms] ease-in-out">
            <div className="flex justify-center items-center">
              <img src={missionDiagram} alt="Mission diagram" width="180" className="max-w-full h-auto" />
            </div>
          </div>
        </section>

        <section id="values" className="bg-[#0B0F1B] py-16 px-5 text-center rounded-lg m-4 border border-white/10">
          <div>
            <h2 className="text-white text-[1.875rem] mb-10 font-[Inter] font-bold">Our Values</h2>
          </div>
          <div className="relative max-w-[25rem] mx-auto h-72" id="valuesGallery" onClick={() => setActiveValueSlide((prev) => (prev + 1) % 4)}>
            <div className={`absolute top-0 left-0 w-full h-full bg-[#0B0F1B] text-[wheat] rounded-2xl py-[2.1875rem] px-[1.5625rem] shadow-[0_0.5rem_1rem_rgba(0,0,0,0.3)] ${activeValueSlide === 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-[800ms] border border-white/5 flex flex-col justify-center hover:-translate-y-2 hover:shadow-[0_1.5rem_3rem_white]`} onMouseEnter={() => setHoveredSlide(0)} onMouseLeave={() => setHoveredSlide(null)}>
              <Eye className="fa fa-eye" size={45} color={hoveredSlide === 0 ? "#FFFFFF" : "#C19A4A"} style={{marginBottom: '15px', marginLeft: 'auto', marginRight: 'auto', transition: 'color 0.3s'}} />
              <h3 className="text-white text-xl mb-2.5">Transparency</h3>
              <p className="text-sm text-[#cccccc] leading-[1.7] font-bold">We believe in open, verifiable processes that build genuine trust in the Web3 ecosystem.</p>
            </div>
            <div className={`absolute top-0 left-0 w-full h-full bg-[#0B0F1B] text-[wheat] rounded-2xl py-[2.1875rem] px-[1.5625rem] shadow-[0_0.5rem_1rem_rgba(0,0,0,0.3)] ${activeValueSlide === 1 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-[800ms] border border-white/5 flex flex-col justify-center hover:-translate-y-2 hover:shadow-[0_1.5rem_3rem_white]`} onMouseEnter={() => setHoveredSlide(1)} onMouseLeave={() => setHoveredSlide(null)}>
              <Users className="fa fa-users" size={45} color={hoveredSlide === 1 ? "#FFFFFF" : "#C19A4A"} style={{marginBottom: '15px', marginLeft: 'auto', marginRight: 'auto', transition: 'color 0.3s'}} />
              <h3 className="text-white text-xl mb-2.5">Community-First</h3>
              <p className="text-sm text-[#cccccc] leading-[1.7] font-bold">Our platform is built by and for the Web3 community, with governance and verification driven by peers.</p>
            </div>
            <div className={`absolute top-0 left-0 w-full h-full bg-[#0B0F1B] text-[wheat] rounded-2xl py-[2.1875rem] px-[1.5625rem] shadow-[0_0.5rem_1rem_rgba(0,0,0,0.3)] ${activeValueSlide === 2 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-[800ms] border border-white/5 flex flex-col justify-center hover:-translate-y-2 hover:shadow-[0_1.5rem_3rem_white]`} onMouseEnter={() => setHoveredSlide(2)} onMouseLeave={() => setHoveredSlide(null)}>
              <Lightbulb className="fa fa-lightbulb" size={45} color={hoveredSlide === 2 ? "#FFFFFF" : "#C19A4A"} style={{marginBottom: '15px', marginLeft: 'auto', marginRight: 'auto', transition: 'color 0.3s'}} />
              <h3 className="text-white text-xl mb-2.5">Innovation</h3>
              <p className="text-sm text-[#cccccc] leading-[1.7] font-bold">We push the boundaries of what's possible in decentralized identity and verification.</p>
            </div>
            <div className={`absolute top-0 left-0 w-full h-full bg-[#0B0F1B] text-[wheat] rounded-2xl py-[2.1875rem] px-[1.5625rem] shadow-[0_0.5rem_1rem_rgba(0,0,0,0.3)] ${activeValueSlide === 3 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} transition-opacity duration-[800ms] border border-white/5 flex flex-col justify-center hover:-translate-y-2 hover:shadow-[0_1.5rem_3rem_white]`} onMouseEnter={() => setHoveredSlide(3)} onMouseLeave={() => setHoveredSlide(null)}>
              <Accessibility className="fa fa-universal-access" size={45} color={hoveredSlide === 3 ? "#FFFFFF" : "#C19A4A"} style={{marginBottom: '15px', marginLeft: 'auto', marginRight: 'auto', transition: 'color 0.3s'}} />
              <h3 className="text-white text-xl mb-2.5">Accessibility</h3>
              <p className="text-sm text-[#cccccc] leading-[1.7] font-bold">Making Web3 verification accessible to everyone, regardless of technical background.</p>
            </div>
          </div>
        </section>

        <section id="team" className="bg-[#C19A4A] py-8 px-4 rounded-lg m-4 border border-white/5 reveal opacity-0 translate-y-[18px] transition-all duration-[600ms] ease-in-out">
          <div>
            <h2 className="text-[#0B0F1B] text-[1.875rem] mb-8 text-center font-[Inter] font-bold">Meet Our Team</h2>
          </div>
          <div className="relative w-full max-w-[350px] mx-auto overflow-hidden rounded-lg bg-white/[0.02] border border-white/5 p-4">
            <button className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-none bg-black/40 text-white cursor-pointer flex items-center justify-center z-10 transition-[background] duration-300 hover:bg-[#C19A4A] hover:text-[#0B0F1B] left-2" id="teamPrev" onClick={() => setCurrentTeamSlide((prev) => (prev - 1 + 6) % 6)}>
              <ChevronLeft size={20} />
            </button>
            <div className="flex transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" style={{ transform: `translateX(-${currentTeamSlide * 100}%)` }}>
              {teamMembers.map((member, index) => (
                <div key={index} className="min-w-full flex justify-center">
                  <div className="w-[90%] bg-white/15 py-8 px-4 rounded-2xl text-center backdrop-blur-lg transition-[0.3s] ease border border-white/10 hover:-translate-y-[5px] hover:shadow-[0_8px_16px_rgba(193,154,74,0.2)]">
                    <img src={member.image} className="w-20 h-20 rounded-full object-cover my-0 mx-auto mb-4 block border-2 border-[#C19A4A]" alt={member.name} />
                    <h3 className="text-lg mb-2 text-white">{member.name}</h3>
                    <span className="block text-sm text-[#0B0F1B] mb-4 font-semibold">{member.role}</span>
                    <p className="text-sm leading-[1.5] text-white/80">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-none bg-black/40 text-white cursor-pointer flex items-center justify-center z-10 transition-[background] duration-300 hover:bg-[#C19A4A] hover:text-[#0B0F1B] right-2" id="teamNext" onClick={() => setCurrentTeamSlide((prev) => (prev + 1) % 6)}>
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        <section className="bg-[#0B0F1B] py-16 px-5 text-center rounded-lg m-4 border border-white/10">
          <div className="max-w-[25rem] mx-auto overflow-y-auto">
            <div>
              <h2 className="text-white text-[1.875rem] mb-8 font-[Inter] font-bold">Our Journey</h2>
              <p className="text-white/80 mb-8">From concept to reality here's how we're building the future of Web3 professional verification.</p>
            </div>
            <div className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6">
              <div className="text-sm text-white/60">2023</div>
              <div className="relative h-full flex justify-center">
                <span className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"></span>
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20"></span>
              </div>
              <div className="pl-5">
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">Foundation</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">GhonsiProof was founded with the vision of creating trust infrastructure for Web3 professionals.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6">
              <div className="text-sm text-white/60">2024</div>
              <div className="relative h-full flex justify-center">
                <span className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"></span>
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20"></span>
              </div>
              <div className="pl-5">
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">MVP Launch</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Launched our minimum viable product with basic verification and credential storage features.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6">
              <div className="text-sm text-white/60">2024</div>
              <div className="relative h-full flex justify-center">
                <span className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"></span>
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20"></span>
              </div>
              <div className="pl-5">
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">Community Growth</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Reached 10,000+ verified professionals and 50+ partner organizations in the Web3 ecosystem.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6">
              <div className="text-sm text-white/60">2024</div>
              <div className="relative h-full flex justify-center">
                <span className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"></span>
              </div>
              <div className="pl-5">
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">Global Expansion</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Planning to expand globally with multi-chain support and enterprise partnerships.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-[60px] px-5 bg-[#0B0F1B] text-white font-[Inter]">
          <div className="block md:flex md:gap-[160px]">
            <div>
              <div className="text-sm opacity-70 mb-[25px] font-normal">
                <img src={logo} alt="Ghonsi proof Logo" style={{ width: '40px', height: '40px', marginRight: '2px', verticalAlign: 'middle' }} />
              </div>
              <p className="max-w-[360px] text-sm leading-[1.6] opacity-90 m-0">Building the trust layer for the Web3 workforce. Prove your skills, authenticate your work, and showcase verified credentials on-chain.</p>
              <div className="flex gap-[5px] justify-start mb-5 mt-5 pt-5">
                <a href="https://x.com/Ghonsiproof" className="w-9 h-9 no-underline flex items-center justify-center text-base cursor-pointer transition-[0.3s]"><FontAwesomeIcon icon={faXTwitter} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" /></a>
                <a href="https://linkedin.com" className="w-9 h-9 no-underline flex items-center justify-center text-base cursor-pointer transition-[0.3s]"><FontAwesomeIcon icon={faLinkedinIn} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" /></a>
                <a href="mailto:ghonsiproof@gmail.com" className="w-9 h-9 no-underline flex items-center justify-center text-base cursor-pointer transition-[0.3s]"><FontAwesomeIcon icon={faEnvelope} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" /></a>
                <a href="https://discord.com/" className="w-9 h-9 no-underline flex items-center justify-center text-base cursor-pointer transition-[0.3s]"><FontAwesomeIcon icon={faDiscord} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" /></a>
              </div>
            </div>
            <div>
              <ul className="list-none p-0 mt-[30px] mb-0 leading-[2.1] text-sm opacity-90">
                <li><a href="/home" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">How It works</a></li>
                <li><a href="/about" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">About</a></li>
                <li><a href="/faq" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">FAQ</a></li>
                <li><a href="/contact" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">Contact</a></li>
                <li><a href="https://x.com/Ghonsiproof" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">Support</a></li>
                <li><a href="https://x.com/Ghonsiproof" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">Help Center</a></li>
                <li><a href="https://x.com/Ghonsiproof" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white mt-10 pt-5 flex flex-wrap gap-[15px] justify-between text-[13px] opacity-70">
            <span className="text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]"><a href="/terms" className="text-white hover:text-[#C19A4A]">Terms of Service</a> </span>
            <span className="text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]"><a href="/policy" className="text-white hover:text-[#C19A4A]">Privacy Policy</a> </span>
            <span className="text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]"><a href="/contact" className="text-white hover:text-[#C19A4A]">Contact</a></span>
            <h4 className="m-0 text-[13px] text-white">&copy; 2026 Ghonsi proof. All rights reserved. | Website Builder</h4>
          </div>
        </footer>
      </div>
    </>
  );
}

export default About;