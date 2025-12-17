import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
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
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createProfile" element={<CreateProfile />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/request" element={<Request />} />
        <Route path="/publicProfile" element={<PublicProfile />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/settingsPage" element={<SettingsPage />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;