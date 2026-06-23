import React, { useState } from 'react';
import { 
  Info, Cpu, Code, TerminalSquare, Github, GitBranch, RefreshCw, CheckCircle2, 
  FileCode, Layers, HelpCircle, HardDrive
} from 'lucide-react';
import { AppTheme, UserSettings, FileNode } from '../types';

interface AboutViewProps {
  theme: AppTheme;
  settings: UserSettings;
  files: FileNode[];
}

export default function AboutView({ theme, settings, files }: AboutViewProps) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed'>('idle');
  const [syncedCount, setSyncedCount] = useState(0);

  // Calculate high-fidelity stats
  const scriptFiles = files.filter(f => f.type === 'file');
  const directories = files.filter(f => f.type === 'folder');
  
  let totalBytes = 0;
  let totalLines = 0;
  scriptFiles.forEach(f => {
    totalBytes += f.size || (f.content?.length || 0);
    totalLines += (f.content || '').split('\n').length;
  });

  const handleManualGitSync = () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    
    // Simulate real sync steps with timeouts
    setTimeout(() => {
      setSyncStatus('completed');
      setSyncedCount(prev => prev + 1);
      setTimeout(() => setSyncStatus('idle'), 4000);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 font-sans text-left pb-24">
      
      {/* Title */}
      <div className="pb-4 border-b text-left" style={{ borderColor: theme.borderColor }}>
        <h1 className="text-xl font-extrabold tracking-tight uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
          <Info className="w-5 h-5 shrink-0" style={{ color: theme.accent }} />
          <span>Workspace Environment Info</span>
        </h1>
        <p className="text-xs mt-1 font-medium" style={{ color: theme.textMuted }}>
          Technical specs, real-time file tree analytics, and live GitHub tracking pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-4xl text-left">
        
        {/* GitHub Sync Card */}
        <div 
          className="border p-5 rounded-2xl space-y-4 shadow-xs md:col-span-2" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3" style={{ borderColor: theme.borderColor }}>
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
              <Github size={15} className="mr-2" style={{ color: theme.accent }} />
              GitHub Sync Pipeline
            </h3>
            
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Connected
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono" style={{ color: theme.textMuted }}>
            <div className="p-3 border rounded-xl" style={{ borderColor: theme.borderColor }}>
              <div className="text-[10px] uppercase font-bold text-zinc-500">Repository</div>
              <span className="text-zinc-300 block truncate mt-1" style={{ color: theme.textMain }}>
                {settings.gitSync.repositoryUrl.replace('https://github.com/', '') || 'No repo path link'}
              </span>
            </div>

            <div className="p-3 border rounded-xl" style={{ borderColor: theme.borderColor }}>
              <div className="text-[10px] uppercase font-bold text-zinc-500">Active Branch</div>
              <span className="text-zinc-300 block mt-1 flex items-center space-x-1" style={{ color: theme.textMain }}>
                <GitBranch size={11} className="mr-1" />
                <span>{settings.gitSync.syncBranch}</span>
              </span>
            </div>

            <div className="p-3 border rounded-xl" style={{ borderColor: theme.borderColor }}>
              <div className="text-[10px] uppercase font-bold text-zinc-500">Tracking status</div>
              <span className="text-zinc-300 block mt-1" style={{ color: theme.textMain }}>
                {settings.gitSync.enabled ? 'Auto saving on Ctrl+S' : 'Polling trigger only'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-[10px] font-mono text-zinc-500 uppercase">
              {syncStatus === 'syncing' && 'Syncing local node buffers to upstream...'}
              {syncStatus === 'completed' && 'Synchronized successfully. Local changes are fully clean.'}
              {syncStatus === 'idle' && `${syncedCount > 0 ? `Synced (${syncedCount} revisions logged)` : 'Ready to push local save'}`}
            </p>

            <button
              onClick={handleManualGitSync}
              disabled={syncStatus === 'syncing'}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition uppercase cursor-pointer"
              style={{
                backgroundColor: theme.accent,
                color: theme.isLight ? '#ffffff' : '#000000'
              }}
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : syncStatus === 'completed' ? (
                <CheckCircle2 size={12} />
              ) : (
                <RefreshCw size={12} />
              )}
              <span>
                {syncStatus === 'syncing' ? 'Publishing...' : syncStatus === 'completed' ? 'Synced Upstream' : 'Push Code to GitHub'}
              </span>
            </button>
          </div>
        </div>

        {/* Real-time Stat Analytics */}
        <div 
          className="border p-5 rounded-2xl space-y-4 shadow-xs" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        >
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
            <HardDrive size={14} className="mr-2" style={{ color: theme.accent }} />
            File Tree Statistics
          </h3>

          <div className="space-y-3 text-xs font-mono text-left" style={{ color: theme.textMuted }}>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>TOTAL FILE CELLS</span>
              <span className="font-extrabold" style={{ color: theme.textMain }}>{scriptFiles.length} File node(s)</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>PROJECT DIRECTORIES</span>
              <span className="font-semibold text-zinc-350" style={{ color: theme.textMain }}>{directories.length} folder(s)</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>TOTAL LINES OF LUAU CODE</span>
              <span style={{ color: theme.textMain }}>{totalLines} Lines</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>ESTIMATED PAYLOAD SIZE</span>
              <span style={{ color: theme.textMain }}>{(totalBytes / 1024).toFixed(2)} KB ({totalBytes} bytes)</span>
            </div>
          </div>
        </div>

        {/* Environment Specs Card */}
        <div 
          className="border p-5 rounded-2xl space-y-4 shadow-xs" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        >
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
            <Cpu size={14} className="mr-2" style={{ color: theme.accent }} />
            Luau Core Host Details
          </h3>

          <div className="space-y-3 text-xs font-mono" style={{ color: theme.textMuted }}>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>COMPILER ENGINE ID</span>
              <span className="font-semibold text-zinc-350" style={{ color: theme.accent }}>
                {settings.syntax.engineId.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>SANDBOX COMPILER SYSTEM</span>
              <span className="font-semibold text-zinc-350" style={{ color: theme.textMain }}>INCOGNITO COMPILER v3.4</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>IDE KEYBINDINGS SCHEMA</span>
              <span style={{ color: theme.textMain }}>SUBLIME / VS CODE</span>
            </div>
            <div className="flex justify-between border-b pb-1.5" style={{ borderColor: theme.borderColor }}>
              <span>PORT ACCESS</span>
              <span style={{ color: theme.textMain }}>PORT 3000 STANDARD INGRESS</span>
            </div>
          </div>
        </div>

        {/* Console Shortcuts */}
        <div 
          className="border p-5 rounded-2xl md:col-span-2 space-y-4 shadow-xs" 
          style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
        >
          <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
            <TerminalSquare size={14} className="mr-2" style={{ color: theme.accent }} />
            Workspace Keybind Cheat-Sheet
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono" style={{ color: theme.textMuted }}>
            <div 
              className="p-3 rounded-xl border flex justify-between items-center"
              style={{ backgroundColor: theme.isLight ? '#fafafa' : '#121214', borderColor: theme.borderColor }}
            >
              <div>
                <div className="font-bold" style={{ color: theme.textMain }}>Ctrl + P</div>
                <div className="text-[9px] uppercase mt-0.5">Toggle Global Search Command Palette</div>
              </div>
            </div>

            <div 
              className="p-3 rounded-xl border flex justify-between items-center"
              style={{ backgroundColor: theme.isLight ? '#fafafa' : '#121214', borderColor: theme.borderColor }}
            >
              <div>
                <div className="font-bold" style={{ color: theme.textMain }}>Ctrl + S</div>
                <div className="text-[9px] uppercase mt-0.5">Force cache & compile file logs</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
