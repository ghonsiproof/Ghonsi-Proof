import React, { useState } from 'react';
import { Bell, Shield, Moon, Download, Lock, Eye, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState('Public');
  const [language, setLanguage] = useState('English');

  return (
    <div className={`min-h-screen ${theme === 'Dark' ? 'bg-[#0B0F1B] text-white' : 'bg-white text-black'}`}>
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8 mt-[115px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your account preferences<br />and application settings</p>
        </div>

        {/* Notifications Section */}
        <div className={`rounded-xl p-5 mb-4 border ${theme === 'Dark' ? 'bg-[#111625] border-white/5' : 'bg-gray-100 border-gray-300'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={20} className="text-[#C19A4A]" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex-1">
                <p className="text-sm font-medium">Email Notifications</p>
                <p className={`text-xs ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Receive updates including proof verifications and portfolio request via email</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-[#C19A4A]' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex-1">
                <p className="text-sm font-medium">Push Notifications</p>
                <p className={`text-xs ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Receive browser push notifications</p>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`flex-shrink-0 w-12 h-6 rounded-full transition-colors ${pushNotifications ? 'bg-[#C19A4A]' : 'bg-gray-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className={`rounded-xl p-5 mb-4 border ${theme === 'Dark' ? 'bg-[#111625] border-white/5' : 'bg-gray-100 border-gray-300'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-[#C19A4A]" />
            <h2 className="text-lg font-semibold">Privacy & Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Profile Visibility</p>
                  <p className={`text-xs ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Control who can see your profile</p>
                </div>
              </div>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className={`text-sm px-3 py-1.5 rounded border outline-none ${theme === 'Dark' ? 'bg-[#0B0F1B] text-white border-white/10' : 'bg-white text-black border-gray-300'}`}
              >
                <option>Public</option>
                <option>Private</option>
                <option>Friends Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className={`text-xs ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Add an extra layer of security</p>
                </div>
              </div>
              <button className={`text-xs px-3 py-1.5 rounded border transition-colors ${theme === 'Dark' ? 'bg-[#0B0F1B] text-white border-white/10 hover:bg-[#1A1F2E]' : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}>
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className={`rounded-xl p-5 mb-4 border ${theme === 'Dark' ? 'bg-[#111625] border-white/5' : 'bg-gray-100 border-gray-300'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Moon size={20} className="text-[#C19A4A]" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Language</p>
                  <p className={`text-xs ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Select your preferred language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`text-sm px-3 py-1.5 rounded border outline-none ${theme === 'Dark' ? 'bg-[#0B0F1B] text-white border-white/10' : 'bg-white text-black border-gray-300'}`}
              >
                <option>English</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className={`text-xs ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Choose your preferred theme</p>
                </div>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className={`text-sm px-3 py-1.5 rounded border outline-none ${theme === 'Dark' ? 'bg-[#0B0F1B] text-white border-white/10' : 'bg-white text-black border-gray-300'}`}
              >
                <option>Dark</option>
                <option>Light</option>
                <option>Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className={`rounded-xl p-5 mb-4 border ${theme === 'Dark' ? 'bg-[#111625] border-white/5' : 'bg-gray-100 border-gray-300'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Download size={20} className="text-[#C19A4A]" />
            <h2 className="text-lg font-semibold">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Download size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Export Your Data</p>
                  <p className={`text-xs ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Download a copy of all your data</p>
                </div>
              </div>
              <button className={`text-xs px-3 py-1.5 rounded border transition-colors flex items-center gap-1 ${theme === 'Dark' ? 'bg-[#0B0F1B] text-white border-white/10 hover:bg-[#1A1F2E]' : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}>
                <Download size={14} />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-500">Delete Account</p>
                  <p className={`text-xs ${theme === 'Dark' ? 'text-gray-400' : 'text-gray-600'}`}>Permanently delete your account and all data</p>
                </div>
              </div>
              <button className="bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default SettingsPage;
