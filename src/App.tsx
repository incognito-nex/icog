import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, ShieldAlert, BadgeCheck, FileText, Plus, Radio,
  FolderOpen, Compass, Search, Calendar, ChevronDown, ChevronUp, User, 
  Sparkles, RefreshCw, Star, ArrowRight, Play, Heart, AlertCircle, CheckCircle,
  Home, Code, Palette, Sliders, Info, HelpCircle
} from 'lucide-react';

import { FileNode, TabItem, TerminalLine, AppTheme, UserSettings, CustomSyntaxProfile } from './types';
import { defaultFiles } from './data/defaultFiles';
import { defaultThemes } from './data/defaultThemes';
import { defaultSyntaxes } from './data/defaultSyntaxes';

import LoadingScreen from './components/LoadingScreen';
import CommandPalette from './components/CommandPalette';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FileExplorer from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import TerminalPanel from './components/TerminalPanel';
import ScriptsView from './components/ScriptsView';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  
  // Name onboarding
  const [userOnboarded, setUserOnboarded] = useState(() => {
    return !!localStorage.getItem('user_onboarded_name');
  });
  const [onboardValue, setOnboardValue] = useState('');
  
  // Navigation
  const [activeSection, setActiveSection] = useState<string>('home');

  // Command Palette
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // States with Local Storage caching
  const [files, setFiles] = useState<FileNode[]>(() => {
    const saved = localStorage.getItem('incognito_files');
    return saved ? JSON.parse(saved) : defaultFiles;
  });

  const [tabs, setTabs] = useState<TabItem[]>(() => {
    const saved = localStorage.getItem('incognito_tabs');
    return saved ? JSON.parse(saved) : [
      { fileId: 'chassis-physics', isPinned: true }
    ];
  });

  const [activeFileId, setActiveFileId] = useState<string | null>(() => {
    const saved = localStorage.getItem('incognito_active_file');
    return saved ? saved : 'chassis-physics';
  });

  const [themes, setThemes] = useState<AppTheme[]>(defaultThemes);
  const [syntaxes, setSyntaxes] = useState<CustomSyntaxProfile[]>(() => {
    const saved = localStorage.getItem('incognito_syntaxes');
    return saved ? JSON.parse(saved) : defaultSyntaxes;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const onboardedName = localStorage.getItem('user_onboarded_name') || 'New Developer';
    const blackAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='black'/></svg>";
    
    const defaults = {
      editor: {
        fontSize: 12,
        fontFamily: 'JetBrains Mono',
        tabSize: 4,
        wordWrap: 'on' as const,
        minimap: false,
        autoSave: true,
        lineNumbers: 'on' as const,
        cursorBlinking: 'smooth',
        cursorStyle: 'line',
        smoothCaret: true,
        bracketAutocomplete: true,
      },
      terminal: {
        clearOnRun: true,
        showTimestamp: true,
        fontScale: 1.0,
        simulatedLatency: 200,
        bufferLimit: 100,
        bellSound: false,
      },
      gitSync: {
        enabled: true,
        repositoryUrl: 'https://github.com/RobloxUser/IncognitoWorkspace',
        syncBranch: 'main',
        autoPush: false,
        commitMessage: 'wip: update playground scripts',
        lastSyncedAt: null,
      },
      appearance: {
        themeId: 'clean-minimal',
        blurIntensity: 'none',
        animationsSpeed: 'normal',
      },
      syntax: {
        engineId: 'studio-classic',
      },
      account: {
        username: onboardedName,
        avatarUrl: blackAvatar,
        bio: 'Development environment active.',
        badge: 'Lead Architect',
      },
    };

    const saved = localStorage.getItem('incognito_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Overwrite porsche/unsplash/default avatar with clean black
        let loadedAvatar = parsed.account?.avatarUrl || blackAvatar;
        if (loadedAvatar.includes('unsplash.com') || loadedAvatar.includes('porsche') || loadedAvatar.includes('photo-')) {
          loadedAvatar = blackAvatar;
        }

        return {
          editor: { ...defaults.editor, ...parsed.editor },
          terminal: { ...defaults.terminal, ...parsed.terminal },
          gitSync: { ...defaults.gitSync, ...parsed.gitSync },
          appearance: { ...defaults.appearance, ...parsed.appearance },
          syntax: { ...defaults.syntax, ...parsed.syntax },
          account: { 
            ...defaults.account, 
            ...parsed.account,
            username: parsed.account?.username || defaults.account.username,
            avatarUrl: loadedAvatar
          },
        };
      } catch (err) {
        return defaults;
      }
    }
    return defaults;
  });

  // Active Theme object computed
  const currentTheme = themes.find(t => t.id === settings.appearance.themeId) || themes[0];

  // Terminal logs state
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'info',
      text: 'Workspace environment core successfully loaded.',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'init-2',
      type: 'success',
      text: 'Compiler Ready. Sandboxed workspace listening on default port 3000.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [terminalHeight, setTerminalHeight] = useState(160);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('incognito_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('incognito_tabs', JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    if (activeFileId) {
      localStorage.setItem('incognito_active_file', activeFileId);
    } else {
      localStorage.removeItem('incognito_active_file');
    }
  }, [activeFileId]);

  useEffect(() => {
    localStorage.setItem('incognito_syntaxes', JSON.stringify(syntaxes));
  }, [syntaxes]);

  useEffect(() => {
    localStorage.setItem('incognito_settings', JSON.stringify(settings));
  }, [settings]);

  // Command palette hotkey (Ctrl + P)
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Toast Notification dispatcher helper (adds to terminal)
  const addTerminalLine = (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'input' = 'info') => {
    const newLine: TerminalLine = {
      id: `term-${Date.now()}-${Math.random()}`,
      type,
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTerminalLines(prev => [...prev, newLine]);
  };

  // Virtual File Operations
  const handleOpenFile = (fileId: string) => {
    setActiveFileId(fileId);
    // Add file to tabs if not already open
    if (!tabs.some(t => t.fileId === fileId)) {
      setTabs(prev => [...prev, { fileId, isPinned: false }]);
    }
    setActiveSection('editor');
    addTerminalLine(`Loaded file node buffer index: ${files.find(f => f.id === fileId)?.name}`, 'info');
  };

  const handleCreateNode = (name: string, type: 'file' | 'folder', parentId: string | null) => {
    const newId = `file-${Date.now()}`;
    const newNode: FileNode = {
      id: newId,
      name,
      type,
      parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      size: 0,
      content: type === 'file' ? `--!strict\n-- Luau compilation element: ${name}\nprint("${name} executed successfully.")\n` : undefined,
    };

    setFiles(prev => [...prev, newNode]);
    addTerminalLine(`Created ${type} node: ${name}`, 'success');

    if (type === 'file') {
      handleOpenFile(newId);
    }
  };

  const handleRenameNode = (id: string, newName: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, name: newName, updatedAt: new Date().toISOString() };
      }
      return f;
    }));
    addTerminalLine(`Renamed node index to: ${newName}`, 'info');
  };

  const handleDeleteNode = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    // also remove from tabs
    setTabs(prev => prev.filter(t => t.fileId !== id));
    if (activeFileId === id) {
      setActiveFileId(null);
    }
    addTerminalLine(`Purged virtual Node UUID: ${id}`, 'warning');
  };

  const handleDuplicateNode = (id: string) => {
    const origin = files.find(f => f.id === id);
    if (!origin) return;

    const newId = `file-${Date.now()}`;
    const newNode: FileNode = {
      ...origin,
      id: newId,
      name: `Copy_${origin.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFiles(prev => [...prev, newNode]);
    handleOpenFile(newId);
    addTerminalLine(`Duplicated item node path: "${origin.name}"`, 'success');
  };

  const handleToggleFavorite = (id: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        const nextVal = !f.isFavorite;
        addTerminalLine(`Updated favorite registry state: ${f.name} = ${nextVal}`, 'info');
        return { ...f, isFavorite: nextVal };
      }
      return f;
    }));
  };

  const handleMoveNode = (id: string, newParentId: string | null) => {
    // ensure target exists if not null
    if (newParentId !== null && !files.some(f => f.id === newParentId && f.type === 'folder')) {
      addTerminalLine('Move failed: Selected target directory is invalid or was purged.', 'error');
      return;
    }
    
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, parentId: newParentId, updatedAt: new Date().toISOString() };
      }
      return f;
    }));
    const targetName = newParentId ? files.find(f => f.id === newParentId)?.name : 'Root Directory';
    addTerminalLine(`Moved node into: ${targetName}`, 'success');
  };

  const handleSaveFile = (fileId: string, text: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          content: text,
          size: text.length,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    }));

    // Reset unsaved tab indicator
    setTabs(prev => prev.map(t => {
      if (t.fileId === fileId) {
        return { ...t, isUnsaved: false };
      }
      return t;
    }));

    addTerminalLine(`Cached standard disk changes: ${files.find(f => f.id === fileId)?.name}`, 'success');
  };

  // Run script mock output logging
  const handleRunScript = (fileId: string) => {
    const target = files.find(f => f.id === fileId);
    if (!target) return;

    addTerminalLine(`$ exec luau -arch=gt3 -file="${target.name}"`, 'input');
    addTerminalLine(`Compiling dynamic execution graph: ${target.name}...`, 'info');

    // Parse simple patterns to mock real outputs
    setTimeout(() => {
      if (target.content) {
        const text = target.content;
        
        // Scan for print or warn tags
        const lines = text.split('\n');
        let executedLines = 0;
        
        lines.forEach(line => {
          const printMatch = line.match(/print\s*\(\s*["'](.*?)["']\s*\)/);
          const warnMatch = line.match(/warn\s*\(\s*["'](.*?)["']\s*\)/);
          const errorMatch = line.match(/error\s*\(\s*["'](.*?)["']\s*\)/);

          if (printMatch) {
            addTerminalLine(`[STANDARD_OUT] ${printMatch[1]}`, 'success');
            executedLines++;
          }
          if (warnMatch) {
            addTerminalLine(`[COMPILE_WARN] ${warnMatch[1]}`, 'warning');
            executedLines++;
          }
          if (errorMatch) {
            addTerminalLine(`[RUNTIME_EXC] ${errorMatch[1]}`, 'error');
            executedLines++;
          }
        });

        if (executedLines === 0) {
          // generic fallback execution
          addTerminalLine(`Evaluation completed successfully. Process exited with return code: 0`, 'success');
        }
      }
    }, 450);
  };

  // Dispatch interactive terminal parameters and execute
  const handleSendTerminal = (cmd: string) => {
    addTerminalLine(cmd, 'input');
    const lowerCmd = cmd.toLowerCase().trim();

    if (lowerCmd === 'help') {
      addTerminalLine('Incognito Console Calibrator CLI commands:', 'info');
      addTerminalLine('  diagnose        Simulate active double-wishbone chassis aligning checks', 'info');
      addTerminalLine('  compile         Compile the active editor file node immediately', 'info');
      addTerminalLine('  clear           Clear the interactive logging terminal', 'info');
      addTerminalLine('  status          View virtual hardware uptime and environment diagnostic logs', 'info');
      addTerminalLine('  theme {name}    Quick switch active workspace decal skin', 'info');
    } else if (lowerCmd === 'diagnose' || lowerCmd === 'diagnostics') {
      addTerminalLine('Initializing physical telemetry scanning sweeps...', 'info');
      setTimeout(() => {
        addTerminalLine('Checking suspension kinematics offsets (Dual Wishbone active metrics)...', 'info');
      }, 200);
      setTimeout(() => {
        addTerminalLine('Anti-roll bar target torque load calculations: 450 Nm/deg ✔', 'success');
        addTerminalLine('Active spring dampening threshold: Calibrated ✔', 'success');
        addTerminalLine('Telemetry system ready. GT3 alignment parameters: PERFECT.', 'success');
      }, 500);
    } else if (lowerCmd === 'clear') {
      setTerminalLines([]);
    } else if (lowerCmd === 'status') {
      addTerminalLine(`ACTIVE PILOT GREETING: ${settings.account.username}`, 'info');
      addTerminalLine(`COGNITIVE BADGE LEVEL: ${settings.account.badge.toUpperCase()}`, 'info');
      addTerminalLine(`SANDBOX ROOT WORKSPACE: PORT 3000 Standard Loopback`, 'info');
      addTerminalLine(`REACTIVE AUTOSAVE OPT: ${settings.editor.autoSave ? 'ENABLED' : 'DISABLED'}`, 'info');
    } else if (lowerCmd === 'compile') {
      if (activeFileId) {
        handleRunScript(activeFileId);
      } else {
        addTerminalLine('Error: No active script file loaded in focused editor view.', 'error');
      }
    } else if (lowerCmd.startsWith('theme ')) {
      const targetThemeQuery = lowerCmd.replace('theme ', '').trim();
      const matched = themes.find(t => t.name.toLowerCase().includes(targetThemeQuery) || t.id.toLowerCase().includes(targetThemeQuery));
      if (matched) {
        setSettings(prev => ({
          ...prev,
          appearance: { ...prev.appearance, themeId: matched.id }
        }));
        addTerminalLine(`Successfully applied theme preset: ${matched.name}`, 'success');
      } else {
        addTerminalLine(`Could not find theme pattern: "${targetThemeQuery}". Available: carbon, district, poison, ocean, shadow`, 'error');
      }
    } else {
      addTerminalLine(`Unknown terminal command: "${cmd}". Type "help" for a full list of commands.`, 'error');
    }
  };

  // Command palette items definition
  const commandPaletteItems = [
    {
      id: 'goto-home',
      category: 'Layout' as const,
      name: 'Navigate to Main welcome dashboard screen',
      shortcut: 'H',
      icon: <Home size={14} />,
      action: () => setActiveSection('home'),
    },
    {
      id: 'goto-editor',
      category: 'Layout' as const,
      name: 'Launch full vscode-style Luau code editor',
      shortcut: 'E',
      icon: <Code size={14} />,
      action: () => setActiveSection('editor'),
    },
    {
      id: 'goto-scripts',
      category: 'Layout' as const,
      name: 'Open custom scripts compilation manager board',
      shortcut: 'S',
      icon: <FileText size={14} />,
      action: () => setActiveSection('scripts'),
    },
    {
      id: 'goto-themes',
      category: 'Layout' as const,
      name: 'Tweak physical decal skin visual colors',
      icon: <Palette size={14} />,
      action: () => setActiveSection('themes'),
    },
    {
      id: 'goto-preferences',
      category: 'Layout' as const,
      name: 'Adjust autocompiles, fonts, account details',
      icon: <Sliders size={14} />,
      action: () => setActiveSection('settings'),
    },
    {
      id: 'goto-diagnostic-specs',
      category: 'Layout' as const,
      name: 'View workspace technical specifications & blueprints',
      icon: <Info size={14} />,
      action: () => setActiveSection('about'),
    },
    {
      id: 'cmd-diagnose',
      category: 'Actions' as const,
      name: 'Run suspension kinematics alignment check',
      shortcut: 'D',
      icon: <Terminal size={14} />,
      action: () => handleSendTerminal('diagnose'),
    },
    {
      id: 'cmd-clear',
      category: 'Actions' as const,
      name: 'Clear interactive logs history buffer',
      icon: <Terminal size={14} />,
      action: () => setTerminalLines([]),
    },
    // Dynamically inject open file triggers in palette
    ...files.filter(f => f.type === 'file').map(f => ({
      id: `open-${f.id}`,
      category: 'Files' as const,
      name: `Open file: ${f.name}`,
      icon: <FileText size={14} style={{ color: currentTheme.accent }} />,
      action: () => handleOpenFile(f.id),
    })),
    // Dynamically inject themes in palette
    ...themes.map(t => ({
      id: `theme-${t.id}`,
      category: 'Themes' as const,
      name: `Skin: ${t.name}`,
      icon: <Palette size={14} style={{ color: t.accent }} />,
      action: () => {
        setSettings(prev => ({
          ...prev,
          appearance: { ...prev.appearance, themeId: t.id }
        }));
        addTerminalLine(`Applied layout skin: ${t.name}`, 'success');
      }
    }))
  ];

  if (!userOnboarded) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-white text-zinc-900 font-sans px-4 overflow-hidden relative">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm bg-white border border-zinc-200 rounded-2xl p-8 relative z-10 shadow-xs"
        >
          <div className="space-y-6 text-left">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-black" />
              <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-800 uppercase">
                Incognito 3 - Introduction
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 font-mono">
                What's your name?
              </h1>
              <p className="text-xs text-zinc-400 font-mono">
                Enter your name to begin layout personalization.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = onboardValue.trim();
                if (trimmed) {
                  localStorage.setItem('user_onboarded_name', trimmed);
                  setSettings(prev => ({
                    ...prev,
                    account: {
                      ...prev.account,
                      username: trimmed
                    }
                  }));
                  setUserOnboarded(true);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <input
                  autoFocus
                  type="text"
                  value={onboardValue}
                  onChange={(e) => setOnboardValue(e.target.value)}
                  placeholder="Write your desired name here..."
                  maxLength={24}
                  className="w-full bg-white border border-zinc-300 rounded-xl py-2.5 px-4 text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black transition"
                />
              </div>

              <button
                type="submit"
                disabled={!onboardValue.trim()}
                className="w-full bg-black hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white rounded-xl py-2.5 text-xs font-bold font-mono tracking-widest uppercase transition duration-150 cursor-pointer"
              >
                Continue
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: currentTheme.terminalBg,
        color: currentTheme.textMain,
      }}
      className={`h-screen w-screen flex flex-col font-sans select-none overflow-hidden text-left relative ${currentTheme.background}`}
    >
      <AnimatePresence>
        {showLoading && (
          <LoadingScreen onComplete={() => setShowLoading(false)} />
        )}
      </AnimatePresence>

      {!showLoading && (
        <div className="flex-1 flex flex-col min-h-0 relative h-screen">
          
          {/* Main workspace layout frame wrapper */}
          <div className="flex-1 flex min-h-0 min-w-0">
            
            {/* Navigation sidebar */}
            <Sidebar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              theme={currentTheme}
              settings={settings}
              setSettings={setSettings}
            />

            {/* Inner view container */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
              
              {/* Secondary Layout for Editor split side navigation */}
              {activeSection === 'editor' ? (
                <div className="flex-1 flex min-w-0 min-h-0">
                  
                  {/* Left split virtual directory explorer */}
                  <FileExplorer
                    files={files}
                    activeFileId={activeFileId}
                    onSelectFile={handleOpenFile}
                    onCreateNode={handleCreateNode}
                    onRenameNode={handleRenameNode}
                    onDeleteNode={handleDeleteNode}
                    onDuplicateNode={handleDuplicateNode}
                    onToggleFavorite={handleToggleFavorite}
                    onMoveNode={handleMoveNode}
                    theme={currentTheme}
                  />

                  {/* Right split active workspace code frame */}
                  <div className="flex-1 flex flex-col min-w-0 min-h-0">
                    <CodeEditor
                      files={files}
                      setFiles={setFiles}
                      tabs={tabs}
                      setTabs={setTabs}
                      activeFileId={activeFileId}
                      setActiveFileId={setActiveFileId}
                      syntaxes={syntaxes}
                      theme={currentTheme}
                      settings={settings}
                      onRunScript={handleRunScript}
                      onSaveFile={handleSaveFile}
                    />

                    {/* Integrated dynamic height resizable Terminal Console panel */}
                    <TerminalPanel
                      lines={terminalLines}
                      onSendCommand={handleSendTerminal}
                      onClear={() => setTerminalLines([])}
                      terminalHeight={terminalHeight}
                      setTerminalHeight={setTerminalHeight}
                      theme={currentTheme}
                    />
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                  
                  <AnimatePresence mode="wait">
                    {activeSection === 'home' && (
                      <motion.div
                        key="home"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <Dashboard
                          files={files}
                          onOpenFileInEditor={handleOpenFile}
                          onCreateNewFile={(name) => handleCreateNode(name, 'file', null)}
                          onClearTerminal={() => setTerminalLines([])}
                          theme={currentTheme}
                          settings={settings}
                          setActiveSection={setActiveSection}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'scripts' && (
                      <motion.div
                        key="scripts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <ScriptsView
                          files={files}
                          onOpenFileInEditor={handleOpenFile}
                          onToggleFavorite={handleToggleFavorite}
                          onDeleteFile={handleDeleteNode}
                          onCreateNewFile={(name, type, cont) => {
                            const newId = `file-${Date.now()}`;
                            const node: FileNode = {
                              id: newId,
                              name,
                              type,
                              parentId: null,
                              content: cont,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              size: cont ? cont.length : 0
                            };
                            setFiles(prev => [...prev, node]);
                            handleOpenFile(newId);
                          }}
                          onRunScript={handleRunScript}
                          theme={currentTheme}
                          settings={settings}
                          setActiveSection={setActiveSection}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'themes' && (
                      <motion.div
                        key="themes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <SettingsView
                          settings={settings}
                          setSettings={setSettings}
                          syntaxes={syntaxes}
                          setSyntaxes={setSyntaxes}
                          themes={themes}
                          onSetTheme={(tId) => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, themeId: tId } }))}
                          theme={currentTheme}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'settings' && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <SettingsView
                          settings={settings}
                          setSettings={setSettings}
                          syntaxes={syntaxes}
                          setSyntaxes={setSyntaxes}
                          themes={themes}
                          onSetTheme={(tId) => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, themeId: tId } }))}
                          theme={currentTheme}
                        />
                      </motion.div>
                    )}

                    {activeSection === 'about' && (
                      <motion.div
                        key="about"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
                      >
                        <AboutView
                          theme={currentTheme}
                          settings={settings}
                          files={files}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              )}

            </div>

          </div>

          {/* Core Command Selector palette popup container */}
          <CommandPalette
            isOpen={isPaletteOpen}
            onClose={() => setIsPaletteOpen(false)}
            items={commandPaletteItems}
          />

        </div>
      )}
    </div>
  );
}
