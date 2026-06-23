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

  // Custom rename tab GUI state
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);

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

    // Register Luau as custom ID if not already registered
    if (!monaco.languages.getLanguages().some(lang => lang.id === 'luau')) {
      monaco.languages.register({ id: 'luau' });
    }

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

    // Helper to adapt dark syntax colors on dark themes and light syntax colors on light themes
    const adaptColor = (hex: string) => {
      const clean = hex.replace('#', '');
      if (!theme.isLight) {
        if (clean === '18181b' || clean === '000000' || clean === '0f172a' || clean === '09090b' || clean === '050505') {
          return 'e2e8f0';
        }
      } else {
        if (clean === 'ffffff' || clean === 'fafafa' || clean === 'f4f4f5' || clean === 'f5f5f5') {
          return '18181b';
        }
      }
      return clean;
    };

    // Register active compiler theme depending on active custom profiles config colors!
    monaco.editor.defineTheme('incognitoTheme', {
      base: theme.isLight ? 'vs' : 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: adaptColor(activeSyntax.colors.keywords), fontStyle: 'bold' },
        { token: 'custom-func', foreground: adaptColor(activeSyntax.colors.functions), fontStyle: 'italic' },
        { token: 'string', foreground: adaptColor(activeSyntax.colors.strings) },
        { token: 'number', foreground: adaptColor(activeSyntax.colors.numbers) },
        { token: 'comment', foreground: adaptColor(activeSyntax.colors.comments), fontStyle: 'italic' },
        { token: 'operator', foreground: adaptColor(activeSyntax.colors.operators) },
        { token: 'identifier', foreground: theme.isLight ? '18181b' : 'e2e8f0' },
      ],
      colors: {
        'editor.background': theme.editorBg,
        'editor.foreground': theme.isLight ? '#18181b' : '#f1f5f9',
        'editorLineNumber.foreground': theme.isLight ? '#71717a' : '#52525b',
        'editorLineNumber.activeForeground': theme.accent,
        'editor.lineHighlightBackground': theme.isLight ? '#fafafa50' : '#1e222b40',
        'editor.selectionBackground': `${theme.accent}33`,
        'editorCursor.foreground': theme.accent,
      }
    });

    monaco.editor.setTheme('incognitoTheme');

    // Register dynamic autocomplete completion provider
    const completionProvider = monaco.languages.registerCompletionItemProvider('luau', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const keywordsSuggestions = keywordsList.map(kw => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range: range
        }));

        const functionsSuggestions = functionsList.map(fn => ({
          label: fn,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${fn}($1)`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: range
        }));

        const luauGlobals = [
          { name: 'task', desc: 'Schedules tasks', kind: 'Module' },
          { name: 'task.wait', desc: 'Yields the current thread for the specified duration', kind: 'Method', snippet: 'task.wait($1)' },
          { name: 'task.delay', desc: 'Schedules a function to run after a specified delay', kind: 'Method', snippet: 'task.delay(${1:delay}, function()\n\t$2\nend)' },
          { name: 'task.spawn', desc: 'Spawns a thread immediately', kind: 'Method', snippet: 'task.spawn(function()\n\t$1\nend)' },
          { name: 'game', desc: 'The DataModel root service container', kind: 'Variable' },
          { name: 'workspace', desc: 'Quick reference to game.Workspace', kind: 'Variable' },
          { name: 'Instance', desc: 'Constructor helper for creating Object instances', kind: 'Module' },
          { name: 'Instance.new', desc: 'Creates a new object instance', kind: 'Method', snippet: 'Instance.new("${1:Part}", ${2:workspace})' },
          { name: 'Vector3', desc: 'Constructor helper for 3D coordinates', kind: 'Module' },
          { name: 'Vector3.new', desc: 'Creates a new Vector3 coordinate', kind: 'Method', snippet: 'Vector3.new(${1:0}, ${2:0}, ${3:0})' },
          { name: 'math.clamp', desc: 'Clamps a number between a min and max', kind: 'Method', snippet: 'math.clamp(${1:val}, ${2:min}, ${3:max})' },
          { name: 'math.random', desc: 'Returns a random number or integer', kind: 'Method', snippet: 'math.random(${1:1}, ${2:100})' },
          { name: 'TweenService', desc: 'Service to animate property offsets smoothly', kind: 'Module' },
          { name: 'Players', desc: 'Roblox / Luau Players server/client container', kind: 'Module' },
          { name: 'ReplicatedStorage', desc: 'Synchronized workspace assets container', kind: 'Module' },
          { name: 'Script', desc: 'Reference to this active script instance', kind: 'Variable' },
          { name: 'print', desc: 'Log standard message debug lines to developer output', kind: 'Function', snippet: 'print($1)' },
          { name: 'warn', desc: 'Log colored warning lines to diagnostic output', kind: 'Function', snippet: 'warn($1)' },
          { name: 'error', desc: 'Raise fatal exception and discontinue sequence execution', kind: 'Function', snippet: 'error($1)' },
          { name: 'pairs', desc: 'Generator function for standard iterative loops', kind: 'Function', snippet: 'pairs($1)' },
          { name: 'ipairs', desc: 'Generator function for indexed sequential arrays', kind: 'Function', snippet: 'ipairs($1)' },
          { name: 'type', desc: 'Identifies string type names of parameters', kind: 'Function', snippet: 'type($1)' },
          { name: 'typeof', desc: 'Identifies complex structure type names in Luau environment', kind: 'Function', snippet: 'typeof($1)' },
        ];

        const rbxSuggestions = luauGlobals.map(g => {
          let kind = monaco.languages.CompletionItemKind.Variable;
          if (g.kind === 'Method' || g.kind === 'Function') kind = monaco.languages.CompletionItemKind.Method;
          if (g.kind === 'Module') kind = monaco.languages.CompletionItemKind.Module;
          return {
            label: g.name,
            kind: kind,
            documentation: g.desc,
            insertText: g.snippet || g.name,
            insertTextRules: g.snippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
            range: range
          };
        });

        return {
          suggestions: [...keywordsSuggestions, ...functionsSuggestions, ...rbxSuggestions]
        };
      }
    });

    return () => {
      completionProvider.dispose();
    };

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

    setRenameFileId(fId);
    setRenameInputValue(orig.name);
    setRenameError(null);
  };

  const submitTabRename = (e: React.FormEvent) => {
    e.preventDefault();
    const val = renameInputValue.trim();
    if (!val) {
      setRenameError('Filename cannot be empty');
      return;
    }
    if (val.includes('/') || val.includes('\\')) {
      setRenameError('Invalid characters in file name');
      return;
    }
    setFiles(prev => prev.map(f => {
      if (f.id === renameFileId) {
        return { ...f, name: val, updatedAt: new Date().toISOString() };
      }
      return f;
    }));
    setRenameFileId(null);
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
              theme="incognitoTheme"
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
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2"
          >
            <span>Rename File Tab</span>
          </button>

          <button
            onClick={() => handleTogglePin(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2"
          >
            <span>Pin Standard Anchor</span>
          </button>

          <button
            onClick={() => handleDuplicate(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2"
          >
            <span>Duplicate File</span>
          </button>

          <div className="h-[1px] bg-zinc-800 my-1" />

          <button
            onClick={() => handleCloseOthers(activeTabMenu.fileId)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2"
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
      {/* Custom Rename Tab GUI modal */}
      {renameFileId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 select-none">
          <div 
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.borderColor,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }} 
            className="w-full max-w-sm rounded-2xl border p-6 font-sans mx-4"
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: theme.borderColor }}>
              <div className="flex items-center space-x-2">
                <Sliders size={14} style={{ color: theme.accent }} />
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                  Rename Tab File
                </h4>
              </div>
              <button 
                onClick={() => setRenameFileId(null)}
                className="p-1 rounded-md hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition animate-none"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={submitTabRename} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label 
                  className="text-[9px] font-mono font-bold tracking-widest uppercase block"
                  style={{ color: theme.accent }}
                >
                  Filename:
                </label>
                <input
                  type="text"
                  value={renameInputValue}
                  onChange={(e) => setRenameInputValue(e.target.value)}
                  autoFocus
                  style={{ 
                    backgroundColor: theme.isLight ? 'rgb(244 244 245)' : 'rgb(9 9 11)', 
                    borderColor: theme.borderColor,
                    color: theme.textMain 
                  }}
                  className="w-full py-2.5 px-3 border rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
                {renameError && (
                  <div className="text-[10px] text-red-500 font-mono flex items-center space-x-1 mt-1">
                    <AlertTriangle size={10} />
                    <span>{renameError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: theme.borderColor }}>
                <button
                  type="button"
                  onClick={() => setRenameFileId(null)}
                  style={{ color: theme.textMuted }}
                  className="px-3.5 py-1.5 text-[10px] font-mono font-bold hover:opacity-80 uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[10px] font-mono font-bold rounded-lg uppercase transition hover:opacity-90 cursor-pointer"
                  style={{ 
                    backgroundColor: theme.accent, 
                    color: theme.isLight ? '#ffffff' : '#000000' 
                  }}
                >
                  Save Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
