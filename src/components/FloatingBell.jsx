// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Bell } from 'lucide-react';
// import { supabase } from '../config/supabaseClient';
// import { getUnreadCount } from '../utils/messagesApi';

// function FloatingBell() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
        
//         if (session) {
//           setIsLoggedIn(true);
//           const count = await getUnreadCount(session.user.id);
//           setUnreadCount(count);
//         } else {
//           // Check wallet session from localStorage
//           const walletAddress = localStorage.getItem('wallet_address');
//           const userId = localStorage.getItem('user_id');
          
//           if (walletAddress && userId) {
//             setIsLoggedIn(true);
//           } else {
//             setIsLoggedIn(false);
//           }
//         }
//       } catch (error) {
//         console.error('Error checking auth:', error);
//         setIsLoggedIn(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   // Don't render on mobile - only show on desktop (lg screens and above)
//   const [isDesktop, setIsDesktop] = useState(false);

//   useEffect(() => {
//     const checkDesktop = () => {
//       setIsDesktop(window.innerWidth >= 1024);
//     };
//     checkDesktop();
//     window.addEventListener('resize', checkDesktop);
//     return () => window.removeEventListener('resize', checkDesktop);
//   }, []);

//   if (!isDesktop) {
//     return null;
//   }

//   return (
//     <button
//       onClick={() => navigate('/message')}
//       className="floating-bell"
//     >
//       <Bell size={24} className="text-[#C19A4A]" />
//       {unreadCount > 0 && (
//         <span className="floating-bell-badge">
//           {unreadCount}
//         </span>
//       )}
//     </button>
//   );
// }

// export default FloatingBell;
