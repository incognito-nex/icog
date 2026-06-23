import React from 'react';
import { Home, Code, FileCode, Sliders, Palette, Info, Settings, ShieldAlert, Cpu } from 'lucide-react';
import { AppTheme, UserSettings } from '../types';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  theme: AppTheme;
  settings: UserSettings;
}

export default function Sidebar({ activeSection, setActiveSection, theme, settings }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'editor', label: 'Editor', icon: <Code size={18} /> },
    { id: 'scripts', label: 'Scripts', icon: <FileCode size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Sliders size={18} /> },
    { id: 'about', label: 'Workspace Info', icon: <Info size={18} /> },
  ];

  return (
    <div
      style={{
        backgroundColor: theme.sidebarBg,
        borderColor: theme.borderColor,
      }}
      className="w-16 sm:w-60 h-full shrink-0 border-r flex flex-col justify-between font-sans transition-all duration-300 relative z-30 select-none"
    >
      {/* Top Header - Brand Only in Crucial Place */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="h-14 flex items-center justify-center sm:justify-start px-4 border-b overflow-hidden"
      >
        <div className="flex items-center space-x-2">
          {/* Glowing dot calibrated engine symbol */}
          <div
            style={{
              backgroundColor: theme.accent,
              boxShadow: `0 0 10px ${theme.accent}`,
            }}
            className="w-3 h-3 rounded-full shrink-0 flex items-center justify-center animate-pulse"
          >
            <div className="w-1 h-1 bg-white rounded-full" />
          </div>
          
          {/* Brand Word - understated */}
          <span className="hidden sm:inline text-xs font-bold font-mono tracking-widest text-zinc-100">
            PLAYGROUND
          </span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              id={`sidebar-btn-${item.id}`}
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-center sm:justify-start space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium font-sans border transition-all ${
                isActive
                  ? 'border-l-2 shadow-xs'
                  : 'border-transparent hover:bg-zinc-800/20'
              }`}
              style={{
                borderLeftColor: isActive ? theme.accent : 'transparent',
                color: isActive ? theme.textMain : theme.textMuted,
                backgroundColor: isActive ? `${theme.accent}14` : 'transparent',
              }}
            >
              <div
                style={{
                  color: isActive ? theme.accent : theme.textMuted,
                }}
                className={`transition-colors shrink-0`}
              >
                {item.icon}
              </div>
              <span className="hidden sm:inline font-mono tracking-wide text-[11px] truncate uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Profile Details */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="p-3 border-t flex items-center space-x-2.5 overflow-hidden"
      >
        <div className="relative group shrink-0 mx-auto sm:mx-0">
          <img
            src={settings.account.avatarUrl}
            alt={settings.account.username}
            className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
          />
          <div
            style={{ backgroundColor: theme.accent }}
            className="absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-zinc-950"
          />
        </div>

        <div className="hidden sm:flex flex-col text-left truncate flex-1">
          <span className="text-[11px] font-bold font-mono text-zinc-200 tracking-tight">
            {settings.account.username}
          </span>
          <span
            style={{ color: theme.accent }}
            className="text-[8px] font-mono font-bold tracking-widest uppercase flex items-center space-x-0.5"
          >
            <span>Developer</span>
          </span>
        </div>
      </div>
    </div>
  );
}
