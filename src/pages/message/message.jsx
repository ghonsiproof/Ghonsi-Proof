import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Clock } from 'lucide-react';
import { getCurrentUser } from '../../utils/supabaseAuth';
import { getMessages, markAsRead } from '../../utils/messagesApi';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';

function Message() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const data = await getMessages(user.id);
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await markAsRead(message.id);
      setMessages(messages.map(m => m.id === message.id ? { ...m, is_read: true } : m));
    }
  };

  const truncateText = (text, lines = 2) => {
    const words = text.split(' ');
    const maxWords = lines * 15;
    return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center mt-[105px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C19A4A]"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0B0F1B] text-white font-sans mt-[105px]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center text-[#C19A4A] text-sm mb-6 hover:underline gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold mb-6">Messages</h1>

          {selectedMessage ? (
            <div className="bg-[#151925] rounded-xl p-6 border border-white/5">
              <button onClick={() => setSelectedMessage(null)} className="text-[#C19A4A] text-sm mb-4 hover:underline">
                ← Back to messages
              </button>
              <h2 className="text-xl font-semibold mb-2">{selectedMessage.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <Clock size={12} />
                {new Date(selectedMessage.created_at).toLocaleDateString()}
              </div>
              <p className="text-gray-300 leading-relaxed">{selectedMessage.content}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="bg-[#151925] rounded-xl p-8 text-center border border-white/5">
                  <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`bg-[#151925] rounded-xl p-4 border cursor-pointer transition-all hover:border-[#C19A4A]/50 ${
                      message.is_read ? 'border-white/5' : 'border-[#C19A4A]/30 bg-[#C19A4A]/5'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{message.title}</h3>
                      {!message.is_read && (
                        <span className="w-2 h-2 bg-[#C19A4A] rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{truncateText(message.content)}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Clock size={10} />
                      {new Date(message.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Message;
