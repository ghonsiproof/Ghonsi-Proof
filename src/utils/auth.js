// Authentication utility functions

export const login = (email, walletAddress) => {
  localStorage.setItem('userLoggedIn', 'true');
  localStorage.setItem('userEmail', email);
  if (walletAddress) {
    localStorage.setItem('walletAddress', walletAddress);
  }
};

export const logout = () => {
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('walletAddress');
};

export const isAuthenticated = () => {
  return localStorage.getItem('userLoggedIn') === 'true';
};

export const getCurrentUser = () => {
  return {
    email: localStorage.getItem('userEmail'),
    wallet: localStorage.getItem('walletAddress'),
    isLoggedIn: isAuthenticated()
  };
};
