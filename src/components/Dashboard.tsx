import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, FileText, Plus, Star, ArrowRight, Sparkles, Layers,
  Search, Filter, ChevronDown, ChevronUp, RefreshCw, Calendar,
  Heart, Terminal, Settings, Info, UserCheck, Flame, X
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
      const response = await fetch('https://raw.githubusercontent.com/incognito-updates/tracker/refs/heads/main/UPDS.txt');
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
        if (!currentBlock) {
          const year = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]);
          const day = parseInt(dateMatch[3]);
          currentBlock = {
            id: `upd-${i}-${year}-${month}-${day}`,
            date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            title: '',
            description: '',
            highlightedText: '',
            redCrossesText: '',
            greenPlusText: '',
            names: []
          };
        } else {
          // Closing tag - complete block
          list.push(currentBlock);
          currentBlock = null;
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

  // Filter & Search Logic
  const filteredUpdates = updates.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.names.some(n => n.toLowerCase().includes(searchQuery.toLowerCase()));
      
    if (!matchesSearch) return false;

    if (timeFilter === 'All') {
      return true;
    }

    const itemDate = new Date(item.date);
    const latestUpdateDate = updates.length > 0 
      ? new Date(Math.max(...updates.map(u => new Date(u.date).getTime()))) 
      : new Date();

    if (timeFilter === 'Week') {
      const diffTime = latestUpdateDate.getTime() - itemDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }

    if (timeFilter === 'Month') {
      const diffTime = latestUpdateDate.getTime() - itemDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays >= 0;
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

          // Only apply auto-detection if it wasn't already manually specified by start characters (+ / -)
          if (!isGreenPlus && !isRedCross) {
            if (greenLower && cleanPartLower.includes(greenLower)) {
              isGreenPlus = true;
            } else if (redLower && cleanPartLower.includes(redLower)) {
              isRedCross = true;
            }
          }

          if (highlightLower && cleanPartLower.includes(highlightLower)) {
            isHighlighted = true;
          }

          return (
            <div key={idx} className="flex items-start space-x-2 py-0.5">
              {isRedCross ? (
                <X size={10} className="text-rose-500 shrink-0 mt-1 select-none" />
              ) : isGreenPlus ? (
                <Plus size={10} className="text-emerald-500 shrink-0 mt-1 select-none" />
              ) : (
                <span className="text-zinc-600 dark:text-zinc-500 shrink-0 select-none mt-0.5">•</span>
              )}
              
              <span className={`flex-1 transition-all duration-200 ${
                isHighlighted 
                  ? 'text-amber-400 font-black drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20' 
                  : isRedCross 
                    ? 'text-rose-400/80 line-through decoration-rose-500/40'
                    : isGreenPlus
                      ? 'text-emerald-400 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
              }`}>
                {cleanPart}
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
    <div id="dashboard-viewport" className="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-hidden relative">
      {/* Background elegant gradient glow overlays */}
      <div 
        style={{
          background: `radial-gradient(circle at 4% 5%, ${theme.accent}07, transparent 35%)`
        }}
        className="absolute inset-0 pointer-events-none" 
      />
      <div 
        style={{
          background: `radial-gradient(circle at 95% 95%, ${theme.accent}04, transparent 30%)`
        }}
        className="absolute inset-0 pointer-events-none" 
      />

      {/* Header Greeting Banner */}
      <div className="p-6 border-b shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10" style={{ borderColor: theme.borderColor, backgroundColor: theme.headerBg }}>
        <div className="text-left">
          <motion.h1 
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl font-black tracking-tight flex items-center space-x-2.5"
            style={{ color: theme.textMain }}
          >
            <span>Welcome, {settings.account.username}</span>
          </motion.h1>
          <p className="text-xs mt-1 font-mono tracking-tight font-medium" style={{ color: theme.textMuted }}>
            Lead workspace architecture connected and fully loaded. Built with Lua/u support.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <div 
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold font-mono tracking-wider select-none uppercase shadow-xs"
            style={{ 
              backgroundColor: `${theme.accent}0a`, 
              borderColor: `${theme.accent}20`,
              color: theme.accent 
            }}
          >
            <span>Inco 3 Status :</span>
            <span 
              className="w-2 h-2 rounded-full inline-block animate-pulse shrink-0" 
              style={{ 
                backgroundColor: statusColorText === 'red' ? '#ef4444' : statusColorText === 'yellow' ? '#f59e0b' : '#10b981', 
                boxShadow: `0 0 8px ${statusColorText === 'red' ? '#ef4444' : statusColorText === 'yellow' ? '#f59e0b' : '#10b981'}`,
                animationDuration: '3s'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Main Two-Column Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* CENTER / MAIN PANEL (Left & Center area) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="p-4.5 rounded-2xl border flex flex-col justify-between text-left relative overflow-hidden group hover:border-zinc-800 transition-all duration-300"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                  Workspace Files
                </span>
                <FileText size={12} className="text-zinc-500" />
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-2xl font-black tracking-tight" style={{ color: theme.textMain }}>
                  {totalFilesCount}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase" style={{ color: theme.textMuted }}>Modules</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4.5 rounded-2xl border flex flex-col justify-between text-left relative overflow-hidden group hover:border-zinc-800 transition-all duration-300"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-amber-500">
                  Starred Pins
                </span>
                <Star size={12} className="text-amber-500 fill-amber-500/20" />
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-2xl font-black tracking-tight text-amber-500">
                  {favoritesCount}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase" style={{ color: theme.textMuted }}>Favorites</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-4.5 rounded-2xl border flex flex-col justify-between text-left relative overflow-hidden group hover:border-zinc-800 transition-all duration-300"
              style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase" style={{ color: theme.textMuted }}>
                  Core Syntax Engine
                </span>
                <Code size={12} style={{ color: theme.accent }} />
              </div>
              <div className="mt-3">
                <div className="text-xs font-mono font-bold truncate uppercase" style={{ color: theme.textMain }}>
                  {settings.syntax.engineId === 'exploit-luau' ? 'Custom Luau' : 'Normal Luau'}
                </div>
                <span className="text-[9px] font-mono" style={{ color: theme.textMuted }}>Lua/u syntax active</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-1.5" style={{ color: theme.textMuted }}>
              <Flame size={10} className="text-amber-500 animate-pulse" />
              <span>Quick Actions</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <button
                onClick={handleCreateNewScript}
                className="p-4 rounded-xl border text-left flex items-start space-x-3.5 transition hover:scale-[1.01] duration-200 cursor-pointer"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Plus size={16} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold font-mono tracking-tight block text-zinc-100">Create New Script</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Append a standard workspace script node</span>
                </div>
              </button>

              <button
                onClick={() => setActiveSection('settings')}
                className="p-4 rounded-xl border text-left flex items-start space-x-3.5 transition hover:scale-[1.01] duration-200 cursor-pointer"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Settings size={16} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold font-mono tracking-tight block text-zinc-100">Lua/u Configuration</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Configure syntax profiles, theme accents & fonts</span>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Files Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Recent Files List */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-1.5" style={{ color: theme.textMuted }}>
                <FileText size={10} style={{ color: theme.accent }} />
                <span>Recent Scripts</span>
              </h2>
              <div className="space-y-2.5">
                {recentFiles.length === 0 ? (
                  <div className="border border-dashed p-6 rounded-xl text-center text-xs font-mono text-zinc-600">
                    No scripts in memory.
                  </div>
                ) : (
                  recentFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => onOpenFileInEditor(file.id)}
                      className="p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] cursor-pointer flex items-center justify-between"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <FileText size={14} style={{ color: theme.accent }} className="shrink-0" />
                        <div className="text-left min-w-0">
                          <span className="text-xs font-bold font-mono truncate block text-zinc-200">
                            {file.name}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-550 block">
                            Size: {file.size} chars
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={12} className="text-zinc-600" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Favorite Files List */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-left flex items-center space-x-1.5" style={{ color: theme.textMuted }}>
                <Star size={10} className="text-amber-500" />
                <span>Bookmarked Pins</span>
              </h2>
              <div className="space-y-2.5">
                {favoriteFiles.length === 0 ? (
                  <div className="border border-dashed p-6 rounded-xl text-center text-xs font-mono text-zinc-600">
                    No starred scripts yet.
                  </div>
                ) : (
                  favoriteFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => onOpenFileInEditor(file.id)}
                      className="p-3 rounded-xl border transition-all duration-200 hover:scale-[1.01] cursor-pointer flex items-center justify-between"
                      style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Star size={13} className="text-amber-500 fill-amber-500/20 shrink-0" />
                        <div className="text-left min-w-0">
                          <span className="text-xs font-bold font-mono truncate block text-zinc-200">
                            {file.name}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-550 block">
                            Pin active
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={12} className="text-zinc-600" />
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT PANEL: LATEST UPDATES SYSTEM */}
        <div 
          className="w-full lg:w-[410px] border-t lg:border-t-0 lg:border-l flex flex-col min-h-0 overflow-hidden" 
          style={{ 
            borderColor: theme.borderColor, 
            backgroundColor: theme.sidebarBg 
          }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: theme.borderColor }}>
            <div className="flex items-center space-x-2">
              <Layers size={14} style={{ color: theme.accent }} />
              <h2 className="text-xs font-extrabold font-mono uppercase tracking-wider text-zinc-200">
                LATEST UPDATES
              </h2>
            </div>
            
            <button
              onClick={fetchUpdates}
              disabled={loadingUpdates}
              className="p-1.5 rounded-lg border hover:bg-zinc-900 transition text-zinc-400 disabled:opacity-50 cursor-pointer"
              style={{ borderColor: theme.borderColor }}
              title="Refresh update feed"
            >
              <RefreshCw size={12} className={loadingUpdates ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-3 border-b space-y-2.5 shrink-0 bg-zinc-950/40" style={{ borderColor: theme.borderColor }}>
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search updates..."
                className="w-full text-xs font-mono py-2 pl-9 pr-4 rounded-xl border bg-zinc-950 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
                style={{ borderColor: theme.borderColor }}
              />
            </div>

            {/* Filter Time Ranges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[9px] font-mono uppercase text-zinc-500">
                  <Filter size={10} />
                  <span>Time Filter:</span>
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
                          ? 'bg-zinc-100 text-zinc-900' 
                          : 'bg-zinc-900/40 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {f === 'All' ? 'All' : f === 'Week' ? 'This Week' : f === 'Month' ? 'This Month' : 'By Year'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Selector (Only visible if By Year is chosen) */}
              {timeFilter === 'Year' && (
                <div className="flex items-center justify-between pt-1 border-t border-zinc-900/40">
                  <span className="text-[8px] font-mono uppercase text-zinc-650">Select Specific Year:</span>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {updatesError && (
              <div className="p-3 rounded-xl border border-amber-900/40 bg-amber-950/10 text-amber-500 text-[10px] font-mono text-left flex items-start space-x-2 animate-pulse">
                <Info size={13} className="shrink-0 mt-0.5" />
                <span>{updatesError}</span>
              </div>
            )}

            {filteredUpdates.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-zinc-600 select-none border border-dashed rounded-xl">
                No matching update records located.
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
                      className="rounded-xl border transition-all duration-300 select-none overflow-hidden"
                      style={{ 
                        backgroundColor: theme.cardBg, 
                        borderColor: isExpanded ? `${theme.accent}40` : theme.borderColor,
                        boxShadow: isExpanded ? `0 0 12px ${theme.accent}0a` : 'none'
                      }}
                    >
                      {/* Card Header (Always Visible) */}
                      <div 
                        onClick={() => toggleExpand(item.id)}
                        className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-zinc-900/25 transition duration-150"
                      >
                        <div className="space-y-1 text-left min-w-0">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md flex items-center space-x-1 shrink-0" 
                              style={{ 
                                backgroundColor: `${theme.accent}14`, 
                                color: theme.accent 
                              }}
                            >
                              <Calendar size={9} />
                              <span>{item.date}</span>
                            </span>
                          </div>
                          
                          <h3 className="text-xs font-bold font-mono tracking-tight text-zinc-100 truncate pr-2">
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
                          style={{ borderColor: theme.borderColor, backgroundColor: "rgba(0,0,0,0.15)" }}
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
                                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
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
