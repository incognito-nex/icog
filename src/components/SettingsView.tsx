import React, { useState } from 'react';
import { 
  Sliders, User, Download, Upload, Settings2, Paintbrush, BookOpen, Check,
  Terminal, Github, Cpu, Layers, Volume2, Sparkles, Code, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { UserSettings, CustomSyntaxProfile, AppTheme } from '../types';

interface SettingsProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  syntaxes: CustomSyntaxProfile[];
  setSyntaxes: React.Dispatch<React.SetStateAction<CustomSyntaxProfile[]>>;
  themes: AppTheme[];
  onSetTheme: (themeId: string) => void;
  theme: AppTheme;
  initialTab?: 'editor' | 'terminal' | 'gitsync' | 'luau' | 'appearance' | 'profile' | 'experimental';
  onTriggerGitSync?: () => void;
}

export default function SettingsView({
  settings,
  setSettings,
  syntaxes,
  setSyntaxes,
  themes,
  onSetTheme,
  theme,
  initialTab,
  onTriggerGitSync,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal' | 'gitsync' | 'luau' | 'appearance' | 'profile' | 'keybind' | 'experimental'>((initialTab as any) || 'editor');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [recordingField, setRecordingField] = useState<string | null>(null);

  const tabContainerRef = React.useRef<HTMLDivElement>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const startRecording = (field: string) => {
    setRecordingField(field);
    triggerToast("Listening for keybind. Press your desired keys (e.g. Ctrl+Shift+K)...", "success");
  };

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (tabContainerRef.current) {
      tabContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  React.useEffect(() => {
    if (!recordingField) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');

      let keyName = e.key;
      if (keyName === ' ') keyName = 'Space';
      if (keyName.length === 1) {
        keyName = keyName.toUpperCase();
      } else {
        keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1);
      }

      parts.push(keyName);
      const recordedString = parts.join('+');

      setSettings(prev => {
        const updated = {
          ...prev,
          keybinds: {
            ...(prev.keybinds || {
              toggleCommandPalette: 'Ctrl+P',
              autoFixSyntax: 'Ctrl+Shift+F',
              obfuscateScript: 'Ctrl+Shift+O',
              deobfuscateScript: 'Ctrl+Shift+D'
            }),
            [recordingField]: recordedString
          }
        };
        localStorage.setItem('incognito_settings', JSON.stringify(updated));
        return updated;
      });

      triggerToast(`Keybind updated to ${recordedString}`, 'success');
      setRecordingField(null);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [recordingField]);

  const handleUpdate = <T extends keyof UserSettings>(section: T, field: keyof UserSettings[T], value: any) => {
    setSettings((prev) => {
      const sectionObj = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...sectionObj,
          [field]: value
        }
      };
    });
  };

  const handleExportSyntax = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(syntaxes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "incognito_syntax_engines.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportSyntax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setSyntaxes(parsed);
          triggerToast('Custom syntax engines loaded successfully.', 'success');
        } else {
          triggerToast('Invalid format. Must be an array of syntax engine specifications.', 'error');
        }
      } catch (err) {
        triggerToast('Failed to parse syntax file.', 'error');
      }
    };
    fileReader.readAsText(filesList[0]);
  };

  const inputBg = theme.isLight 
    ? 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-zinc-400' 
    : 'bg-zinc-900 text-zinc-100 border-zinc-800 focus:border-zinc-700';

  const containerBorder = theme.isLight ? 'border-zinc-200' : 'border-zinc-850';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 font-sans text-left pb-24">
      {/* Title */}
      <div className="pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left" style={{ borderColor: theme.borderColor }}>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
            <Settings2 className="w-5 h-5" style={{ color: theme.accent }} />
            <span>Workspace Control Panel</span>
          </h1>
          <p className="text-xs mt-1 font-medium" style={{ color: theme.textMuted }}>
            Configure compilers, responsive views, diagnostic metrics, and local sandbox configurations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div 
        ref={tabContainerRef}
        onWheel={handleTabsWheel}
        className="flex border-b overflow-x-auto shrink-0 select-none no-scrollbar" 
        style={{ borderColor: theme.borderColor }}
      >
        {(settings.experimental?.terminalEnabled 
          ? ['editor', 'terminal', 'gitsync', 'luau', 'appearance', 'profile', 'keybind', 'experimental'] 
          : ['editor', 'gitsync', 'luau', 'appearance', 'profile', 'keybind', 'experimental']
        ).map((tab) => {
          const tabLabels: Record<string, string> = {
            editor: 'Editor Dev',
            terminal: 'Terminal Settings',
            gitsync: 'Git Sync',
            luau: 'Lua/u syntax',
            appearance: 'Skin/Themes',
            profile: 'Profile',
            keybind: 'Keybinds',
            experimental: 'Experimental'
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                borderColor: activeTab === tab ? theme.accent : 'transparent',
                color: activeTab === tab ? theme.textMain : theme.textMuted
              }}
              className="px-4 py-3 text-xs uppercase font-mono tracking-wider font-bold border-b-2 hover:opacity-80 transition whitespace-nowrap"
            >
              {tabLabels[tab]}
            </button>
          )
        })}
      </div>

      {/* Settings Panel Grid */}
      <div 
        className="border rounded-2xl p-5 md:p-8 max-w-4xl shadow-xs" 
        style={{ 
          backgroundColor: theme.cardBg, 
          borderColor: theme.borderColor 
        }}
      >
        {/* TAB 1: EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: theme.borderColor }}>
              <Sliders size={15} style={{ color: theme.accent }} />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                Incognito Editor Preferences
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Font Sizing (px)</label>
                <input
                  type="number"
                  min="10"
                  max="24"
                  value={settings.editor.fontSize}
                  onChange={(e) => handleUpdate('editor', 'fontSize', parseInt(e.target.value) || 12)}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Font Typography</label>
                <select
                  value={settings.editor.fontFamily}
                  onChange={(e) => handleUpdate('editor', 'fontFamily', e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="JetBrains Mono">JetBrains Mono (Recommended)</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="ui-monospace">System Monospace</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Indentation Spacing</label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={settings.editor.tabSize}
                  onChange={(e) => handleUpdate('editor', 'tabSize', parseInt(e.target.value) || 4)}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Cursor Blinking Model</label>
                <select
                  value={settings.editor.cursorBlinking}
                  onChange={(e) => handleUpdate('editor', 'cursorBlinking', e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="smooth">Smooth Caret (Recommended)</option>
                  <option value="blink">Standard Blink</option>
                  <option value="expand">Laser Pulse</option>
                  <option value="phase">Steady Phase</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Cursor Style Design</label>
                <select
                  value={settings.editor.cursorStyle}
                  onChange={(e) => handleUpdate('editor', 'cursorStyle', e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="line">Thin Line (VSCode)</option>
                  <option value="block">Solid Terminal Block</option>
                  <option value="underline">Underline Prompt</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Word Wrapping</label>
                <select
                  value={settings.editor.wordWrap}
                  onChange={(e) => handleUpdate('editor', 'wordWrap', e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="on">Enabled</option>
                  <option value="off">Disabled</option>
                </select>
              </div>
            </div>

            {/* Quick switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
              <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                <input
                  type="checkbox"
                  checked={settings.editor.minimap}
                  onChange={(e) => handleUpdate('editor', 'minimap', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  style={{
                    borderColor: settings.editor.minimap ? theme.accent : theme.borderColor,
                    backgroundColor: settings.editor.minimap ? theme.accent : 'transparent'
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                >
                  {settings.editor.minimap && (
                    <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Gutter Minimap Map</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Enable floating mini overview</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                <input
                  type="checkbox"
                  checked={settings.editor.autoSave}
                  onChange={(e) => handleUpdate('editor', 'autoSave', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  style={{
                    borderColor: settings.editor.autoSave ? theme.accent : theme.borderColor,
                    backgroundColor: settings.editor.autoSave ? theme.accent : 'transparent'
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                >
                  {settings.editor.autoSave && (
                    <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Synchronous Auto-Save</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Saves files instantly on type</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                <input
                  type="checkbox"
                  checked={settings.editor.lineNumbers === 'on'}
                  onChange={(e) => handleUpdate('editor', 'lineNumbers', e.target.checked ? 'on' : 'off')}
                  className="sr-only"
                />
                <div 
                  style={{
                    borderColor: settings.editor.lineNumbers === 'on' ? theme.accent : theme.borderColor,
                    backgroundColor: settings.editor.lineNumbers === 'on' ? theme.accent : 'transparent'
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                >
                  {settings.editor.lineNumbers === 'on' && (
                    <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Show Line Numbers</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Render gutter indexes on left</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                <input
                  type="checkbox"
                  checked={settings.editor.smoothCaret}
                  onChange={(e) => handleUpdate('editor', 'smoothCaret', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  style={{
                    borderColor: settings.editor.smoothCaret ? theme.accent : theme.borderColor,
                    backgroundColor: settings.editor.smoothCaret ? theme.accent : 'transparent'
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                >
                  {settings.editor.smoothCaret && (
                    <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Smooth Caret Animation</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Animates typing caret fluidly</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                <input
                  type="checkbox"
                  checked={settings.editor.bracketAutocomplete}
                  onChange={(e) => handleUpdate('editor', 'bracketAutocomplete', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  style={{
                    borderColor: settings.editor.bracketAutocomplete ? theme.accent : theme.borderColor,
                    backgroundColor: settings.editor.bracketAutocomplete ? theme.accent : 'transparent'
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                >
                  {settings.editor.bracketAutocomplete && (
                    <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Bracket Autoclose</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Auto close parentheses, quotes & braces</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: theme.borderColor }}>
              <Terminal size={15} style={{ color: theme.accent }} />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                Terminal Console Configuration
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Simulation Compiler Delay</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1500"
                    step="50"
                    value={settings.terminal.simulatedLatency}
                    onChange={(e) => handleUpdate('terminal', 'simulatedLatency', parseInt(e.target.value))}
                    style={{ accentColor: theme.accent }}
                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-zinc-400 shrink-0 w-12 text-right">{settings.terminal.simulatedLatency}ms</span>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Console Size Limit (Lines)</label>
                <select
                  value={settings.terminal.bufferLimit}
                  onChange={(e) => handleUpdate('terminal', 'bufferLimit', parseInt(e.target.value))}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="50">50 Lines limit</option>
                  <option value="100">100 Lines limit</option>
                  <option value="200">200 Lines limit</option>
                  <option value="500">Unbounded scroll</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Font Scale zoom</label>
                <select
                  value={settings.terminal.fontScale.toString()}
                  onChange={(e) => handleUpdate('terminal', 'fontScale', parseFloat(e.target.value))}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="0.8">0.8x Compact</option>
                  <option value="1.0">1.0x Def (Default)</option>
                  <option value="1.2">1.2x Comfort</option>
                  <option value="1.4">1.4x Highly readable</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
              <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                <input
                  type="checkbox"
                  checked={settings.terminal.clearOnRun}
                  onChange={(e) => handleUpdate('terminal', 'clearOnRun', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  style={{
                    borderColor: settings.terminal.clearOnRun ? theme.accent : theme.borderColor,
                    backgroundColor: settings.terminal.clearOnRun ? theme.accent : 'transparent'
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                >
                  {settings.terminal.clearOnRun && (
                    <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Auto-Clear on Execution</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Wipes historical logs when a script executes</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                <input
                  type="checkbox"
                  checked={settings.terminal.showTimestamp}
                  onChange={(e) => handleUpdate('terminal', 'showTimestamp', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  style={{
                    borderColor: settings.terminal.showTimestamp ? theme.accent : theme.borderColor,
                    backgroundColor: settings.terminal.showTimestamp ? theme.accent : 'transparent'
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                >
                  {settings.terminal.showTimestamp && (
                    <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Enable Timestamp Prefixes</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Displays date & elapsed run times of logs</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                <input
                  type="checkbox"
                  checked={settings.terminal.bellSound}
                  onChange={(e) => handleUpdate('terminal', 'bellSound', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  style={{
                    borderColor: settings.terminal.bellSound ? theme.accent : theme.borderColor,
                    backgroundColor: settings.terminal.bellSound ? theme.accent : 'transparent'
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                >
                  {settings.terminal.bellSound && (
                    <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Audio Bell System</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Produces diagnostic beeps on execution errors</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: GIT SYNC */}
        {activeTab === 'gitsync' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: theme.borderColor }}>
              <Github size={15} style={{ color: theme.accent }} />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                GitHub Core Sync Configuration
              </h3>
            </div>

            <div className="bg-neutral-900/35 border border-zinc-900 rounded-xl p-4 flex items-start space-x-3">
              <Code size={16} className="text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-400 font-mono leading-relaxed uppercase">
                Active source branches sync with standard GitHub web endpoints. Enabling sync triggers direct terminal cache push lines whenever changes are saved or manual sweep is fired.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Target Repository URL</label>
                <input
                  type="text"
                  value={settings.gitSync.repositoryUrl}
                  onChange={(e) => handleUpdate('gitSync', 'repositoryUrl', e.target.value)}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Target Branch</label>
                  <input
                    type="text"
                    value={settings.gitSync.syncBranch}
                    onChange={(e) => handleUpdate('gitSync', 'syncBranch', e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                    placeholder="main"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Default Commit Template</label>
                  <input
                    type="text"
                    value={settings.gitSync.commitMessage}
                    onChange={(e) => handleUpdate('gitSync', 'commitMessage', e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                    placeholder="wip: update scripts"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>GitHub Personal Access Token (PAT)</label>
                  <span className="text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full" style={{ 
                    backgroundColor: settings.gitSync.accessToken ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: settings.gitSync.accessToken ? '#10b981' : '#ef4444'
                  }}>
                    {settings.gitSync.accessToken ? 'Authenticated via Token' : 'OAuth Pending'}
                  </span>
                </div>
                <input
                  type="password"
                  value={settings.gitSync.accessToken || ''}
                  onChange={(e) => handleUpdate('gitSync', 'accessToken', e.target.value)}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                  placeholder="ghp_************************************"
                />
              </div>

              <div className="pt-4 border-t" style={{ borderColor: theme.borderColor }}>
                <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                  <input
                    type="checkbox"
                    checked={settings.gitSync.enabled}
                    onChange={(e) => handleUpdate('gitSync', 'enabled', e.target.checked)}
                    className="sr-only"
                  />
                  <div 
                    style={{
                      borderColor: settings.gitSync.enabled ? theme.accent : theme.borderColor,
                      backgroundColor: settings.gitSync.enabled ? theme.accent : 'transparent'
                    }}
                    className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                  >
                    {settings.gitSync.enabled && (
                      <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Enable Auto Git Tracking</span>
                    <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Logs code sync checkpoints on Ctrl+S keystrokes</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between border-t" style={{ borderColor: theme.borderColor }}>
                <div className="text-left">
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Manual Synchronization Sweep</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Compile memory workspace and force sync commit-push references immediately</span>
                </div>
                <button
                  type="button"
                  onClick={onTriggerGitSync}
                  style={{ backgroundColor: `${theme.accent}1c`, color: theme.accent, borderColor: `${theme.accent}33` }}
                  className="px-4 py-1.5 border rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition cursor-pointer"
                >
                  Sync & Push Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LUA/U SYNTAX */}
        {activeTab === 'luau' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.borderColor }}>
               <div className="flex items-center space-x-2">
                <Cpu size={15} style={{ color: theme.accent }} />
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                  Lua/u syntax Highlighter
                </h3>
              </div>
            </div>

            {/* Select block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {syntaxes.map((syn) => {
                const isActive = settings.syntax.engineId === syn.id;
                return (
                  <button
                    key={syn.id}
                    onClick={() => handleUpdate('syntax', 'engineId', syn.id)}
                    className="p-4 rounded-xl text-left border flex flex-col justify-between transition cursor-pointer hover:opacity-95"
                    style={{
                      borderColor: isActive ? theme.accent : theme.borderColor,
                      backgroundColor: isActive ? `${theme.accent}0d` : 'transparent'
                    }}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs font-bold font-mono uppercase" style={{ color: theme.textMain }}>{syn.name}</span>
                      {isActive && (
                        <span 
                          className="text-[8px] px-1.5 py-0.5 rounded font-mono font-extrabold"
                          style={{ backgroundColor: theme.accent, color: theme.isLight ? '#ffffff' : '#000000' }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[9px] text-zinc-550 mt-1 uppercase leading-relaxed">
                      Theme mappings: {syn.keywords.length} keywords, {syn.functions.length} functions registered.
                    </p>

                    <div className="mt-3 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-zinc-800" style={{ backgroundColor: syn.colors.keywords }} title="Keywords style" />
                      <span className="w-2.5 h-2.5 rounded-full border border-zinc-800" style={{ backgroundColor: syn.colors.functions }} title="Globals style" />
                      <span className="w-2.5 h-2.5 rounded-full border border-zinc-800" style={{ backgroundColor: syn.colors.strings }} title="Strings style" />
                      <span className="w-2.5 h-2.5 rounded-full border border-zinc-800" style={{ backgroundColor: syn.colors.comments }} title="Comments style" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 5: THEME / SKIN */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: theme.borderColor }}>
              <Paintbrush size={15} style={{ color: theme.accent }} />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                Appearance Studio Skins
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themes.map((t) => {
                const isActive = settings.appearance.themeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSetTheme(t.id)}
                    className="p-4 rounded-xl text-left border flex items-center justify-between transition cursor-pointer hover:opacity-95"
                    style={{
                      borderColor: isActive ? theme.accent : theme.borderColor,
                      backgroundColor: isActive ? `${theme.accent}0d` : 'transparent'
                    }}
                  >
                    <div>
                      <div className="text-xs font-bold font-mono uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
                        <span>{t.name}</span>
                        {isActive && (
                          <span 
                            className="text-[8px] px-1.5 py-0.5 rounded font-mono font-extrabold tracking-widest"
                            style={{ backgroundColor: theme.accent, color: theme.isLight ? '#ffffff' : '#000000' }}
                          >
                            RUNNING
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] block mt-1" style={{ color: theme.textMuted }}>
                        Accent hex mapping: {t.accent}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <div style={{ backgroundColor: t.accent }} className="w-4 h-4 rounded-full border border-zinc-800" />
                      <div style={{ backgroundColor: t.sidebarBg }} className="w-4 h-4 rounded-full border border-zinc-800" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t text-left" style={{ borderColor: theme.borderColor }}>
              <div className="space-y-1.5 max-w-sm text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Glossy blur effect</label>
                <select
                  value={settings.appearance.blurIntensity}
                  onChange={(e) => handleUpdate('appearance', 'blurIntensity', e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="none">Flat Solids (Unblurred)</option>
                  <option value="low">Subtle Glassmorphism (Low)</option>
                  <option value="medium">Medium frosting</option>
                  <option value="high">Epic Frosted Screen (High)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: DEVELOPER PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: theme.borderColor }}>
              <User size={15} style={{ color: theme.accent }} />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                Developer Identity Configuration
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-4">
              <div className="relative">
                <img 
                  src={settings.account.avatarUrl} 
                  alt="pfp" 
                  className="w-16 h-16 rounded-2xl object-cover border border-zinc-850" 
                />
              </div>

              <div className="space-y-1.5 flex-1 text-center sm:text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Avatar Picture URL</label>
                <input
                  type="text"
                  value={settings.account.avatarUrl}
                  onChange={(e) => handleUpdate('account', 'avatarUrl', e.target.value)}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Architect Name</label>
                  <input
                    type="text"
                    value={settings.account.username}
                    onChange={(e) => {
                      handleUpdate('account', 'username', e.target.value);
                      localStorage.setItem('user_onboarded_name', e.target.value);
                    }}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Developer Title / Role</label>
                  <input
                    type="text"
                    value={settings.account.badge}
                    onChange={(e) => handleUpdate('account', 'badge', e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Biographical Summary</label>
                <textarea
                  rows={2}
                  value={settings.account.bio}
                  onChange={(e) => handleUpdate('account', 'bio', e.target.value)}
                  className={`w-full border rounded-xl py-2 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: KEYBINDS */}
        {activeTab === 'keybind' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: theme.borderColor }}>
              <Sliders size={15} style={{ color: theme.accent }} />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                Keyboard Shortcut Settings
              </h3>
            </div>

            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              Customize hotkeys to invoke the command palette and run code-transform functions instantly inside the editor workspace. Click a field to record a new keybind.
            </p>

            <div className="space-y-4 pt-2">
              {[
                {
                  id: 'toggleCommandPalette',
                  label: 'Toggle Command Palette',
                  desc: 'Opens/closes the universal command menu and file workspace locator',
                  default: 'Ctrl+P'
                },
                {
                  id: 'autoFixSyntax',
                  label: 'Auto-Fix Luau Syntax',
                  desc: 'Corrects unclosed tags, strings, brackets, and block endings in active script',
                  default: 'Ctrl+Shift+F'
                },
                {
                  id: 'obfuscateScript',
                  label: 'Obfuscate Active Script',
                  desc: 'Applies control flow flattening and XOR AST protections to script',
                  default: 'Ctrl+Shift+O'
                },
                {
                  id: 'deobfuscateScript',
                  label: 'Deobfuscate Active Script',
                  desc: 'Extracts VM bytecode and restores the closest original Lua representation',
                  default: 'Ctrl+Shift+D'
                }
              ].map((item) => {
                const currentBinds = settings.keybinds || {
                  toggleCommandPalette: 'Ctrl+P',
                  autoFixSyntax: 'Ctrl+Shift+F',
                  obfuscateScript: 'Ctrl+Shift+O',
                  deobfuscateScript: 'Ctrl+Shift+D'
                };
                const value = currentBinds[item.id as keyof typeof currentBinds] || item.default;
                const isRecording = recordingField === item.id;

                return (
                  <div 
                    key={item.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4"
                    style={{ borderColor: theme.borderColor }}
                  >
                    <div className="text-left space-y-0.5">
                      <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>
                        {item.label}
                      </span>
                      <span className="text-[9px] block leading-relaxed" style={{ color: theme.textMuted }}>
                        {item.desc}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => startRecording(item.id)}
                        style={{
                          borderColor: isRecording ? theme.accent : theme.borderColor,
                          backgroundColor: isRecording ? `${theme.accent}15` : 'transparent',
                          color: isRecording ? theme.accent : theme.textMain
                        }}
                        className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl border hover:opacity-90 transition active:scale-95 cursor-pointer flex items-center space-x-2 min-w-[120px] justify-center ${
                          isRecording ? 'animate-pulse' : ''
                        }`}
                      >
                        <span>{isRecording ? 'Press Keys...' : value}</span>
                      </button>

                      {!isRecording && (
                        <button
                          onClick={() => {
                            setSettings(prev => {
                              const updated = {
                                ...prev,
                                keybinds: {
                                  ...(prev.keybinds || {}),
                                  [item.id]: item.default
                                }
                              };
                              localStorage.setItem('incognito_settings', JSON.stringify(updated));
                              return updated;
                            });
                            triggerToast(`Reset ${item.label} to default`, 'success');
                          }}
                          className="px-2 py-2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition"
                          title="Reset to default"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'experimental' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b pb-3" style={{ borderColor: theme.borderColor }}>
              <Sparkles size={15} style={{ color: theme.accent }} />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                Experimental Sandbox Features
              </h3>
            </div>

            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
              These are developer features that can be toggled safely. Toggling these features will update active view structures in real-time.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <label className="flex items-center space-x-3 cursor-pointer border p-4 rounded-xl transition duration-150" 
                     style={{ 
                       borderColor: settings.experimental?.terminalEnabled ? theme.accent : theme.borderColor,
                       backgroundColor: settings.experimental?.terminalEnabled ? `${theme.accent}0d` : 'transparent'
                     }}>
                <input
                  type="checkbox"
                  checked={!!settings.experimental?.terminalEnabled}
                  onChange={(e) => {
                    setSettings((prev) => {
                      const updated = {
                        ...prev,
                        experimental: {
                          ...prev.experimental,
                          terminalEnabled: e.target.checked
                        }
                      };
                      localStorage.setItem('incognito_settings', JSON.stringify(updated));
                      return updated;
                    });
                  }}
                  className="sr-only"
                />
                <div 
                  style={{
                    borderColor: !!settings.experimental?.terminalEnabled ? theme.accent : theme.borderColor,
                    backgroundColor: !!settings.experimental?.terminalEnabled ? theme.accent : 'transparent'
                  }}
                  className="w-4 h-4 rounded border flex items-center justify-center transition shrink-0"
                >
                  {!!settings.experimental?.terminalEnabled && (
                    <Check size={10} strokeWidth={3} style={{ color: theme.isLight ? '#ffffff' : '#000000' }} />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Enable Terminal Console</span>
                  <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Enables the compiler console & standard terminal input/output pane</span>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: theme.borderColor }}>
              <h4 className="text-[10px] font-mono uppercase tracking-widest font-bold mb-1.5 text-left text-red-500 flex items-center space-x-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>Danger Zone</span>
              </h4>
              <p className="text-[10px] text-zinc-500 font-mono text-left leading-relaxed mb-3.5">
                Permanently deletes all scripts, customized syntax settings, appearance profiles, active files, and telemetry state. Restarts application at zero.
              </p>
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("WARNING: This will wipe ALL of your stored files, custom profiles, settings, and reload the application from scratch. Are you absolutely sure you want to proceed?")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-4 py-2 rounded-xl border font-mono text-[10px] font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30 transition duration-150 active:scale-95 cursor-pointer"
                >
                  Clear Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4.5 py-3 rounded-2xl border shadow-2xl bg-zinc-900 border-zinc-800 text-xs font-mono transition-all duration-300">
          <span className={`w-2 h-2 rounded-full inline-block animate-pulse shrink-0 ${toast.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
          <span className="text-zinc-200 font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
