const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const getMessages = async (userId) => {
  const response = await fetch(`${API_URL}/api/messages/${userId}`);
  const result = await response.json();
  
  if (!response.ok) throw new Error(result.error);
  return result.data;
};

export const getUnreadCount = async (userId) => {
  const messages = await getMessages(userId);
  return messages.filter(m => !m.read).length;
};

export const markAsRead = async (messageId) => {
  const response = await fetch(`${API_URL}/api/messages/${messageId}/read`, {
    method: 'PATCH'
  });
  const result = await response.json();
  
  if (!response.ok) throw new Error(result.error);
  return result.data;
};

export const createWelcomeMessage = async (userId, firstName) => {
  const response = await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender_id: 'system',
      receiver_id: userId,
      portfolio_id: null,
      message: `Welcome, ${firstName}, to Ghonsi Proof. You've taken the first step toward giving your work the visibility it deserves. Begin by uploading your past work records on the Upload Proof page, securely, transparently, and permanently. Remember the world is your stage, make your work impossible to ignore`,
      sender_name: 'Ghonsi Proof'
    })
  });
  const result = await response.json();
  
  if (!response.ok) throw new Error(result.error);
  return result.data;
};

export const createPortfolioRequestMessage = async (profileOwnerId, requesterName, requesterId, profileOwnerName) => {
  console.log('Creating messages with:', { profileOwnerId, requesterName, requesterId, profileOwnerName });
  
  const messages = [
    {
      sender_id: requesterId,
      receiver_id: profileOwnerId,
      portfolio_id: profileOwnerId,
      message: `${requesterName} has requested for your profile`,
      sender_name: requesterName
    },
    {
      sender_id: 'system',
      receiver_id: requesterId,
      portfolio_id: profileOwnerId,
      message: `${requesterName}, you sent a request for ${profileOwnerName} profile`,
      sender_name: 'Ghonsi Proof'
    }
  ];

  const results = await Promise.all(
    messages.map(msg => 
      fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      }).then(res => res.json())
    )
  );
  
  console.log('Messages created successfully:', results);
  return results.map(r => r.data);
};
