import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Flame, ShieldAlert, BadgeCheck, FileText, Plus, Radio,
  FolderOpen, Compass, Search, Calendar, ChevronDown, ChevronUp, User, 
  Sparkles, RefreshCw, Star, ArrowRight, Play, Heart, AlertCircle, CheckCircle
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

export default function Dashboard({
  files,
  onOpenFileInEditor,
  onCreateNewFile,
  onClearTerminal,
  theme,
  settings,
  setActiveSection,
}: DashboardProps) {
  // Update system states
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSearch, setUpdateSearch] = useState('');
  const [expandedUpdates, setExpandedUpdates] = useState<Record<string, boolean>>({});
  const [dateFilter, setDateFilter] = useState<'all' | '2025' | '2026'>('all');

  // Load / Parse github tracker files
  const fetchUpdates = async () => {
    setLoadingUpdates(true);
    setUpdateError(null);
    try {
      const response = await fetch('https://raw.githubusercontent.com/incognito-updates/tracker/refs/heads/main/UPDS.txt');
      if (!response.ok) {
        throw new Error(`Tracker server HTTP error status: ${response.status}`);
      }
      const rawText = await response.text();
      const parsed = parseTrackerText(rawText);
      setUpdates(parsed);
    } catch (err: any) {
      console.warn('CORS or Network issue reading raw github updates, activating high-fidelity local parse-mirror...', err);
      // Let's populate fallback realistic mockup formatted string in exact tracker notation,
      // so if the offline/iframe sandbox blocks fetching, the UI has a spectacular interactive mock parsed system!
      const fallbackRawData = `
[2025, 6, 23]
TITLE : TEST 1 FIRST
DESCRIPTION: TESTING1, TESTING2, TESTING3, TESTING4
HIGHLIGHTED_TEXT_IN_DESCRIPTION:TESTING2
RED_CROSSES_TEXT_IN_DESCRIPTION:TESTING3
GREEN_PLUS_TEXT_IN_DESCRIPTION:TESTING4
NAMES:TEST, TEST2, TEST3
[2025, 6, 23]

[2025, 2, 13]
TITLE : TEST 2 SECOND
DESCRIPTION: TESTING1, TESTING2, TESTING3, TESTING4
HIGHLIGHTED_TEXT_IN_DESCRIPTION:TESTING2
RED_CROSSES_TEXT_IN_DESCRIPTION:TESTING3
GREEN_PLUS_TEXT_IN_DESCRIPTION:TESTING4
NAMES:TEST, TEST2, TEST3
[2025, 6, 23]

[2026, 6, 20]
TITLE : GT3 CARBON SUSPENSION UPGRADE
DESCRIPTION: Introducing dynamic high-frequency Double-Wishbone active chassis tracking, optimizing physics ticks, dropping legacy spring offsets, and establishing high-frequency Luau speed calculations.
HIGHLIGHTED_TEXT_IN_DESCRIPTION:optimizing physics ticks
RED_CROSSES_TEXT_IN_DESCRIPTION:dropping legacy spring offsets
GREEN_PLUS_TEXT_IN_DESCRIPTION:establishing high-frequency Luau speed calculations
NAMES:FerryP, RobloxPro, IncogTeam
[2026, 6, 20]
      `;
      const parsedFallback = parseTrackerText(fallbackRawData);
      setUpdates(parsedFallback);
      setUpdateError('Simulated Live Mirror Active (Offline sandboxed preview mode)');
    } finally {
      setLoadingUpdates(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  // Extremely robust Tracker parser
  const parseTrackerText = (text: string): UpdateItem[] => {
    const parsedUpdates: UpdateItem[] = [];
    // Split by brackets block start
    // A block starts with something like [2025, 6, 23] or [2025, 2, 13]
    const blockRegex = /\[(\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\]([\s\S]*?)\[\1,\s*\2,\s*\3\]/g;
    
    let match;
    let count = 0;
    while ((match = blockRegex.exec(text)) !== null) {
      count++;
      const year = match[1];
      const month = String(match[2]).padStart(2, '0');
      const day = String(match[3]).padStart(2, '0');
      const content = match[4];
      
      const dateStr = `${year}-${month}-${day}`;
      
      // Parse fields inside block
      const titleMatch = content.match(/TITLE\s*:\s*(.*)/i);
      const descMatch = content.match(/DESCRIPTION\s*:\s*(.*)/i);
      const highlightMatch = content.match(/HIGHLIGHTED_TEXT_IN_DESCRIPTION\s*:\s*(.*)/i);
      const redCrossMatch = content.match(/RED_CROSSES_TEXT_IN_DESCRIPTION\s*:\s*(.*)/i);
      const greenPlusMatch = content.match(/GREEN_PLUS_TEXT_IN_DESCRIPTION\s*:\s*(.*)/i);
      const namesMatch = content.match(/NAMES\s*:\s*(.*)/i);
      
      const title = titleMatch ? titleMatch[1].trim() : `Update Block #${count}`;
      const description = descMatch ? descMatch[1].trim() : '';
      const highlightedText = highlightMatch ? highlightMatch[1].trim() : undefined;
      const redCrossesText = redCrossMatch ? redCrossMatch[1].trim() : undefined;
      const greenPlusText = greenPlusMatch ? greenPlusMatch[1].trim() : undefined;
      
      let names: string[] = [];
      if (namesMatch) {
        names = namesMatch[1].split(',').map(n => n.trim()).filter(Boolean);
      }
      
      parsedUpdates.push({
        id: `upd-${count}-${dateStr}`,
        date: dateStr,
        title,
        description,
        highlightedText,
        redCrossesText,
        greenPlusText,
        names
      });
    }

    // fallback line-by-line if regex failed to capture properly
    if (parsedUpdates.length === 0) {
      const lines = text.split('\n');
      let currentUpd: Partial<UpdateItem> = {};
      let parseStage = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const dateStartMatch = line.match(/^\[(\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\]/);

        if (dateStartMatch) {
          if (!parseStage) {
            parseStage = true;
            const year = dateStartMatch[1];
            const month = String(dateStartMatch[2]).padStart(2, '0');
            const day = String(dateStartMatch[3]).padStart(2, '0');
            currentUpd = {
              id: `upd-lbl-${i}`,
              date: `${year}-${month}-${day}`,
              names: []
            };
          } else {
            // Ending date tag
            if (currentUpd.title) {
              parsedUpdates.push(currentUpd as UpdateItem);
            }
            parseStage = false;
          }
          continue;
        }

        if (parseStage) {
          if (line.toUpperCase().startsWith('TITLE :')) {
            currentUpd.title = line.substring(7).trim();
          } else if (line.toUpperCase().startsWith('DESCRIPTION:')) {
            currentUpd.description = line.substring(12).trim();
          } else if (line.toUpperCase().startsWith('HIGHLIGHTED_TEXT_IN_DESCRIPTION:')) {
            currentUpd.highlightedText = line.substring(32).trim();
          } else if (line.toUpperCase().startsWith('RED_CROSSES_TEXT_IN_DESCRIPTION:')) {
            currentUpd.redCrossesText = line.substring(32).trim();
          } else if (line.toUpperCase().startsWith('GREEN_PLUS_TEXT_IN_DESCRIPTION:')) {
            currentUpd.greenPlusText = line.substring(31).trim();
          } else if (line.toUpperCase().startsWith('NAMES:')) {
            currentUpd.names = line.substring(6).split(',').map(n => n.trim()).filter(Boolean);
          }
        }
      }
    }
    
    // Sort Newest First
    return parsedUpdates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const toggleExpand = (id: string) => {
    setExpandedUpdates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter and Search updates
  const filteredUpdates = updates.filter(upd => {
    const matchesSearch = 
      upd.title.toLowerCase().includes(updateSearch.toLowerCase()) ||
      upd.description.toLowerCase().includes(updateSearch.toLowerCase());
    
    if (dateFilter === 'all') return matchesSearch;
    return matchesSearch && upd.date.startsWith(dateFilter);
  });

  // Recent files (limit 4 files)
  const recentFiles = [...files]
    .filter(f => f.type === 'file')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  // Favorite files count
  const favoritesCount = files.filter(f => f.type === 'file' && f.isFavorite).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 font-sans relative">
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#ee3c22]/5 to-transparent pointer-events-none" />

      {/* Header and Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 relative z-10">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center space-x-2"
          >
            <Sparkles className="text-[#ee3c22] w-6 h-6 shrink-0 animate-pulse" />
            <span>Welcome, {settings.account.username}</span>
          </motion.h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Chassis calibrator standard engine active. Active system uptime: 100%
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-zinc-950/40 border border-zinc-800 p-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mx-2" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mr-2">
            Workspace Server Localhost
          </span>
        </div>
      </div>

      {/* Grid: Left and Right panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Main welcome cards, quick actions) - cols-7 */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Bento Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Total Files</span>
                <FolderOpen size={16} className="text-zinc-500" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold font-mono tracking-tight">{files.length}</span>
                <span className="text-[9px] text-zinc-500 font-mono block mt-1">Virtual nodes registered</span>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Favorites</span>
                <Star size={16} className="text-yellow-500 fill-yellow-500/20" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold font-mono tracking-tight">{favoritesCount}</span>
                <span className="text-[9px] text-zinc-500 font-mono block mt-1">Pinned script managers</span>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-zinc-700 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Chassis Caliber</span>
                <Flame size={16} className="text-[#ee3c22] animate-bounce" />
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold font-mono tracking-tight">9,000</span>
                <span className="text-[9px] text-zinc-500 font-mono block mt-1">RPM virtual standard limits</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="border border-zinc-800 bg-zinc-950/60 rounded-xl p-5 relative overflow-hidden backdrop-blur-md">
            <div 
              style={{ background: `linear-gradient(to right, ${theme.accent}20, transparent)` }}
              className="absolute top-0 left-0 w-1 h-full"
            />
            
            <h3 className="text-xs font-bold font-mono text-zinc-300 tracking-wider uppercase mb-3.5 flex items-center">
              <Compass size={14} className="text-[#ee3c22] mr-2" />
              Quick Workspace Actions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  const promptName = prompt('Enter your Luau file name (e.g. TestEngine.luau):');
                  if (promptName) {
                    onCreateNewFile(promptName, 'file', '-- New custom script\nprint("Standard calibration initialized.")');
                  }
                }}
                className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white font-mono flex items-center">
                    <Plus size={14} className="mr-1 text-[#ee3c22]" /> Create Custom Suffix Script
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">Create new Luau file nodes</span>
                </div>
                <ArrowRight size={14} className="text-zinc-600 group-hover:translate-x-1 transition" />
              </button>

              <button 
                onClick={() => setActiveSection('editor')}
                className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white font-mono flex items-center">
                    <Play size={14} className="mr-1 text-[#ee3c22]" /> Open Custom Workspace IDE
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">Boots full vscode-style interface</span>
                </div>
                <ArrowRight size={14} className="text-zinc-600 group-hover:translate-x-1 transition" />
              </button>

              <button 
                onClick={onClearTerminal}
                className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white font-mono flex items-center">
                    <Terminal size={14} className="mr-1 text-[#ee3c22]" /> Purge Interactive Console
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">Clear terminal logs buffer history</span>
                </div>
                <ArrowRight size={14} className="text-zinc-600 group-hover:translate-x-1 transition" />
              </button>

              <button 
                onClick={() => setActiveSection('themes')}
                className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left transition"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white font-mono flex items-center">
                    <Sparkles size={14} className="mr-1 text-[#ee3c22]" /> Tweak Active Decals CSS
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">Adjust backgrounds, neon accents</span>
                </div>
                <ArrowRight size={14} className="text-zinc-600 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* Recent Files Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-400 flex items-center">
                <FileText size={14} className="text-[#ee3c22] mr-2" />
                Active Work-In-Progress Nodes
              </h3>
              <button 
                onClick={() => setActiveSection('editor')} 
                className="text-[10px] text-zinc-500 hover:text-[#ee3c22] font-mono flex items-center"
              >
                View all files <ArrowRight size={12} className="ml-1" />
              </button>
            </div>

            {recentFiles.length === 0 ? (
              <div className="border border-dashed border-zinc-800 bg-zinc-950/40 rounded-xl p-8 text-center text-zinc-500 font-mono text-xs">
                No active file nodes detected. Create one from the sidebar folder directory.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentFiles.map(file => (
                  <div 
                    key={file.id}
                    onClick={() => onOpenFileInEditor(file.id)}
                    className="p-3 bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer text-left transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-100 font-mono truncate max-w-[80%]">
                          {file.name}
                        </span>
                        {file.isFavorite && (
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono block">
                        Size: {file.size} bytes
                      </span>
                    </div>

                    <div className="mt-4 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                      <span>Edited: {new Date(file.updatedAt).toLocaleTimeString()}</span>
                      <span className="text-[#ee3c22] opacity-0 group-hover:opacity-100 transition">{"Edit ->"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: LATEST UPDATES tracker feed container (cols-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-zinc-800 bg-[#16181d] rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#ee3c22] animate-pulse" />
                <h2 className="text-xs font-bold font-mono tracking-widest uppercase text-zinc-100">
                  GT3 Updates & Chassis Logs
                </h2>
              </div>
              <button 
                onClick={fetchUpdates}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                title="Refresh Update Indexes"
              >
                <RefreshCw size={12} className={loadingUpdates ? "animate-spin text-[#ee3c22]" : ""} />
              </button>
            </div>

            {/* Filter controls */}
            <div className="p-3 border-b border-zinc-800 bg-[#121317] flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:items-center sm:space-x-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Query updates..."
                  value={updateSearch}
                  onChange={(e) => setUpdateSearch(e.target.value)}
                  className="w-full bg-[#1b1c22] border border-zinc-800 rounded-md py-1 px-8 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>
              
              <div className="flex space-x-1 shrink-0">
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-2 py-1 rounded text-[9px] font-mono leading-none border transition uppercase ${
                    dateFilter === 'all' 
                      ? 'bg-[#ee3c22]/10 border-[#ee3c22] text-[#ee3c22]' 
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDateFilter('2026')}
                  className={`px-2 py-1 rounded text-[9px] font-mono leading-none border transition uppercase ${
                    dateFilter === '2026' 
                      ? 'bg-[#ee3c22]/10 border-[#ee3c22] text-[#ee3c22]' 
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  2026
                </button>
                <button
                  onClick={() => setDateFilter('2025')}
                  className={`px-2 py-1 rounded text-[9px] font-mono leading-none border transition uppercase ${
                    dateFilter === '2025' 
                      ? 'bg-[#ee3c22]/10 border-[#ee3c22] text-[#ee3c22]' 
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  2025
                </button>
              </div>
            </div>

            {/* Offline notification if exists */}
            {updateError && (
              <div className="bg-[#ee3c22]/10 border-b border-zinc-800 px-3 py-1.5 flex items-center space-x-2">
                <Radio size={12} className="text-[#ee3c22] animate-pulse" />
                <span className="text-[9px] font-mono text-[#ee3c22] font-semibold">{updateError}</span>
              </div>
            )}

            {/* Updates list */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-800/60 bg-[#101215]">
              {loadingUpdates ? (
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 font-mono">
                  <RefreshCw className="animate-spin text-[#ee3c22] w-5 h-5" />
                  <span className="text-[10px] text-zinc-500 tracking-wider">INDEXING TELEMETRY TRACKER...</span>
                </div>
              ) : filteredUpdates.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-xs font-mono">
                  No active logs match query.
                </div>
              ) : (
                filteredUpdates.map((upd) => {
                  const isExpanded = !!expandedUpdates[upd.id];
                  return (
                    <div key={upd.id} className="p-4 hover:bg-[#15171d]/60 transition">
                      
                      {/* Header row click */}
                      <div 
                        onClick={() => toggleExpand(upd.id)}
                        className="flex items-start justify-between cursor-pointer group"
                      >
                        <div className="space-y-1.5 flex-1 pr-2">
                          <div className="flex items-center space-x-2 text-[9px] font-mono text-zinc-500">
                            <Calendar size={10} className="text-zinc-600" />
                            <span>{upd.date}</span>
                          </div>
                          <h4 className="text-xs font-bold font-mono text-zinc-200 group-hover:text-[#ee3c22] transition tracking-tight">
                            {upd.title}
                          </h4>
                        </div>
                        <div className="text-zinc-600 group-hover:text-zinc-400 mt-1 shrink-0">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>

                      {/* Expanded Section */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-3 pt-3 border-t border-zinc-800/80">
                              
                              {/* Simple render of full text, with format conversions as requested */}
                              <div className="text-[10px] font-mono leading-relaxed text-zinc-400 space-y-2">
                                {/* Regular Description block text */}
                                <p>{upd.description}</p>
                                
                                {/* Formatted items */}
                                {upd.highlightedText && (
                                  <div className="mt-2.5 p-2 bg-[#ee3c22]/10 border border-[#ee3c22]/30 rounded text-[#ee3c22] font-semibold flex items-center space-x-1.5 shadow-[0_0_10px_rgba(238,60,34,0.1)]">
                                    <Sparkles size={11} className="shrink-0 animate-pulse text-[#ee3c22]" />
                                    <span>{upd.highlightedText}</span>
                                  </div>
                                )}

                                {upd.redCrossesText && (
                                  <div className="flex items-center space-x-1.5 text-rose-500/90 font-medium">
                                    <AlertCircle size={12} className="shrink-0 text-rose-500" />
                                    <span>{upd.redCrossesText}</span>
                                  </div>
                                )}

                                {upd.greenPlusText && (
                                  <div className="flex items-center space-x-1.5 text-emerald-500/90 font-medium">
                                    <CheckCircle size={12} className="shrink-0 text-emerald-400" />
                                    <span>{upd.greenPlusText}</span>
                                  </div>
                                )}
                              </div>

                              {/* Names Credits Badging */}
                              {upd.names.length > 0 && (
                                <div className="mt-3 pt-2.5 border-t border-zinc-800/40">
                                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                                    Thanks to developers:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {upd.names.map((n, i) => (
                                      <span 
                                        key={i}
                                        className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold"
                                      >
                                        @{n}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })
              )}
            </div>

            {/* Footer details */}
            <div className="p-2 bg-zinc-900/40 border-t border-zinc-800/80 text-center text-[8px] font-mono text-zinc-600 tracking-wider uppercase">
              Tracking Node Feed v3.0 // Ready State
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
