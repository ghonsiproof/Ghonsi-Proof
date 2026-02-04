import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/supabaseAuth';
import supabase from '../utils/supabase';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import NotificationWidget from '../components/notificationWidget/notificationWidget';
import { Wallet, Shield, Upload } from 'lucide-react';
import bubbleData from '../data/bubbleData';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [pinnedBubble, setPinnedBubble] = useState(null);
  const [summaryPosition, setSummaryPosition] = useState({ top: 0, left: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPublicProfiles = async () => {
      // Fetch only public profiles to display on the home page bubbles
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          display_name,
          bio,
          avatar_url,
          users!inner(wallet_address)
        `)
        .eq('is_public', true)
        .limit(10); // Limit to 10 for performance

      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        setProfiles(data);
      }
    };

    fetchPublicProfiles();
  }, []);

  const positionSummaryBox = (event) => {
    const bubbleRect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('.h-screen');
    const containerRect = container.getBoundingClientRect();
    const scrollY = window.scrollY;
    const summaryWidth = 250;
    const summaryHeight = 280;
    const padding = 20;

    const containerTop = containerRect.top + scrollY + 60;
    const containerBottom = containerRect.bottom + scrollY - 20;
    const containerLeft = containerRect.left + 20;
    const containerRight = containerRect.right - 20;

    let topPos = bubbleRect.top + scrollY + (bubbleRect.height / 2) - (summaryHeight / 2);
    let leftPos;

    const spaceRight = containerRight - bubbleRect.right;
    const spaceLeft = bubbleRect.left - containerLeft;

    if (spaceRight > summaryWidth + padding) {
      leftPos = bubbleRect.right + padding;
    } else if (spaceLeft > summaryWidth + padding) {
      leftPos = bubbleRect.left - summaryWidth - padding;
    } else {
      leftPos = spaceRight > spaceLeft ? bubbleRect.right + padding : bubbleRect.left - summaryWidth - padding;
    }

    topPos = Math.max(containerTop, Math.min(topPos, containerBottom - summaryHeight));
    leftPos = Math.max(containerLeft, Math.min(leftPos, containerRight - summaryWidth));

    return { top: topPos, left: leftPos };
  };

  const handleBubbleClick = (bubble, event) => {
    event.stopPropagation();
    if (pinnedBubble === bubble) {
      setPinnedBubble(null);
      setSelectedBubble(null);
    } else {
      const position = positionSummaryBox(event);
      setPinnedBubble(bubble);
      setSelectedBubble(bubble);
      setSummaryPosition(position);
    }
  };

  const handleBubbleHover = (bubble, event) => {
    if (!pinnedBubble) {
      const position = positionSummaryBox(event);
      setSelectedBubble(bubble);
      setSummaryPosition(position);
    }
  };

  const handleBubbleLeave = () => {
    if (!pinnedBubble) {
      setSelectedBubble(null);
    }
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(slideInterval);
  }, []);

  const handleCardClick = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const mappedProfiles = profiles.map(profile => ({
    name: profile.display_name,
    bio: profile.bio,
    img: profile.avatar_url,
    wallet_address: profile.users.wallet_address
  }));

  const allBubbles = profiles.length > 0 ? [...mappedProfiles, ...mappedProfiles, ...mappedProfiles] : [...bubbleData, ...bubbleData, ...bubbleData];

  return (
    <>
      <Header />
      <NotificationWidget />
      <main>
        <section className="h-screen relative overflow-hidden mt-[125px] mb-0">
          <div className="w-full h-screen relative border-2 border-[#C19A4A]/30 rounded-xl box-border p-5">
            {selectedBubble && (
              <div
                className="w-[250px] bg-[#0B0F1B] backdrop-blur-xl p-5 rounded-xl text-white fixed z-[1000] transition-all duration-300 border border-[#C19A4A]"
                style={{
                  top: `${summaryPosition.top}px`,
                  left: `${summaryPosition.left}px`,
                }}
                onMouseEnter={() => {}}
                onMouseLeave={handleBubbleLeave}
              >
                <img id="summaryImg" src={selectedBubble.img} alt="profile" className="w-[60px] h-[60px] rounded-full mb-2.5" />
                <h3 id="summaryName" className="mb-1.5 text-base font-bold">{selectedBubble.name}</h3>
                <p id="summaryBio" className="text-xs text-[#CCC] mb-4 leading-[1.4]">{selectedBubble.bio}</p>
                <button id="showProfileBtn" onClick={() => {
                  // Assuming selectedBubble now has the wallet_address from Supabase
                  navigate(`/request?wallet=${selectedBubble.wallet_address}`);
                }} className="mt-2.5 w-full p-2.5 border-none bg-[#C19A4A] text-[#1a1a2e] cursor-pointer rounded-md font-semibold transition-all duration-200 hover:bg-[#d9b563] hover:scale-[0.98]">
                  Show Profile
                </button>
              </div>
            )}

            <p className="absolute top-5 left-1/2 -translate-x-1/2 z-50 text-[#C19A4A] text-sm font-medium text-center tracking-wide">
              Click on any bubble to explore verified web3 professionals
            </p>

            <div className="bubbles">
              {allBubbles.map((bubble, index) => (
                <div
                  key={index}
                  className="bubble"
                  data-name={bubble.name}
                  data-bio={bubble.bio}
                  data-img={bubble.img}
                  onClick={(e) => handleBubbleClick(bubble, e)}
                  onMouseEnter={(e) => handleBubbleHover(bubble, e)}
                  onMouseLeave={handleBubbleLeave}
                  style={{
                    border:
                      selectedBubble === bubble || pinnedBubble === bubble
                        ? "4px solid #C19A4A"
                        : "none",
                  }}
                >
                  <img src={bubble.img} alt={`User ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="text-justify mt-[23px] p-5">
          <div>
            <h1 className="text-center text-[28px]">
              Prove what you've built.
            </h1>
            <h1 className="text-center text-[#C19A4A] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-bolt-ds-textPrimary drop-shadow-[0_0_15px_#C19A4A]">
              Unlock who you can work with.
            </h1>
            <p className="mt-[35px] text-lg">
              Ghonsi proof is the on-chain trust engine for the Web3 workforce.
              We transform your scattered contributions into a single,
              verifiable on-chain portfolio so you can get noticed for the work
              you've actually done. <br /> <br /> Now, as a builder or
              professional in Web3 you can store your portfolio on the
              blockchain. <br /> <br /> As an employer or hirer, you can now
              verify talents and their track records.
            </p>
          </div>
        </section>

        <section className="bg-[#0B0F1B] py-16 px-5 text-center rounded-lg m-4 border border-white/10 capitalize">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-white">How it Works</h2>
            <p className="text-base text-[#CCC] leading-[1.4] font-bold">
              Three simple steps to build your verified Web3 reputation
            </p>
          </div>

          <div
            className="relative max-w-[400px] mx-auto h-72"
            id="cardsGallery"
          >
            <div
              className={`absolute top-0 left-0 w-full h-full bg-[#0B0F1B] rounded-2xl py-8 px-6 shadow-[0_8px_16px_#C19A4A] ${
                currentSlide === 0
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              } transition-opacity duration-[800ms] border border-[#C19A4A] flex flex-col justify-center hover:-translate-y-2 hover:shadow-[0_24px_48px_#C19A4A]`}
              onClick={handleCardClick}
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Wallet
                className={`mb-4 mx-auto transition-colors duration-300 ${
                  hoveredCard === 0 ? "text-white" : "text-[#C19A4A]"
                }`}
                size={150}
              />
              <h3 className="text-white text-xl font-bold mb-2.5">Connect</h3>
              <p className="text-sm text-[#CCC] leading-[1.7]">
                Sign up, connect your wallet and upload your proofs.
              </p>
              <span className="text-[30px] font-black text-[#C19A4A] mt-9">
                01
              </span>
            </div>

            <div
              className={`absolute top-0 left-0 w-full h-full bg-[#0B0F1B] rounded-2xl py-8 px-6 shadow-[0_8px_16px_#C19A4A] ${
                currentSlide === 1
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              } transition-opacity duration-[800ms] border border-[#C19A4A] flex flex-col justify-center hover:-translate-y-2 hover:shadow-[0_24px_48px_#C19A4A]`}
              onClick={handleCardClick}
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Shield
                className={`mb-4 mx-auto transition-colors duration-300 ${
                  hoveredCard === 1 ? "text-white" : "text-[#C19A4A]"
                }`}
                size={125}
              />
              <h3 className="text-white text-xl font-bold mb-2.5">Verify</h3>
              <p className="text-sm text-[#CCC] leading-[1.7]">
                Sync and verify your work history.
              </p>
              <span className="text-[30px] font-black text-[#C19A4A] mt-9">
                02
              </span>
            </div>

            <div
              className={`absolute top-0 left-0 w-full h-full bg-[#0B0F1B] rounded-2xl py-8 px-6 shadow-[0_8px_16px_#C19A4A] ${
                currentSlide === 2
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              } transition-opacity duration-[800ms] border border-[#C19A4A] flex flex-col justify-center hover:-translate-y-2 hover:shadow-[0_24px_48px_#C19A4A]`}
              onClick={handleCardClick}
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Upload
                className={`mb-4 mx-auto transition-colors duration-300 ${
                  hoveredCard === 2 ? "text-white" : "text-[#C19A4A]"
                }`}
                size={150}
              />
              <h3 className="text-white text-xl font-bold mb-2.5">Share</h3>
              <p className="text-sm text-[#CCC] leading-[1.7]">
                Instantly share your on-chain portfolio wuth employers and
                founders.
              </p>
              <span className="text-[30px] font-black text-[#C19A4A] mt-9">
                03
              </span>
            </div>
          </div>

          {!isLoggedIn && (
            <button
              className="py-4 px-12 text-lg font-semibold text-white bg-transparent border-2 border-[#C19A4A] rounded-lg cursor-pointer transition-all duration-300 tracking-wide min-w-[280px] mt-10 hover:bg-[#C19A4A]/10 hover:text-[#C19A4A] hover:scale-[0.98] hover:shadow-[0_8px_24px_#C19A4A]"
              onClick={() => navigate("/login?mode=getstarted")}
            >
              Get Started
            </button>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
