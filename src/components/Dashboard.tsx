import React from 'react';
import { motion } from 'motion/react';
import { 
  Code, FileText, Plus, Star, ArrowRight, Sparkles, Terminal, Layers
} from 'lucide-react';
import { FileNode, AppTheme, UserSettings } from '../types';

interface DashboardProps {
  files: FileNode[];
  onOpenFileInEditor: (fileId: string) => void;
  onCreateNewFile: (name: string, type: 'file' | 'folder', content?: string) => void;
  onClearTerminal: () => void;
  theme: AppTheme;
  settings: UserSettings;
  setActiveSection: (sec: string) => void;
}

export default function Dashboard({
  files,
  onOpenFileInEditor,
  onCreateNewFile,
  theme,
  settings,
  setActiveSection,
}: DashboardProps) {
  
  // Recent files (limit 3 files)
  const recentFiles = [...files]
    .filter(f => f.type === 'file')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const totalFilesCount = files.filter(f => f.type === 'file').length;
  const favoritesCount = files.filter(f => f.type === 'file' && f.isFavorite).length;

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 font-sans relative text-left">
      {/* Background glow overlay */}
      <div 
        style={{
          background: `radial-gradient(circle at 10% 10%, ${theme.accent}0a, transparent 40%)`
        }}
        className="absolute inset-0 pointer-events-none" 
      />

      {/* Header Greeting */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight select-none`}
            style={{ color: theme.textMain }}
          >
            Welcome, {settings.account.username}
          </motion.h1>
          <p className="text-sm mt-1 select-none font-medium" style={{ color: theme.textMuted }}>
            Let's build something beautiful. The workspace is active and calibrated.
          </p>
        </div>

        <div 
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold select-none font-mono"
          style={{ 
            backgroundColor: `${theme.accent}0d`, 
            borderColor: theme.borderColor,
            color: theme.textMain 
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Local Development Sandbox</span>
        </div>
      </div>

      {/* Grid: Main metrics & shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Simple count cards */}
        <div 
          className="p-5 rounded-2xl border transition duration-300 hover:shadow-sm"
          style={{ 
            backgroundColor: theme.cardBg, 
            borderColor: theme.borderColor 
          }}
        >
          <span className="text-[10px] uppercase tracking-widest font-bold font-mono" style={{ color: theme.textMuted }}>
            Workspace Files
          </span>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight" style={{ color: theme.textMain }}>
              {totalFilesCount}
            </span>
            <span className="text-xs" style={{ color: theme.textMuted }}>saved modules</span>
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border transition duration-300 hover:shadow-sm"
          style={{ 
            backgroundColor: theme.cardBg, 
            borderColor: theme.borderColor 
          }}
        >
          <span className="text-[10px] uppercase tracking-widest font-bold font-mono" style={{ color: theme.textMuted }}>
            Bookmark Pins
          </span>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-amber-500">
              {favoritesCount}
            </span>
            <span className="text-xs" style={{ color: theme.textMuted }}>starred records</span>
          </div>
        </div>

        {/* Third quick metrics card */}
        <div 
          className="p-5 rounded-2xl border transition duration-300 hover:shadow-sm flex flex-col justify-between"
          style={{ 
            backgroundColor: theme.cardBg, 
            borderColor: theme.borderColor 
          }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase tracking-widest font-bold font-mono" style={{ color: theme.textMuted }}>
              Compiles State
            </span>
            <Sparkles size={14} style={{ color: theme.accent }} />
          </div>
          <div className="mt-2 text-xs font-mono" style={{ color: theme.textMain }}>
            Luau Hot Reload Active
          </div>
        </div>

      </div>

      {/* Main Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left column: Quick Actions */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: theme.textMuted }}>
            Quick Shortcuts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveSection('editor')}
              className="p-4 rounded-xl border text-left transition duration-200 hover:-translate-y-0.5 active:translate-y-0 text-xs font-semibold flex flex-col justify-between group"
              style={{ 
                backgroundColor: theme.cardBg, 
                borderColor: theme.borderColor,
                color: theme.textMain
              }}
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-505 w-fit mb-4">
                <Plus size={16} style={{ color: theme.accent }} />
              </div>
              <div>
                <span className="font-bold font-mono tracking-tight text-sm block">New Script</span>
                <span className="text-[10px] mt-1 block" style={{ color: theme.textMuted }}>
                  Instantly append a new file node
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('editor')}
              className="p-4 rounded-xl border text-left transition duration-200 hover:-translate-y-0.5 active:translate-y-0 text-xs font-semibold flex flex-col justify-between group"
              style={{ 
                backgroundColor: theme.cardBg, 
                borderColor: theme.borderColor,
                color: theme.textMain
              }}
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 w-fit mb-4">
                <Code size={16} style={{ color: theme.accent }} />
              </div>
              <div>
                <span className="font-bold font-mono tracking-tight text-sm block">Open Editor</span>
                <span className="text-[10px] mt-1 block" style={{ color: theme.textMuted }}>
                  Launch full interactive playground
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Right column: Recent Work-in-Progress Nodes */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: theme.textMuted }}>
              Recent Script files
            </h2>
            <button 
              onClick={() => setActiveSection('editor')}
              className="text-[10px] font-bold font-mono tracking-tight uppercase flex items-center space-x-1 transition hover:opacity-80"
              style={{ color: theme.accent }}
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {recentFiles.length === 0 ? (
              <div 
                className="border border-dashed rounded-2xl p-8 text-center text-xs font-mono select-none"
                style={{ 
                  backgroundColor: `${theme.accent}03`, 
                  borderColor: theme.borderColor,
                  color: theme.textMuted 
                }}
              >
                No active modules located.
              </div>
            ) : (
              recentFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => onOpenFileInEditor(file.id)}
                  className="p-3.5 rounded-xl border transition duration-200 hover:scale-[1.01] cursor-pointer flex items-center justify-between"
                  style={{ 
                    backgroundColor: theme.cardBg, 
                    borderColor: theme.borderColor 
                  }}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <FileText size={16} style={{ color: theme.accent }} className="shrink-0" />
                    <div className="truncate text-left font-mono">
                      <span className="text-xs font-bold tracking-tight block" style={{ color: theme.textMain }}>
                        {file.name}
                      </span>
                      <span className="text-[9px]" style={{ color: theme.textMuted }}>
                        Modified: {new Date(file.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {file.isFavorite && (
                    <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
