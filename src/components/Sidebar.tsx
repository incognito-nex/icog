import React from 'react';
import { motion } from 'motion/react';
import { Home, Code, FileCode, Sliders, Palette, Info, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { AppTheme, UserSettings } from '../types';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  theme: AppTheme;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

export default function Sidebar({ activeSection, setActiveSection, theme, settings, setSettings }: SidebarProps) {
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [tempName, setTempName] = React.useState(settings.account.username);
  const [tempTitle, setTempTitle] = React.useState(settings.account.badge || 'Lead Architect');
  const [tempAvatar, setTempAvatar] = React.useState(settings.account.avatarUrl);

  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'editor', label: 'Editor', icon: <Code size={18} /> },
    { id: 'scripts', label: 'Scripts', icon: <FileCode size={18} /> },
    ...(settings.experimental?.multiAccountInjection ? [{ id: 'multiaccount', label: 'Multi-Account', icon: <Cpu size={18} /> }] : []),
    { id: 'settings', label: 'Settings', icon: <Sliders size={18} /> },
    { id: 'about', label: 'Workspace Info', icon: <Info size={18} /> },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      account: {
        ...prev.account,
        username: tempName.trim() || prev.account.username,
        badge: tempTitle.trim() || 'Lead Architect',
        avatarUrl: tempAvatar.trim() || prev.account.avatarUrl
      }
    }));
    setShowProfileModal(false);
  };

  React.useEffect(() => {
    setTempName(settings.account.username);
    setTempTitle(settings.account.badge || 'Lead Architect');
    setTempAvatar(settings.account.avatarUrl);
  }, [settings.account]);

  return (
    <div
      style={{
        backgroundColor: theme.sidebarBg,
        borderColor: theme.borderColor,
      }}
      className="w-16 sm:w-60 h-full shrink-0 border-r flex flex-col justify-between font-sans transition-all duration-300 relative z-30 select-none"
    >
      {/* Top Header - Premium Minimalist Status (No big INCO-3 branding, no bulky bars) */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="pt-6 pb-4 px-4 border-b overflow-hidden select-none"
      >
        {/* Desktop View: Full sleek dashboard status panel */}
        <div className="hidden sm:flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            {/* Pulsing state LEDs */}
            <div className="flex space-x-1.5 items-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme.accent }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme.accent }}></span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></span>
            </div>
            <span className="text-[8px] font-mono font-extrabold tracking-widest text-zinc-500 uppercase">
              SYS WORKSPACE
            </span>
          </div>
          <div className="pt-2 flex flex-col space-y-0.5">
            <span className="text-[10px] font-mono font-black text-zinc-300 tracking-wider">
              ONLINE & RUNNING
            </span>
            <span className="text-[7.5px] font-mono text-zinc-500 tracking-tight uppercase">
              Latency: 14ms // Secure Tunnel
            </span>
          </div>
        </div>

        {/* Mobile View: Single centered sleek pulsing LED dot */}
        <div className="flex sm:hidden justify-center items-center py-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme.accent }}></span>
            <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: theme.accent }}></span>
          </span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <motion.button
              id={`sidebar-btn-${item.id}`}
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-full flex items-center justify-center sm:justify-start space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium font-sans border transition-all relative cursor-pointer outline-none ${
                isActive
                  ? 'border-transparent bg-transparent'
                  : 'border-transparent hover:bg-zinc-800/10'
              }`}
              style={{
                color: isActive ? theme.textMain : theme.textMuted,
                boxShadow: 'none',
              }}
            >
              <div
                style={{
                  color: isActive ? theme.accent : theme.textMuted,
                  filter: isActive ? `drop-shadow(0 0 5px ${theme.accent}50)` : 'none',
                }}
                className="transition-all duration-200 shrink-0"
              >
                {item.icon}
              </div>
              <span className={`hidden sm:inline font-mono tracking-wider text-[10.5px] truncate uppercase transition-all duration-200 ${
                isActive ? 'font-black' : 'font-semibold'
              }`}
              style={{
                color: isActive ? theme.textMain : theme.textMuted,
              }}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-2 w-[3.5px] h-5 rounded-full"
                  style={{ 
                    backgroundColor: theme.accent,
                    boxShadow: `0 0 8px ${theme.accent}, 0 0 3px ${theme.accent}`
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Profile Details */}
      <div className="relative">
        <button
          onClick={() => setShowProfileModal(!showProfileModal)}
          style={{ borderColor: theme.borderColor }}
          className="w-full p-4 border-t flex items-center space-x-5 overflow-hidden hover:bg-zinc-800/10 cursor-pointer text-left transition-all duration-200"
        >
          <div className="relative group shrink-0 mx-auto sm:mx-0">
            <img
              src={settings.account.avatarUrl}
              alt={settings.account.username}
              className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
            />
            <div
              style={{ backgroundColor: theme.accent }}
              className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-zinc-950 animate-pulse"
            />
          </div>

          <div className="hidden sm:flex flex-col text-left truncate flex-1 pl-1.5">
            <span className="text-[11px] font-bold font-mono text-zinc-200 tracking-tight">
              {settings.account.username}
            </span>
            <span
              style={{ color: theme.accent }}
              className="text-[8px] font-mono font-bold tracking-widest uppercase flex items-center space-x-0.5 mt-1"
            >
              <span>{settings.account.badge || 'Developer'}</span>
            </span>
          </div>
        </button>

        {/* Float absolute Card modal next to/above profile */}
        {showProfileModal && (
          <form
            onSubmit={handleSaveProfile}
            style={{ 
              backgroundColor: theme.isLight ? '#fcfcfc' : '#0f1013', 
              borderColor: theme.borderColor,
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
            }}
            className="absolute bottom-16 left-2 sm:left-4 z-50 w-64 border rounded-2xl p-4 space-y-3.5 focus-within:ring-1"
            style-ring={{ ringColor: theme.accent }}
          >
            <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span className="text-[9px] font-mono font-extrabold tracking-widest uppercase" style={{ color: theme.accent }}>
                Quick Persona Edit
              </span>
              <button 
                type="button" 
                onClick={() => setShowProfileModal(false)}
                className="text-[9px] font-mono font-bold uppercase transition hover:text-rose-500 text-zinc-500"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-2">
              <div className="space-y-1 text-left">
                <label className="text-[8px] font-mono font-bold uppercase tracking-widest block text-zinc-500">Name</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-mono focus:outline-none ${
                    theme.isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-black/40 text-white border-zinc-800'
                  }`}
                  placeholder="Architect Name"
                  maxLength={18}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[8px] font-mono font-bold uppercase tracking-widest block text-zinc-500">Professional Title</label>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-mono focus:outline-none ${
                    theme.isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-black/40 text-white border-zinc-800'
                  }`}
                  placeholder="Exploit Engineer / Lead Designer"
                  maxLength={22}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[8px] font-mono font-bold uppercase tracking-widest block text-zinc-500">Avatar URL</label>
                <input
                  type="text"
                  value={tempAvatar}
                  onChange={(e) => setTempAvatar(e.target.value)}
                  className={`w-full py-1.5 px-2.5 rounded-lg border text-[11px] font-mono focus:outline-none ${
                    theme.isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-black/40 text-white border-zinc-800'
                  }`}
                  placeholder="Image link..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl text-[10px] font-mono font-black uppercase text-center tracking-widest transition duration-150 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: theme.accent, color: theme.isLight ? '#ffffff' : '#000000' }}
            >
              Update Credentials
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
