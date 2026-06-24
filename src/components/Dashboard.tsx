import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Plus, Star, ArrowRight,
  Terminal, Settings, Flame, Cpu, Activity, Zap, CheckCircle2
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
  
  const [statusColorText, setStatusColorText] = useState('green');

  // Simulated Executor Core Telemetry States
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] >> Luau virtual thread active`,
    `[${new Date().toLocaleTimeString()}] >> Memory registers verified stable`,
    `[${new Date().toLocaleTimeString()}] >> Status channel: secure`
  ]);
  const [simulatedFps, setSimulatedFps] = useState(144.2);
  const [simulatedCpu, setSimulatedCpu] = useState(0.65);
  const [simulatedMem, setSimulatedMem] = useState(38.2);
  const [activeThreads, setActiveThreads] = useState(4);
  const [injectionStatus, setInjectionStatus] = useState<'READY' | 'INJECTING' | 'SUCCESS'>('READY');
  const [injectionLog, setInjectionLog] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedFps(prev => +(prev + (Math.random() * 1.6 - 0.8)).toFixed(1));
      setSimulatedCpu(prev => +(Math.max(0.1, prev + (Math.random() * 0.28 - 0.14))).toFixed(2));
      setSimulatedMem(prev => +(Math.max(10.0, prev + (Math.random() * 0.4 - 0.2))).toFixed(1));
      setActiveThreads(prev => {
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(3, Math.min(10, prev + change));
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const triggerSimulation = () => {
    if (injectionStatus !== 'READY') return;
    setInjectionStatus('INJECTING');
    setInjectionLog('Scanning game registers...');
    
    setTimeout(() => {
      setInjectionLog('Hooking Luau thread scheduler...');
    }, 700);
    
    setTimeout(() => {
      setInjectionLog('Injecting core bypass libraries...');
    }, 1400);

    setTimeout(() => {
      setInjectionLog('Validating sandbox security borders...');
    }, 2100);

    setTimeout(() => {
      setInjectionLog('Active Connection Established!');
      setInjectionStatus('SUCCESS');
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] >> [SUCCESS] Luau executor attached successfully.`,
        `[${new Date().toLocaleTimeString()}] >> Hook integrity check: 100% active`
      ]);
    }, 2800);
  };

  // Fetch status color from tracker on mount
  useEffect(() => {
    const fetchStatusColor = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/incognito-updates/tracker/refs/heads/main/colour');
        if (response.ok) {
          const text = (await response.text()).trim().toLowerCase();
          if (['green', 'red', 'yellow'].includes(text)) {
            setStatusColorText(text);
          }
        }
      } catch (e) {
        console.warn("Error fetching status color from tracker:", e);
      }
    };
    fetchStatusColor();
  }, []);

  // Left column variables
  const recentFiles = [...files]
    .filter(f => f.type === 'file')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const favoriteFiles = [...files]
    .filter(f => f.type === 'file' && f.isFavorite)
    .slice(0, 4);

  const handleCreateNewScript = () => {
    const scriptName = `script_${Math.floor(Math.random() * 900) + 100}.lua`;
    onCreateNewFile(scriptName, 'file', '-- Welcome to Lua/u workspace\nprint("Hello World from Incognito IDE!")');
    setActiveSection('editor');
  };

  return (
    <div 
      id="dashboard-viewport" 
      className="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-y-auto relative select-none pb-12"
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }}
    >
      {/* Laser Scanning Sweep Line */}
      <div 
        className="absolute top-0 left-0 w-full h-[1px] animate-[pulse_3s_infinite] pointer-events-none z-20"
        style={{
          background: `linear-gradient(to right, transparent, ${theme.accent}80, transparent)`
        }}
      />

      {/* Ambient Radial Glows */}
      <div 
        style={{
          background: `radial-gradient(circle at 50% 15%, ${theme.accent}12, transparent 50%)`
        }}
        className="absolute inset-0 pointer-events-none" 
      />

      {/* Top Welcome Panel with Executor Header Look */}
      <div 
        className="p-6 border-b shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative backdrop-blur-sm"
        style={{ borderColor: theme.borderColor, backgroundColor: `${theme.headerBg}cc` }}
      >
        <div className="text-left space-y-1">
          <div className="flex items-center space-x-2.5">
            <span 
              style={{
                color: theme.accent,
                backgroundColor: `${theme.accent}15`,
                borderColor: `${theme.accent}30`
              }}
              className="text-[11px] font-mono tracking-widest font-extrabold uppercase px-2.5 py-1 rounded border shadow-md"
            >
              Incognito 3
            </span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-xl sm:text-2xl font-black tracking-tight text-white pt-1"
          >
            Welcome back, <span style={{ color: theme.accent }}>{settings.account.username}</span>
          </motion.h1>
          <p className="text-[11px] font-mono tracking-tight text-zinc-500">
            System registers: SECURED. Execution pipeline active. Attached thread: #7204.
          </p>
        </div>

        {/* Executor Server Status Badge */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
          <div 
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold font-mono tracking-wider select-none uppercase bg-zinc-900/60"
            style={{ borderColor: theme.borderColor }}
          >
            <span className="text-zinc-500 font-bold">STATUS :</span>
            <span 
              className="w-1.5 h-1.5 rounded-full inline-block animate-ping shrink-0" 
              style={{ 
                backgroundColor: statusColorText === 'red' ? '#ef4444' : statusColorText === 'yellow' ? '#f59e0b' : '#10b981', 
              }} 
            />
            <span 
              className="font-black text-[9px]"
              style={{ 
                color: statusColorText === 'red' ? '#ef4444' : statusColorText === 'yellow' ? '#f59e0b' : '#10b981',
              }}
            >
              {statusColorText.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="p-6 space-y-8 max-w-7xl mx-auto w-full z-10 relative text-left">
        
        {/* Six Telemetry HUD cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          
          {/* Card 1: Injection Status */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.02 }}
            onClick={triggerSimulation}
            style={{ 
              borderColor: injectionStatus === 'SUCCESS' ? `${theme.accent}60` : theme.borderColor,
              boxShadow: injectionStatus === 'SUCCESS' ? `0 0 15px ${theme.accent}15` : 'none'
            }}
            className="p-4.5 rounded-xl border text-left relative overflow-hidden bg-zinc-950/60 backdrop-blur-md hover:border-zinc-700/80 transition-all duration-300 group cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                Injection Status
              </span>
              <Zap 
                size={13} 
                className={`transition-colors ${injectionStatus === 'SUCCESS' ? 'text-emerald-400' : injectionStatus === 'INJECTING' ? 'text-amber-400 animate-spin' : 'text-zinc-500'}`}
                style={{ color: injectionStatus === 'SUCCESS' ? undefined : injectionStatus === 'READY' ? theme.accent : undefined }}
              />
            </div>
            <div className="mt-4">
              <span 
                className="text-xl font-extrabold font-mono tracking-tight drop-shadow-md"
                style={{ color: injectionStatus === 'SUCCESS' ? '#34d399' : injectionStatus === 'INJECTING' ? '#fbbf24' : '#e4e4e7' }}
              >
                {injectionStatus === 'SUCCESS' ? 'Injected' : injectionStatus === 'INJECTING' ? 'Injecting...' : 'Not Injected'}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block mt-1.5 leading-relaxed">
                {injectionStatus === 'SUCCESS' ? 'Bypass active and ready' : 'Number of running Luau threads'}
              </span>
            </div>
          </motion.div>

          {/* Card 2: UNC Compatibility */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.04 }}
            style={{ borderColor: theme.borderColor }}
            className="p-4.5 rounded-xl border text-left relative overflow-hidden bg-zinc-950/60 backdrop-blur-md hover:border-zinc-700/80 transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                UNC Compatibility
              </span>
              <Activity size={13} style={{ color: theme.accent }} />
            </div>
            <div className="mt-4">
              <span className="text-xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
                Example: 98.7% Supported
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block mt-1.5 leading-relaxed">
                Meets complete execution guidelines
              </span>
            </div>
          </motion.div>

          {/* Card 3: Active Threads */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.06 }}
            style={{ borderColor: theme.borderColor }}
            className="p-4.5 rounded-xl border text-left relative overflow-hidden bg-zinc-950/60 backdrop-blur-md hover:border-zinc-700/80 transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                Active Threads
              </span>
              <Cpu size={13} style={{ color: theme.accent }} />
            </div>
            <div className="mt-4">
              <span className="text-xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
                {activeThreads} Threads
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block mt-1.5 leading-relaxed">
                Number of running Luau threads
              </span>
            </div>
          </motion.div>

          {/* Card 4: Luau Heap Usage */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.08 }}
            style={{ borderColor: theme.borderColor }}
            className="p-4.5 rounded-xl border text-left relative overflow-hidden bg-zinc-950/60 backdrop-blur-md hover:border-zinc-700/80 transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                Luau Heap Usage
              </span>
              <Cpu size={13} style={{ color: theme.accent }} />
            </div>
            <div className="mt-4">
              <span className="text-xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
                {simulatedMem} MB
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block mt-1.5 leading-relaxed">
                Memory used by the executor's Luau VM
              </span>
            </div>
          </motion.div>

          {/* Card 5: Execution Success Rate */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            style={{ borderColor: theme.borderColor }}
            className="p-4.5 rounded-xl border text-left relative overflow-hidden bg-zinc-950/60 backdrop-blur-md hover:border-zinc-700/80 transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                Execution Success Rate
              </span>
              <CheckCircle2 size={13} style={{ color: theme.accent }} />
            </div>
            <div className="mt-4">
              <span className="text-xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
                99.4%
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block mt-1.5 leading-relaxed">
                Percentage of scripts that executed successfully
              </span>
            </div>
          </motion.div>

          {/* Card 6: CPU Usage */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.12 }}
            style={{ borderColor: theme.borderColor }}
            className="p-4.5 rounded-xl border text-left relative overflow-hidden bg-zinc-950/60 backdrop-blur-md hover:border-zinc-700/80 transition-all duration-300 group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                CPU Usage
              </span>
              <Activity size={13} style={{ color: theme.accent }} />
            </div>
            <div className="mt-4">
              <span className="text-xl font-extrabold font-mono tracking-tight text-white drop-shadow-md">
                {simulatedCpu}%
              </span>
              <span className="text-[10px] font-mono text-zinc-500 block mt-1.5 leading-relaxed">
                Current executor process CPU usage
              </span>
            </div>
          </motion.div>

        </div>

        {/* Console logs status panel */}
        <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/10 to-transparent pointer-events-none" />
          <div className="px-4 py-2.5 bg-zinc-900/85 border-b border-zinc-800/90 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal size={11} style={{ color: theme.accent }} />
              <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                Executor VM Status Log
              </span>
            </div>
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500/30" />
              <div className="w-2 h-2 rounded-full bg-amber-500/30" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
            </div>
          </div>
          
          <div className="p-4.5 font-mono text-[10px] leading-relaxed text-left space-y-1.5 max-h-36 overflow-y-auto select-text scrollbar-thin scrollbar-thumb-zinc-800">
            {logs.map((log, lIdx) => (
              <div key={lIdx} className="text-zinc-400 hover:text-zinc-200 transition duration-100">
                <span className="text-zinc-650 font-bold">[{lIdx + 1}]</span> {log}
              </div>
            ))}
            
            {injectionStatus === 'INJECTING' && (
              <div className="text-amber-400 font-bold animate-pulse">
                &gt;&gt; [SYS] {injectionLog}
              </div>
            )}
            {injectionStatus === 'SUCCESS' && (
              <div className="text-emerald-400 font-bold flex items-center space-x-1.5">
                <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                <span>&gt;&gt; [VM] Active Hook Connected: {injectionLog}</span>
              </div>
            )}
            
            <div style={{ color: theme.accent }} className="blink font-bold">&gt; _</div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-2 text-zinc-500">
            <Flame size={10} className="text-amber-500 animate-pulse shrink-0" />
            <span>Workspace Management Quick-Actions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            <button
              onClick={handleCreateNewScript}
              className="p-5 rounded-xl border border-zinc-800/80 text-left flex items-start space-x-4 bg-zinc-950/60 backdrop-blur-xs hover:border-zinc-700 hover:bg-zinc-900/10 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl cursor-pointer group"
            >
              <div 
                style={{
                  color: '#10b981',
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  borderColor: 'rgba(16,185,129,0.2)'
                }}
                className="p-3 rounded-lg border group-hover:bg-emerald-500/20 transition-colors"
              >
                <Plus size={16} />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold font-mono tracking-tight block text-zinc-200">Append New script</span>
                <span className="text-[10px] text-zinc-500 block mt-1 leading-relaxed">Creates a fresh Luau code node inside space</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('settings')}
              className="p-5 rounded-xl border border-zinc-800/80 text-left flex items-start space-x-4 bg-zinc-950/60 backdrop-blur-xs hover:border-zinc-700 hover:bg-zinc-900/10 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl cursor-pointer group"
            >
              <div 
                style={{
                  color: theme.accent,
                  backgroundColor: `${theme.accent}15`,
                  borderColor: `${theme.accent}30`
                }}
                className="p-3 rounded-lg border group-hover:bg-opacity-20 transition-colors"
              >
                <Settings size={16} />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold font-mono tracking-tight block text-zinc-200">Luau configuration</span>
                <span className="text-[10px] text-zinc-500 block mt-1 leading-relaxed">Define syntax engines, profiles and theme guides</span>
              </div>
            </button>
          </div>
        </div>

        {/* Recently Modified & Pinned Hubs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Recent Files List */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-2 text-zinc-500">
              <FileText size={10} style={{ color: theme.accent }} className="shrink-0" />
              <span>Recently Modified scripts</span>
            </h2>
            <div className="space-y-2.5">
              {recentFiles.length === 0 ? (
                <div className="border border-dashed border-zinc-800 p-8 rounded-xl text-center text-xs font-mono text-zinc-650">
                  No scripts cached in memory.
                </div>
              ) : (
                recentFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => onOpenFileInEditor(file.id)}
                    className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-900/20 hover:border-zinc-700 transition-all duration-200 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div 
                        style={{
                          color: theme.accent,
                          backgroundColor: `${theme.accent}10`,
                          borderColor: `${theme.accent}20`
                        }}
                        className="p-2 rounded-lg border group-hover:bg-opacity-20 transition-colors"
                      >
                        <FileText size={12} className="shrink-0" />
                      </div>
                      <div className="text-left min-w-0">
                        <span 
                          style={{ color: theme.textMain }}
                          className="text-xs font-bold font-mono truncate block group-hover:opacity-80 transition-opacity"
                        >
                          {file.name}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 block mt-0.5">
                          Length: {file.size} characters
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Favorite Files List */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-2 text-zinc-500">
              <Star size={10} className="text-amber-500 shrink-0" />
              <span>Pinned script hub</span>
            </h2>
            <div className="space-y-2.5">
              {favoriteFiles.length === 0 ? (
                <div className="border border-dashed border-zinc-800 p-8 rounded-xl text-center text-xs font-mono text-zinc-650">
                  No pinned script slots reserved yet.
                </div>
              ) : (
                favoriteFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => onOpenFileInEditor(file.id)}
                    className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-900/20 hover:border-zinc-700 transition-all duration-200 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="p-2 rounded-lg bg-amber-500/5 text-amber-500 border border-amber-500/10 group-hover:bg-amber-500/10 transition-colors">
                        <Star size={12} className="fill-amber-500/10 shrink-0" />
                      </div>
                      <div className="text-left min-w-0">
                        <span 
                          style={{ color: theme.textMain }}
                          className="text-xs font-bold font-mono truncate block group-hover:text-amber-400 transition-colors"
                        >
                          {file.name}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 block mt-0.5">
                          Locked execution slot
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={12} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
