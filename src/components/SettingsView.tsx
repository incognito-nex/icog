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
  initialTab?: 'editor' | 'terminal' | 'gitsync' | 'luau' | 'appearance' | 'profile';
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
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal' | 'gitsync' | 'luau' | 'appearance' | 'profile'>(initialTab || 'editor');

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
          alert('Custom syntax engines loaded successfully.');
        } else {
          alert('Invalid format. Must be an array of syntax engine specifications.');
        }
      } catch (err) {
        alert('Fail to parse syntax file.');
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
      <div className="flex border-b overflow-x-auto shrink-0 select-none no-scrollbar" style={{ borderColor: theme.borderColor }}>
        {(['editor', 'terminal', 'gitsync', 'luau', 'appearance', 'profile'] as const).map((tab) => {
          const tabLabels: Record<string, string> = {
            editor: 'Editor Dev',
            terminal: 'Terminal Settings',
            gitsync: 'Git Sync',
            luau: 'Luau Engines',
            appearance: 'Skin/Themes',
            profile: 'Profile'
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4 shrink-0"
                />
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
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4 shrink-0"
                />
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
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4 shrink-0"
                />
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
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4 shrink-0"
                />
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
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4 shrink-0"
                />
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
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4 shrink-0"
                />
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
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4 shrink-0"
                />
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
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4 shrink-0"
                />
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
                GitHub Core Sync Simulation
              </h3>
            </div>

            <div className="bg-neutral-900/35 border border-zinc-900 rounded-xl p-4 flex items-start space-x-3">
              <Code size={16} className="text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-400 font-mono leading-relaxed uppercase">
                Active source branches can sync with simulated standard web endpoints. Enabling sync triggers direct terminal cache push lines whenever changes are saved.
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

              <div className="pt-4 border-t" style={{ borderColor: theme.borderColor }}>
                <label className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl" style={{ borderColor: theme.borderColor }}>
                  <input
                    type="checkbox"
                    checked={settings.gitSync.enabled}
                    onChange={(e) => handleUpdate('gitSync', 'enabled', e.target.checked)}
                    style={{ accentColor: theme.accent }}
                    className="rounded w-4 h-4 shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-bold font-mono block" style={{ color: theme.textMain }}>Enable Auto Git Tracking</span>
                    <span className="text-[9px] block text-left" style={{ color: theme.textMuted }}>Logs code sync checkpoints on Ctrl+S keystrokes</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LUAU ENGINE */}
        {activeTab === 'luau' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.borderColor }}>
              <div className="flex items-center space-x-2">
                <Cpu size={15} style={{ color: theme.accent }} />
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase" style={{ color: theme.textMain }}>
                  Luau Highlight Syntax Engines
                </h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportSyntax}
                  className="flex items-center space-x-1 px-2.5 py-1 text-[9px] rounded-lg border font-bold font-mono hover:opacity-80 transition uppercase"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }}
                >
                  <Download size={10} />
                  <span>Export JSON</span>
                </button>

                <label 
                  className="flex items-center space-x-1 px-2.5 py-1 text-[9px] rounded-lg border font-bold font-mono hover:opacity-80 transition uppercase cursor-pointer"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }}
                >
                  <Upload size={10} />
                  <span>Import</span>
                  <input type="file" accept=".json" onChange={handleImportSyntax} className="hidden" />
                </label>
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
                          className="text-[8px] px-1.5 py-0.5 rounded font-mono font-extrabold text-[#ffffff]"
                          style={{ backgroundColor: theme.accent }}
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
                            className="text-[8px] px-1.5 py-0.5 rounded font-mono font-extrabold tracking-widest text-[#ffffff]"
                            style={{ backgroundColor: theme.accent }}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
              <div className="space-y-1.5 text-left">
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

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-widest block font-bold" style={{ color: theme.textMuted }}>Entry Transition Speed</label>
                <select
                  value={settings.appearance.animationsSpeed}
                  onChange={(e) => handleUpdate('appearance', 'animationsSpeed', e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="slow">Cinema Slow (400ms)</option>
                  <option value="normal">Standard Dev (200ms)</option>
                  <option value="fast">Zero Lag Snappy (50ms)</option>
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
      </div>
    </div>
  );
}
