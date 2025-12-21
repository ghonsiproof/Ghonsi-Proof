import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/home/home.jsx';
import FAQ from './pages/faq/faq.jsx';
import About from './pages/about/about.jsx';
import Login from './pages/login/login.jsx';
import Contact from './pages/contact/contact.jsx';
import Portfolio from './pages/portfolio/portfolio.jsx';
import Dashboard from './pages/dashboard/dashboard.jsx';
import CreateProfile from './pages/createProfile/createProfile.jsx';
import Upload from './pages/upload/upload.jsx';
import Request from './pages/request/request.jsx';
import PublicProfile from './pages/publicProfile/publicProfile.jsx';
import Policy from './pages/policy/policy.jsx';
import Terms from './pages/terms/terms.jsx';
import SettingsPage from './pages/settingsPage/settingsPage.jsx';
import TestSupabase from './pages/test/testSupabase.jsx';
import AuthCallback from './pages/auth/AuthCallback.jsx';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/settingsPage" element={<SettingsPage />} />
        <Route path="/test" element={<TestSupabase />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/publicProfile" element={<PublicProfile />} />
        <Route path="/request" element={<Request />} />
        
        {/* Protected Routes */}
        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/createProfile" element={<ProtectedRoute><CreateProfile /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;