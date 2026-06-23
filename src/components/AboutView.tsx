import React from 'react';
import { Info, Cpu, Code, TerminalSquare } from 'lucide-react';
import { AppTheme, UserSettings } from '../types';

interface AboutViewProps {
  theme: AppTheme;
  settings: UserSettings;
}

export default function AboutView({ theme, settings }: AboutViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 font-sans text-left">
      
      {/* Title */}
      <div className="pb-4 border-b text-left" style={{ borderColor: theme.borderColor }}>
        <h1 className="text-xl font-extrabold tracking-tight uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
          <Info className="w-5 h-5 shrink-0" style={{ color: theme.accent }} />
          <span>Workspace Info</span>
        </h1>
        <p className="text-xs mt-1 font-medium" style={{ color: theme.textMuted }}>
          Technical specifications & instructions of your sandboxed Luau workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-4xl text-left">
        
        {/* Technical Specs Card */}
        <div 
          className="border p-5 rounded-2xl space-y-4 shadow-xs" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        >
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
            <Cpu size={14} className="mr-2" style={{ color: theme.accent }} />
            Environment Specifications
          </h3>

          <div className="space-y-3 text-xs font-mono" style={{ color: theme.textMuted }}>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>PIPELINE</span>
              <span className="font-extrabold" style={{ color: theme.textMain }}>PLAYGROUND CORE</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>RELOAD</span>
              <span className="font-semibold" style={{ color: theme.accent }}>HOT RELOAD ACTIVE</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>COMPILER</span>
              <span style={{ color: theme.textMain }}>LUAU TS INTERPRETER</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>HOST PORT</span>
              <span style={{ color: theme.textMain }}>PORT 3000 STANDARD</span>
            </div>
          </div>
        </div>

        {/* Keyboard controller schema shortcuts */}
        <div 
          className="border p-5 rounded-2xl space-y-4 shadow-xs" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        >
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
            <TerminalSquare size={14} className="mr-2" style={{ color: theme.accent }} />
            Console Shortcuts
          </h3>

          <div className="space-y-3 text-xs font-mono" style={{ color: theme.textMuted }}>
            <div 
              className="flex justify-between items-center p-2 rounded-xl border"
              style={{ backgroundColor: theme.isLight ? '#fafafa' : '#121214', borderColor: theme.borderColor }}
            >
              <div>
                <div className="font-bold" style={{ color: theme.textMain }}>Ctrl + P</div>
                <div className="text-[9px] uppercase mt-0.5">Toggle Command Search Palette</div>
              </div>
            </div>

            <div 
              className="flex justify-between items-center p-2 rounded-xl border"
              style={{ backgroundColor: theme.isLight ? '#fafafa' : '#121214', borderColor: theme.borderColor }}
            >
              <div>
                <div className="font-bold" style={{ color: theme.textMain }}>Ctrl + S</div>
                <div className="text-[9px] uppercase mt-0.5">Save Active script code</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div 
          className="border p-5 rounded-2xl md:col-span-2 space-y-3 shadow-xs" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        >
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
            <Code size={14} className="mr-2" style={{ color: theme.accent }} />
            Architectural Philosophy
          </h3>
          <p className="text-xs font-mono leading-relaxed uppercase" style={{ color: theme.textMuted }}>
            This workspace provides a professional Roblox Luau scripting playground designed with pixel-perfect simplicity. By prioritizing uncluttered typography, flexible light/dark appearances, and instantaneous hot-saves, developers can write high-caliber lua scripts entirely within a clean, noise-free local dashboard environment.
          </p>
        </div>

      </div>
    </div>
  );
}
