import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, FileText, Plus, Star, ArrowRight, Sparkles, Layers,
  Search, Filter, ChevronDown, ChevronUp, RefreshCw, Calendar,
  Heart, Terminal, Settings, Info, UserCheck, Flame, X, Cpu, Activity, Zap, CheckCircle2
} from 'lucide-react';
import { FileNode, AppTheme, UserSettings, UpdateItem } from '../types';

interface DashboardProps {
  files: FileNode[];
  onOpenFileInEditor: (fileId: string) => void;
  onCreateNewFile: (name: string, type: 'file' | 'folder', content?: string) => void;
  onClearTerminal: () => void;
  theme: AppTheme;
  settings: UserSettings;
  setActiveSection: (sec: string) => void;
}

const DEFAULT_UPDATES: UpdateItem[] = [
  {
    id: 'upd-default-1',
    date: '2025-06-23',
    title: 'TEST 1 FIRST',
    description: 'TESTING1, TESTING2, TESTING3, TESTING4',
    highlightedText: 'TESTING2',
    redCrossesText: 'TESTING3',
    greenPlusText: 'TESTING4',
    names: ['TEST', 'TEST2', 'TEST3']
  },
  {
    id: 'upd-default-2',
    date: '2025-02-13',
    title: 'TEST 2 SECOND',
    description: 'TESTING1, TESTING2, TESTING3, TESTING4',
    highlightedText: 'TESTING2',
    redCrossesText: 'TESTING3',
    greenPlusText: 'TESTING4',
    names: ['TEST', 'TEST2', 'TEST3']
  }
];

export default function Dashboard({
  files,
  onOpenFileInEditor,
  onCreateNewFile,
  theme,
  settings,
  setActiveSection,
}: DashboardProps) {
  
  // Updates State
  const [updates, setUpdates] = useState<UpdateItem[]>(DEFAULT_UPDATES);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [updatesError, setUpdatesError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [timeFilter, setTimeFilter] = useState<'All' | 'Week' | 'Month' | 'Year'>('All');
  const [statusColorText, setStatusColorText] = useState('green');
  const [expandedUpdates, setExpandedUpdates] = useState<Record<string, boolean>>({
    'upd-default-1': true
  });

  // Simulated Executor Core Telemetry States
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] >> Luau virtual thread active`,
    `[${new Date().toLocaleTimeString()}] >> Memory registers verified stable`,
    `[${new Date().toLocaleTimeString()}] >> Status channel: secure`
  ]);
  const [simulatedFps, setSimulatedFps] = useState(144.2);
  const [simulatedCpu, setSimulatedCpu] = useState(0.65);
  const [simulatedMem, setSimulatedMem] = useState(38.2);
  const [injectionStatus, setInjectionStatus] = useState<'READY' | 'INJECTING' | 'SUCCESS'>('READY');
  const [injectionLog, setInjectionLog] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedFps(prev => +(prev + (Math.random() * 1.6 - 0.8)).toFixed(1));
      setSimulatedCpu(prev => +(Math.max(0.1, prev + (Math.random() * 0.28 - 0.14))).toFixed(2));
      setSimulatedMem(prev => +(Math.max(10.0, prev + (Math.random() * 0.4 - 0.2))).toFixed(1));
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

  // Fetch and Parse updates from GitHub Tracker
  const fetchUpdates = async () => {
    setLoadingUpdates(true);
    setUpdatesError(null);
    try {
      const response = await fetch('https://raw.githubusercontent.com/incognito-updates/tracker/main/UPDS.txt');
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const rawText = await response.text();
      const parsed = parseUpdatesText(rawText);
      if (parsed.length > 0) {
        setUpdates(parsed);
        setExpandedUpdates({ [parsed[0].id]: true });
      } else {
        setUpdates(DEFAULT_UPDATES);
        setExpandedUpdates({ 'upd-default-1': true });
      }
    } catch (err: any) {
      console.warn("Failed to fetch updates, falling back to cached system records:", err);
      setUpdatesError("Could not refresh live updates. Showing offline backup.");
      setUpdates(DEFAULT_UPDATES);
      setExpandedUpdates({ 'upd-default-1': true });
    } finally {
      setLoadingUpdates(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchUpdates();
  }, []);

  // Update parser helper
  const parseUpdatesText = (text: string): UpdateItem[] => {
    const list: UpdateItem[] = [];
    const lines = text.split('\n').map(l => l.trim());
    
    let currentBlock: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      // Matches standard [YYYY, MM, DD] or [YYYY, M, D]
      const dateMatch = line.match(/^\[\s*(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*\]$/);
      if (dateMatch) {
        const year = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
        const day = parseInt(dateMatch[3]);
        const matchedDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (!currentBlock) {
          currentBlock = {
            id: `upd-${i}-${year}-${month}-${day}`,
            date: matchedDateStr,
            title: '',
            description: '',
            highlightedText: '',
            redCrossesText: '',
            greenPlusText: '',
            names: []
          };
        } else {
          // If the date is the same, assume it's a closing tag.
          if (currentBlock.date === matchedDateStr) {
            list.push(currentBlock);
            currentBlock = null;
          } else {
            // Different date! Auto-push the old block and start the new one
            list.push(currentBlock);
            currentBlock = {
              id: `upd-${i}-${year}-${month}-${day}`,
              date: matchedDateStr,
              title: '',
              description: '',
              highlightedText: '',
              redCrossesText: '',
              greenPlusText: '',
              names: []
            };
          }
        }
        continue;
      }
      
      if (currentBlock) {
        const titleMatch = line.match(/^TITLE\s*:\s*(.*)$/i);
        const descMatch = line.match(/^DESCRIPTION\s*:\s*(.*)$/i);
        const highlightMatch = line.match(/^HIGHLIGHTED_TEXT_IN_DESCRIPTION\s*:\s*(.*)$/i);
        const redCrossMatch = line.match(/^RED_CROSSES_TEXT_IN_DESCRIPTION\s*:\s*(.*)$/i);
        const greenPlusMatch = line.match(/^GREEN_PLUS_TEXT_IN_DESCRIPTION\s*:\s*(.*)$/i);
        const namesMatch = line.match(/^NAMES\s*:\s*(.*)$/i);

        if (titleMatch) {
          currentBlock.title = titleMatch[1].trim();
        } else if (descMatch) {
          currentBlock.description = descMatch[1].trim();
        } else if (highlightMatch) {
          currentBlock.highlightedText = highlightMatch[1].trim();
        } else if (redCrossMatch) {
          currentBlock.redCrossesText = redCrossMatch[1].trim();
        } else if (greenPlusMatch) {
          currentBlock.greenPlusText = greenPlusMatch[1].trim();
        } else if (namesMatch) {
          currentBlock.names = namesMatch[1].split(',').map((n: string) => n.trim()).filter(Boolean);
        }
      }
    }

    if (currentBlock) {
      list.push(currentBlock);
    }
    
    // Sort Newest first
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Toggle card expansion
  const toggleExpand = (id: string) => {
    setExpandedUpdates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Safe helper to parse date local-style
  const parseDateString = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(dateStr);
  };

  // High-precision calendar day difference
  const getDaysBetween = (date1: Date, date2: Date) => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter & Search Logic
  const filteredUpdates = updates.filter(item => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.date.includes(query) ||
      item.names.some(n => n.toLowerCase().includes(query) || `@${n.toLowerCase()}`.includes(query));
      
    if (!matchesSearch) return false;

    if (timeFilter === 'All') {
      return true;
    }

    const itemDate = parseDateString(item.date);
    const today = new Date();

    if (timeFilter === 'Week') {
      const daysDiff = getDaysBetween(itemDate, today);
      return daysDiff >= 0 && daysDiff <= 7;
    }

    if (timeFilter === 'Month') {
      const daysDiff = getDaysBetween(itemDate, today);
      return daysDiff >= 0 && daysDiff <= 30;
    }

    if (timeFilter === 'Year') {
      if (selectedYear === 'All') return true;
      const itemYear = item.date.split('-')[0];
      return itemYear === selectedYear;
    }

    return true;
  });

  // Extract unique years for the filter dropdown
  const uniqueYears = Array.from(new Set(updates.map(item => item.date.split('-')[0]))).sort().reverse();

  // Left column variables
  const recentFiles = [...files]
    .filter(f => f.type === 'file')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const favoriteFiles = [...files]
    .filter(f => f.type === 'file' && f.isFavorite)
    .slice(0, 4);

  const totalFilesCount = files.filter(f => f.type === 'file').length;
  const favoritesCount = files.filter(f => f.type === 'file' && f.isFavorite).length;

  // Render search query matched text highlight
  const highlightSearchText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${cleanQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.trim().toLowerCase() 
            ? <span key={i} className="text-white bg-zinc-800/80 px-1 py-0.5 rounded border border-zinc-700 font-bold font-mono inline-block">{part}</span>
            : part
        )}
      </>
    );
  };

  // Handle formatted description renders
  const renderFormattedDescription = (desc: string, item: UpdateItem) => {
    const parts = desc.split(',').map(p => p.trim());
    return (
      <div className="space-y-1.5 text-xs font-mono tracking-tight leading-relaxed mt-2 pl-1 select-text">
        {parts.map((part, idx) => {
          if (!part) return null;
          let cleanPart = part;
          let isGreenPlus = false;
          let isRedCross = false;
          let isHighlighted = false;

          // Check for manual indicators at start of part
          if (part.startsWith('+') || part.startsWith('➕')) {
            isGreenPlus = true;
            cleanPart = part.replace(/^(\+\s*|➕\s*)/, '');
          } else if (part.startsWith('-') || part.startsWith('❌')) {
            isRedCross = true;
            cleanPart = part.replace(/^(-|❌)\s*/, '');
          }

          const cleanPartLower = cleanPart.trim().toLowerCase();
          const greenLower = item.greenPlusText ? item.greenPlusText.trim().toLowerCase() : '';
          const redLower = item.redCrossesText ? item.redCrossesText.trim().toLowerCase() : '';
          const highlightLower = item.highlightedText ? item.highlightedText.trim().toLowerCase() : '';

          // 1. Exact matching (Highest Priority)
          if (greenLower && cleanPartLower === greenLower) {
            isGreenPlus = true;
          } else if (redLower && cleanPartLower === redLower) {
            isRedCross = true;
          }

          if (highlightLower && cleanPartLower === highlightLower) {
            isHighlighted = true;
          }

          return (
            <div key={idx} className="flex items-start space-x-2 py-0.5">
              {isRedCross ? (
                <X size={10} className="text-rose-500 shrink-0 mt-1 select-none" />
              ) : isGreenPlus ? (
                <Plus size={10} className="text-emerald-500 shrink-0 mt-1 select-none" />
              ) : (
                <span className="text-zinc-650 dark:text-zinc-500 shrink-0 select-none mt-0.5 font-bold">-</span>
              )}
              
              <span 
                className={`flex-1 transition-all duration-200 ${
                  isHighlighted 
                    ? 'text-white font-extrabold select-text'
                    : isRedCross 
                      ? 'text-rose-400/80 line-through decoration-rose-500/40'
                      : isGreenPlus
                        ? 'text-emerald-400 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200'
                }`}
                style={isHighlighted ? {
                  textShadow: '0 0 8px rgba(255, 255, 255, 0.95), 0 0 16px rgba(255, 255, 255, 0.45)'
                } : undefined}
              >
                {searchQuery.trim() ? highlightSearchText(cleanPart, searchQuery) : cleanPart}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleCreateNewScript = () => {
    const scriptName = `script_${Math.floor(Math.random() * 900) + 100}.lua`;
    onCreateNewFile(scriptName, 'file', '-- Welcome to Lua/u workspace\nprint("Hello World from Incognito IDE!")');
    setActiveSection('editor');
  };

  return (
    <div 
      id="dashboard-viewport" 
      className="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-hidden relative select-none"
      style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }}
    >
      {/* Laser Scanning Sweep Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent animate-[pulse_3s_infinite] pointer-events-none z-20" />

      {/* Ambient Radial Glows */}
      <div 
        style={{
          background: `radial-gradient(circle at 10% 10%, ${theme.accent}0d, transparent 40%)`
        }}
        className="absolute inset-0 pointer-events-none" 
      />
      <div 
        style={{
          background: `radial-gradient(circle at 90% 90%, ${theme.accent}05, transparent 35%)`
        }}
        className="absolute inset-0 pointer-events-none" 
      />

      {/* Top Welcome Panel with Executor Header Look */}
      <div 
        className="p-5 border-b shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative backdrop-blur-sm"
        style={{ borderColor: theme.borderColor, backgroundColor: `${theme.headerBg}cc` }}
      >
        <div className="text-left space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 font-extrabold uppercase px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.2)]">
              INCOGNITO v3.5
            </span>
            <span className="text-zinc-600 font-mono text-[10px]">•</span>
            <span className="text-zinc-400 font-mono text-[10px]">LUAU EXECUTOR PIPELINE</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-lg sm:text-xl font-black tracking-tight flex items-center space-x-2 text-white"
          >
            <span>Welcome back, <span className="text-sky-400">{settings.account.username}</span></span>
            <Sparkles size={16} className="text-sky-400 animate-pulse shrink-0" />
          </motion.h1>
          <p className="text-[10px] font-mono tracking-tight text-zinc-500">
            System registers: SECURED. Execution pipeline initialized. Attached thread: #7204.
          </p>
        </div>

        {/* Executor Server Status Badge */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          <div 
            onClick={triggerSimulation}
            className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold font-mono tracking-wider select-none uppercase shadow-lg transition-all duration-300 cursor-pointer ${
              injectionStatus === 'SUCCESS' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                : injectionStatus === 'INJECTING' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse cursor-wait' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <Zap size={11} className={injectionStatus === 'INJECTING' ? "animate-spin" : "animate-bounce"} />
            <span>
              {injectionStatus === 'SUCCESS' 
                ? 'INJECTED (ACTIVE)' 
                : injectionStatus === 'INJECTING' 
                  ? 'INJECTING...' 
                  : 'ATTACH TO LUAU VM'}
            </span>
          </div>

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

      {/* Main Two-Column Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative z-10">
        
        {/* CENTER / MAIN PANEL (Left & Center area) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 min-w-0">
          
          {/* Real-time Hardware Telemetry HUD (10x Better Visuals) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* FPS Counter Telemetry */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="p-4 rounded-xl border flex flex-col justify-between text-left relative overflow-hidden bg-zinc-950/60 backdrop-blur-md border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-zinc-700/80 transition-all duration-300"
              style={{ boxShadow: `0 0 15px rgba(56, 189, 248, 0.01)` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                  DIAGNOSTICS RATE
                </span>
                <Activity size={12} className="text-sky-400 animate-pulse" />
              </div>
              <div className="mt-4 flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  {simulatedFps}
                </span>
                <span className="text-[10px] font-mono font-bold text-sky-400">FPS</span>
              </div>
              {/* Simulated FPS wave sparkline */}
              <div className="h-4 mt-2 flex items-end space-x-0.5 overflow-hidden opacity-50">
                {Array.from({ length: 18 }).map((_, i) => {
                  const h = 15 + Math.sin(i * 0.8) * 8 + (Math.random() * 4);
                  return (
                    <div 
                      key={i} 
                      className="w-1 bg-sky-500/40 rounded-t" 
                      style={{ height: `${h}%` }} 
                    />
                  );
                })}
              </div>
            </motion.div>

            {/* CPU Scheduler Telemetry */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="p-4 rounded-xl border flex flex-col justify-between text-left relative overflow-hidden bg-zinc-950/60 backdrop-blur-md border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-zinc-700/80 transition-all duration-300"
              style={{ boxShadow: `0 0 15px rgba(168, 85, 247, 0.01)` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                  THREAD CORE CPU
                </span>
                <Cpu size={12} className="text-purple-400 animate-pulse" />
              </div>
              <div className="mt-4 flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  {simulatedCpu}%
                </span>
                <span className="text-[10px] font-mono font-bold text-purple-400">LUAU</span>
              </div>
              {/* Core bar graph indicators */}
              <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-sky-400 h-full rounded-full"
                  animate={{ width: `${Math.min(100, simulatedCpu * 80)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </motion.div>

            {/* Luau Memory Telemetry */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="p-4 rounded-xl border flex flex-col justify-between text-left relative overflow-hidden bg-zinc-950/60 backdrop-blur-md border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.4)] group hover:border-zinc-700/80 transition-all duration-300"
              style={{ boxShadow: `0 0 15px rgba(245, 158, 11, 0.01)` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-zinc-500">
                  LUAU HEAP POOL
                </span>
                <Layers size={12} className="text-amber-500 animate-pulse" />
              </div>
              <div className="mt-4 flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  {simulatedMem}
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-500">MB / 256MB</span>
              </div>
              {/* Memory pool meter bar */}
              <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full"
                  animate={{ width: `${(simulatedMem / 256) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </motion.div>
          </div>

          {/* Active Logs Console Feed (Highly authentic Executor look!) */}
          <div className="bg-zinc-950 border border-zinc-800/90 rounded-xl overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/10 to-transparent pointer-events-none" />
            <div className="px-4 py-2 bg-zinc-900/80 border-b border-zinc-800/90 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal size={11} className="text-sky-400" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                  Executor VM Status Log
                </span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-rose-500/40" />
                <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
              </div>
            </div>
            
            <div className="p-4 font-mono text-[10px] leading-relaxed text-left space-y-1 max-h-32 overflow-y-auto select-text scrollbar-thin scrollbar-thumb-zinc-800">
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
              
              <div className="text-sky-400/80 blink font-bold">&gt; _</div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-2 text-zinc-500">
              <Flame size={10} className="text-amber-500 animate-pulse shrink-0" />
              <span>Workspace Management Quick-Actions</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <button
                onClick={handleCreateNewScript}
                className="p-4 rounded-xl border border-zinc-800/80 text-left flex items-start space-x-4 bg-zinc-950/60 backdrop-blur-xs hover:border-zinc-700 hover:bg-zinc-900/10 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer group"
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  <Plus size={16} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold font-mono tracking-tight block text-zinc-200">Append New script</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Creates a fresh Luau code node inside space</span>
                </div>
              </button>

              <button
                onClick={() => setActiveSection('settings')}
                className="p-4 rounded-xl border border-zinc-800/80 text-left flex items-start space-x-4 bg-zinc-950/60 backdrop-blur-xs hover:border-zinc-700 hover:bg-zinc-900/10 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer group"
              >
                <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                  <Settings size={16} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold font-mono tracking-tight block text-zinc-200">Luau configuration</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Define syntax engines, profiles and theme guides</span>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Files & Stars Split Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            
            {/* Recent Files List */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-2 text-zinc-500">
                <FileText size={10} className="text-sky-400 shrink-0" />
                <span>Recently Modified scripts</span>
              </h2>
              <div className="space-y-2">
                {recentFiles.length === 0 ? (
                  <div className="border border-dashed border-zinc-800 p-6 rounded-xl text-center text-xs font-mono text-zinc-600">
                    No scripts cached in memory.
                  </div>
                ) : (
                  recentFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => onOpenFileInEditor(file.id)}
                      className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-900/20 hover:border-zinc-700 transition-all duration-200 cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-sky-500/5 text-sky-400 border border-sky-500/10 group-hover:bg-sky-500/10 transition-colors">
                          <FileText size={12} className="shrink-0" />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="text-xs font-bold font-mono truncate block text-zinc-200 group-hover:text-sky-400 transition-colors">
                            {file.name}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-650 block mt-0.5">
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
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-2 text-zinc-500">
                <Star size={10} className="text-amber-500 shrink-0" />
                <span>Pinned script hub</span>
              </h2>
              <div className="space-y-2">
                {favoriteFiles.length === 0 ? (
                  <div className="border border-dashed border-zinc-800 p-6 rounded-xl text-center text-xs font-mono text-zinc-600">
                    No pinned script slots reserved yet.
                  </div>
                ) : (
                  favoriteFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => onOpenFileInEditor(file.id)}
                      className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-900/20 hover:border-zinc-700 transition-all duration-200 cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-amber-500/5 text-amber-500 border border-amber-500/10 group-hover:bg-amber-500/10 transition-colors">
                          <Star size={12} className="fill-amber-500/10 shrink-0" />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="text-xs font-bold font-mono truncate block text-zinc-200 group-hover:text-amber-400 transition-colors">
                            {file.name}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-650 block mt-0.5">
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

        {/* RIGHT PANEL: LATEST UPDATES SYSTEM (Optimized and Crafted perfectly) */}
        <div 
          className="w-full lg:w-[410px] border-t lg:border-t-0 lg:border-l flex flex-col min-h-0 overflow-hidden backdrop-blur-md relative" 
          style={{ 
            borderColor: theme.borderColor, 
            backgroundColor: `${theme.sidebarBg}d9` 
          }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between shrink-0 bg-zinc-900/50" style={{ borderColor: theme.borderColor }}>
            <div className="flex items-center space-x-2">
              <Layers size={13} className="text-sky-400" />
              <h2 className="text-xs font-extrabold font-mono uppercase tracking-wider text-white">
                Luau Pipeline Updates
              </h2>
            </div>
            
            <button
              onClick={fetchUpdates}
              disabled={loadingUpdates}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition text-zinc-400 disabled:opacity-50 cursor-pointer hover:text-white"
              title="Refresh update feed"
            >
              <RefreshCw size={11} className={loadingUpdates ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-3.5 border-b space-y-3 shrink-0 bg-zinc-950/60" style={{ borderColor: theme.borderColor }}>
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search update feed logs..."
                className="w-full text-xs font-mono py-2 pl-9 pr-4 rounded-xl border bg-zinc-950 text-zinc-200 border-zinc-800 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition"
              />
            </div>

            {/* Filter Time Ranges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[9px] font-mono uppercase text-zinc-500 font-bold">
                  <Filter size={10} className="text-zinc-500" />
                  <span>Time filter:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(['All', 'Week', 'Month', 'Year'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => {
                        setTimeFilter(f);
                        if (f !== 'Year') setSelectedYear('All');
                      }}
                      className={`px-2.5 py-0.5 rounded-md font-mono text-[9px] font-bold transition cursor-pointer ${
                        timeFilter === f 
                          ? 'bg-zinc-100 text-zinc-950 shadow-md font-extrabold' 
                          : 'bg-zinc-900/60 text-zinc-500 border border-zinc-800/40 hover:text-zinc-300 hover:border-zinc-800'
                      }`}
                    >
                      {f === 'All' ? 'All' : f === 'Week' ? 'Weekly' : f === 'Month' ? 'Monthly' : 'By Year'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Selector (Only visible if By Year is chosen) */}
              {timeFilter === 'Year' && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                  <span className="text-[8px] font-mono uppercase text-zinc-500">Select specific year:</span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setSelectedYear('All')}
                      className={`px-2 py-0.5 rounded-md font-mono text-[8px] font-bold transition cursor-pointer ${
                        selectedYear === 'All' 
                          ? 'bg-zinc-200 text-zinc-900' 
                          : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      All
                    </button>
                    {uniqueYears.map(year => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-2 py-0.5 rounded-md font-mono text-[8px] font-bold transition cursor-pointer ${
                          selectedYear === year 
                            ? 'bg-zinc-200 text-zinc-900' 
                            : 'bg-zinc-900/50 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Updates List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
            {updatesError && (
              <div className="p-3.5 rounded-xl border border-amber-900/40 bg-amber-950/10 text-amber-500 text-[10px] font-mono text-left flex items-start space-x-2 animate-pulse">
                <Info size={13} className="shrink-0 mt-0.5" />
                <span>{updatesError}</span>
              </div>
            )}

            {filteredUpdates.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-650 select-none border border-dashed border-zinc-800 rounded-xl">
                No matching pipeline updates loaded.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredUpdates.map((item, idx) => {
                  const isExpanded = !!expandedUpdates[item.id];
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.16, delay: Math.min(idx * 0.04, 0.24) }}
                      className="rounded-xl border transition-all duration-300 select-none overflow-hidden hover:border-zinc-700"
                      style={{ 
                        backgroundColor: theme.cardBg, 
                        borderColor: isExpanded ? `${theme.accent}40` : theme.borderColor,
                        boxShadow: isExpanded ? `0 0 12px ${theme.accent}0a` : 'none'
                      }}
                    >
                      {/* Card Header (Always Visible) */}
                      <div 
                        onClick={() => toggleExpand(item.id)}
                        className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-zinc-900/20 transition duration-150"
                      >
                        <div className="space-y-1 text-left min-w-0">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md flex items-center space-x-1 shrink-0 bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_8px_rgba(56,189,248,0.05)]"
                            >
                              <Calendar size={9} />
                              <span>{item.date}</span>
                            </span>
                          </div>
                          
                          <h3 className="text-xs font-bold font-mono tracking-tight text-zinc-100 truncate pr-2 group-hover:text-sky-400 transition-colors">
                            {item.title || "UNTITLED UPDATE"}
                          </h3>
                        </div>

                        <button 
                          className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 transition shrink-0"
                          title={isExpanded ? "Collapse Details" : "Expand Details"}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>

                      {/* Card Body (Expandable with animation) */}
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t px-3.5 pb-4 pt-3 text-left"
                          style={{ borderColor: theme.borderColor, backgroundColor: "rgba(0,0,0,0.18)" }}
                        >
                          {/* Parse and Highlight Description */}
                          {renderFormattedDescription(item.description, item)}

                          {/* Credits Badges */}
                          {item.names && item.names.length > 0 && (
                            <div className="mt-3.5 pt-2.5 border-t flex flex-wrap items-center gap-1.5" style={{ borderColor: theme.borderColor }}>
                              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600 font-bold flex items-center space-x-1 mr-1">
                                <UserCheck size={10} />
                                <span>Thanks to:</span>
                              </span>
                              {item.names.map((name: string, nIdx: number) => (
                                <span 
                                  key={nIdx}
                                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                                >
                                  @{name}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
