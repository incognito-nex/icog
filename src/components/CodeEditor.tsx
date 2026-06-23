import React, { useState, useEffect, useRef } from 'react';
import Editor, { Monaco, useMonaco } from '@monaco-editor/react';
import { 
  X, Pin, Save, Star, Terminal, Play, RotateCcw, AlertTriangle, CheckCircle,
  MoreVertical, FileCode, Sparkles, Sliders, AlertCircle, Copy, Search, HelpCircle,
  Minimize2, Maximize2
} from 'lucide-react';
import { FileNode, TabItem, AppTheme, UserSettings, CustomSyntaxProfile } from '../types';

interface CodeEditorProps {
  files: FileNode[];
  setFiles: React.Dispatch<React.SetStateAction<FileNode[]>>;
  tabs: TabItem[];
  setTabs: React.Dispatch<React.SetStateAction<TabItem[]>>;
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  syntaxes: CustomSyntaxProfile[];
  theme: AppTheme;
  settings: UserSettings;
  onRunScript: (fileId: string) => void;
  onSaveFile: (fileId: string, text: string) => void;
}

export default function CodeEditor({
  files,
  setFiles,
  tabs,
  setTabs,
  activeFileId,
  setActiveFileId,
  syntaxes,
  theme,
  settings,
  onRunScript,
  onSaveFile,
}: CodeEditorProps) {
  const monaco = useMonaco();
  const [editorVal, setEditorVal] = useState('');
  const [activeTabMenu, setActiveTabMenu] = useState<{
    fileId: string;
    x: number;
    y: number;
  } | null>(null);

  // Tab dragging state
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);

  // Full screen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Retrieve current active code node
  const activeFile = files.find(f => f.id === activeFileId);

  // Select active syntax profile
  const activeSyntax = syntaxes.find(s => s.id === settings.syntax.engineId) || syntaxes[0];

  useEffect(() => {
    if (activeFile) {
      setEditorVal(activeFile.content || '');
    } else {
      setEditorVal('');
    }
  }, [activeFileId]);

  // Dynamic Monarch language config based on selected user-custom defined syntax rules
  useEffect(() => {
    if (!monaco) return;

    // Register Luau as custom ID
    monaco.languages.register({ id: 'luau' });

    // Build lists
    const keywordsList = activeSyntax.keywords.length > 0 ? activeSyntax.keywords : ['local', 'function', 'return', 'end'];
    const functionsList = activeSyntax.functions.length > 0 ? activeSyntax.functions : ['print', 'warn'];

    monaco.languages.setMonarchTokensProvider('luau', {
      defaultToken: 'invalid',
      keywords: keywordsList,
      functions: functionsList,
      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
        '<<', '>>', '>>>'
      ],
      // Regexes
      symbols:  /[=><!~?:&|+\-*\/\^%]+/,
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|u{[0-9A-Fa-f]+})/,
      
      tokenizer: {
        root: [
          // identifiers and keywords
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@functions': 'custom-func',
              '@default': 'identifier'
            }
          }],

          // whitespace
          { include: '@whitespace' },

          // delimiters and operators
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],

          // numbers
          [/\d*\.\d+(?:[eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],

          // delimiter: member or object
          [/[;,.]/, 'delimiter'],

          // strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-templated string
          [/"/,  { token: 'string.quote', bracket: '@open', next: '@string' }],
          [/'/,  { token: 'string.quote', bracket: '@open', next: '@stringSingle' }],
        ],

        string: [
          [/[^\\"]+/,  'string'],
          [/@escapes/, 'string.escape'],
          [/\\./,      'string.escape.invalid'],
          [/"/,        { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        stringSingle: [
          [/[^\\']+/,  'string'],
          [/@escapes/, 'string.escape'],
          [/\\./,      'string.escape.invalid'],
          [/'/,        { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/--.*$/, 'comment'], // Luau dual dashes for comment
        ],
      },
    });

    // Register active compiler theme depending on active custom profiles config colors!
    monaco.editor.defineTheme('incognitoTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: activeSyntax.colors.keywords.replace('#', ''), fontStyle: 'bold' },
        { token: 'custom-func', foreground: activeSyntax.colors.functions.replace('#', ''), fontStyle: 'italic' },
        { token: 'string', foreground: activeSyntax.colors.strings.replace('#', '') },
        { token: 'number', foreground: activeSyntax.colors.numbers.replace('#', '') },
        { token: 'comment', foreground: activeSyntax.colors.comments.replace('#', ''), fontStyle: 'italic' },
        { token: 'operator', foreground: activeSyntax.colors.operators.replace('#', '') },
        { token: 'identifier', foreground: 'e2e8f0' },
      ],
      colors: {
        'editor.background': theme.editorBg,
        'editor.foreground': '#f1f5f9',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': theme.accent,
        'editor.lineHighlightBackground': '#1e222b40',
        'editor.selectionBackground': `${theme.accent}33`,
        'editorCursor.foreground': theme.accent,
      }
    });

    monaco.editor.setTheme('incognitoTheme');

  }, [monaco, activeSyntax, theme]);

  // Handle Monaco changes
  const handleEditorChange = (val: string | undefined) => {
    const updatedVal = val || '';
    setEditorVal(updatedVal);

    if (activeFileId) {
      // Mark tab as unsaved if contents changed from disk representation
      const orig = files.find(f => f.id === activeFileId);
      if (orig && orig.content !== updatedVal) {
        setTabs(prev => prev.map(t => {
          if (t.fileId === activeFileId) {
            return { ...t, isUnsaved: true };
          }
          return t;
        }));
      }

      // If autosave is on, immediately update local database
      if (settings.editor.autoSave) {
        onSaveFile(activeFileId, updatedVal);
      }
    }
  };

  // Keyboard save manual hook: Ctrl + S or Command + S
  useEffect(() => {
    const handleSaveHotkey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        triggerManualSave();
      }
    };
    window.addEventListener('keydown', handleSaveHotkey);
    return () => window.removeEventListener('keydown', handleSaveHotkey);
  }, [activeFileId, editorVal]);

  const triggerManualSave = () => {
    if (activeFileId) {
      onSaveFile(activeFileId, editorVal);
      setTabs(prev => prev.map(t => {
        if (t.fileId === activeFileId) {
          return { ...t, isUnsaved: false };
        }
        return t;
      }));
    }
  };

  // Tab operations
  const handleCloseTab = (fId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const targetTab = tabs.find(t => t.fileId === fId);
    if (targetTab?.isUnsaved && !settings.editor.autoSave) {
      if (!confirm('You have unsaved workspace logs. Lose these changes?')) {
        return;
      }
    }

    const filtered = tabs.filter(t => t.fileId !== fId);
    setTabs(filtered);

    if (activeFileId === fId) {
      if (filtered.length > 0) {
        // Select nearest tab
        const lastTab = filtered[filtered.length - 1];
        setActiveFileId(lastTab.fileId);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const handleCloseOthers = (fId: string) => {
    const filtered = tabs.filter(t => t.fileId === fId || t.isPinned);
    setTabs(filtered);
    setActiveFileId(fId);
  };

  const handleTogglePin = (fId: string) => {
    setTabs(prev => prev.map(t => {
      if (t.fileId === fId) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    }));
  };

  const handleDuplicate = (fId: string) => {
    const orig = files.find(f => f.id === fId);
    if (!orig) return;

    const newId = `file-${Date.now()}`;
    const newName = `Copy_${orig.name}`;
    const newNode: FileNode = {
      ...orig,
      id: newId,
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFiles(prev => [...prev, newNode]);
    // open tab
    setTabs(prev => [...prev, { fileId: newId, isPinned: false }]);
    setActiveFileId(newId);
  };

  const handleRename = (fId: string) => {
    const orig = files.find(f => f.id === fId);
    if (!orig) return;

    const newName = prompt('Rename tab file:', orig.name);
    if (newName && newName.trim() && newName !== orig.name) {
      setFiles(prev => prev.map(f => {
        if (f.id === fId) {
          return { ...f, name: newName.trim(), updatedAt: new Date().toISOString() };
        }
        return f;
      }));
    }
  };

  const handleRightClickTab = (e: React.MouseEvent, fId: string) => {
    e.preventDefault();
    setActiveTabMenu({
      fileId: fId,
      x: e.clientX,
      y: e.clientY
    });
  };

  useEffect(() => {
    const closeTabMenu = () => setActiveTabMenu(null);
    window.addEventListener('click', closeTabMenu);
    return () => window.removeEventListener('click', closeTabMenu);
  }, []);

  // Sort Pinned first, then normal tabs
  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0; // maintain relative order otherwise
  });

  // Reorder dragging handlers
  const handleDragStart = (e: React.DragEvent, fId: string) => {
    setDraggedFileId(fId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetFId: string) => {
    e.preventDefault();
    if (!draggedFileId || draggedFileId === targetFId) return;

    const draggedIdx = tabs.findIndex(t => t.fileId === draggedFileId);
    const targetIdx = tabs.findIndex(t => t.fileId === targetFId);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      const reordered = [...tabs];
      const [removed] = reordered.splice(draggedIdx, 1);
      reordered.splice(targetIdx, 0, removed);
      setTabs(reordered);
    }
    setDraggedFileId(null);
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 font-sans select-none relative ${isFullscreen ? 'fixed inset-0 z-40 bg-[#0c0d0f]' : 'h-full'}`}>
      
      {/* Tab Area Toolbar standard row */}
      <div
        style={{
          backgroundColor: theme.headerBg,
          borderColor: theme.borderColor,
        }}
        className="h-11 border-b flex items-center justify-between px-2 overflow-x-auto select-none shrink-0"
      >
        <div className="flex items-center space-x-1.5 flex-1 min-w-0 h-full overflow-x-auto no-scrollbar">
          {sortedTabs.map((tb) => {
            const fileItem = files.find(f => f.id === tb.fileId);
            if (!fileItem) return null;

            const isCurrent = activeFileId === tb.fileId;
            const isUnsaved = !!tb.isUnsaved;

            return (
              <div
                key={tb.fileId}
                draggable
                onDragStart={(e) => handleDragStart(e, tb.fileId)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, tb.fileId)}
                onContextMenu={(e) => handleRightClickTab(e, tb.fileId)}
                onClick={() => setActiveFileId(tb.fileId)}
                style={{
                  borderBottomColor: isCurrent ? theme.accent : 'transparent',
                  background: isCurrent ? theme.editorBg : 'transparent'
                }}
                className={`group h-full flex items-center space-x-2 px-3.5 border-b-2 cursor-pointer transition relative text-xs min-w-[90px] max-w-[170px] shrink-0 hover:bg-zinc-800/10 ${
                  isCurrent 
                    ? 'text-white font-semibold' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileCode size={13} style={{ color: isCurrent ? theme.accent : undefined }} className="shrink-0" />
                
                <span className="truncate flex-1 font-mono text-[10px] pr-2">
                  {fileItem.name}
                </span>

                {/* Pin Badge icon */}
                {tb.isPinned && (
                  <Pin size={10} className="text-amber-500 shrink-0 transform -rotate-45" />
                )}

                {/* Close/Status element */}
                <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                  {isUnsaved && !settings.editor.autoSave ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse group-hover:hidden" />
                  ) : null}
                  <button
                    onClick={(e) => handleCloseTab(tb.fileId, e)}
                    className={`rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 p-0.5 ${isUnsaved ? 'hidden group-hover:block' : ''}`}
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Toolbar Quick Actions standard bar */}
        <div className="flex items-center space-x-1 pl-2 border-l border-zinc-800/60 shrink-0">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-white transition"
            title={isFullscreen ? "Minimize Screen" : "Fullscreen Studio Code"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {activeFileId && !settings.editor.autoSave && (
            <button
              onClick={triggerManualSave}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-500 transition"
              style={{ color: theme.textMuted }}
              title="Save active file (Ctrl+S)"
            >
              <Save size={13} />
            </button>
          )}

          {activeFileId && (
            <button
              onClick={() => onRunScript(activeFileId)}
              style={{ backgroundColor: `${theme.accent}14`, color: theme.accent, borderColor: `${theme.accent}33` }}
              className="p-1 px-3 border rounded text-[10px] font-mono font-bold flex items-center space-x-1 hover:opacity-90 active:scale-95 transition"
              title="Launch Luau compiler core"
            >
              <Play size={10} className="fill-current" />
              <span>Launch</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Main Client Panel */}
      <div className="flex-1 min-h-0 bg-zinc-950 flex flex-col relative">
        {activeFileId ? (
          <div className="flex-1 min-h-0 text-left">
            <Editor
              height="100%"
              language="luau"
              value={editorVal}
              onChange={handleEditorChange}
              options={{
                fontSize: settings.editor.fontSize,
                fontFamily: settings.editor.fontFamily,
                tabSize: settings.editor.tabSize,
                wordWrap: settings.editor.wordWrap,
                minimap: { enabled: settings.editor.minimap },
                automaticLayout: true,
                padding: { top: 8, bottom: 8 },
                cursorBlinking: 'smooth',
                cursorWidth: 2,
                folding: true,
                autoIndent: 'full',
                bracketPairColorization: { enabled: true },
                colorDecorators: true,
                formatOnPaste: true,
                contextmenu: true,
              }}
            />

            {/* Float Save alert */}
            {tabs.find(t => t.fileId === activeFileId)?.isUnsaved && (
              <div 
                className="absolute bottom-4 right-4 border backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center space-x-2 font-mono text-[10px]"
                style={{ 
                  backgroundColor: `${theme.accent}14`, 
                  borderColor: `${theme.accent}40`,
                  color: theme.accent
                }}
              >
                <AlertCircle size={12} className="shrink-0" />
                <span>Unsaved changes. Ctrl+S to save code state.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-zinc-950/60 relative">
            <div className="absolute inset-0 bg-radial-[circle_400px_at_50%_50%,rgba(0,0,0,0.03),transparent]" />

            <div className="space-y-4 max-w-sm relative z-10 font-sans">
              <FileCode size={32} className="text-zinc-800 mx-auto animate-pulse" />
              <div>
                <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">
                  No Active File
                </h3>
                <p className="text-[11px] text-zinc-650 mt-2 font-mono leading-relaxed uppercase">
                  Select key scripts from the explorer on the left to start coding.
                </p>
              </div>

              <div className="border border-zinc-900 bg-zinc-950 p-3 rounded-lg text-left text-[10px] font-mono text-zinc-500 leading-relaxed max-w-xs mx-auto">
                <div className="text-zinc-400 font-bold border-b border-zinc-900 pb-1 mb-1.5 uppercase">Shortcuts Cheat-Sheet:</div>
                <div className="flex justify-between py-0.5"><span>Ctrl + P</span> <span style={{ color: theme.accent }}>Command Palette</span></div>
                <div className="flex justify-between py-0.5"><span>Ctrl + S</span> <span>Save Workspace logs</span></div>
                <div className="flex justify-between py-0.5"><span>Escape</span> <span>Exit floating consoles</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating right click TAB menu popover */}
      {activeTabMenu && (
        <div
          style={{
            top: `${activeTabMenu.y}px`,
            left: `${activeTabMenu.x}px`,
            backgroundColor: theme.sidebarBg,
            borderColor: theme.borderColor,
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)'
          }}
          className="fixed z-50 border rounded-lg py-1.5 w-44 font-sans text-xs flex flex-col pointer-events-auto bg-[#13141a]"
        >
          <button
            onClick={() => handleRename(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-[#ee3c22]/10 hover:text-[#ee3c22] transition flex items-center space-x-2"
          >
            <span>Rename File Tab</span>
          </button>

          <button
            onClick={() => handleTogglePin(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-[#ee3c22]/10 hover:text-[#ee3c22] transition flex items-center space-x-2"
          >
            <span>Pin Standard Anchor</span>
          </button>

          <button
            onClick={() => handleDuplicate(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-[#ee3c22]/10 hover:text-[#ee3c22] transition flex items-center space-x-2"
          >
            <span>Duplicate File</span>
          </button>

          <div className="h-[1px] bg-zinc-800 my-1" />

          <button
            onClick={() => handleCloseOthers(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-[#ee3c22]/10 hover:text-[#ee3c22] transition flex items-center space-x-2"
          >
            <span>Close Other Tabs</span>
          </button>

          <button
            onClick={() => handleCloseTab(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-rose-500 hover:bg-rose-500/10 transition flex items-center space-x-2 font-semibold"
          >
            <span>Close Active Tab</span>
          </button>
        </div>
      )}
    </div>
  );
}
