import React, { useState } from 'react';
import { 
  Sliders, User, Download, Upload, Settings2, Paintbrush, BookOpen, Check
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
}

export default function SettingsView({
  settings,
  setSettings,
  syntaxes,
  setSyntaxes,
  themes,
  onSetTheme,
  theme,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'appearance' | 'account' | 'syntax'>('editor');

  const handleUpdateAccount = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      account: {
        ...prev.account,
        [field]: value
      }
    }));
  };

  const handleUpdateEditor = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      editor: {
        ...prev.editor,
        [field]: value
      }
    }));
  };

  // Syntax Export/Import
  const handleExportSyntax = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(syntaxes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "luau_syntax_profiles.json");
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
          alert('Syntax profiles successfully loaded.');
        } else {
          alert('Invalid file format. Must be an array of syntax profiles.');
        }
      } catch (err) {
        alert('Parse error. Verify JSON syntax.');
      }
    };
    fileReader.readAsText(filesList[0]);
  };

  // Input background styles computed from theme
  const inputBg = theme.isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-zinc-500' : 'bg-zinc-900 text-zinc-100 border-zinc-800 focus:border-zinc-700';

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 font-sans text-left">
      
      {/* Title */}
      <div className="pb-4 border-b text-left" style={{ borderColor: theme.borderColor }}>
        <h1 className="text-xl font-extrabold tracking-tight uppercase flex items-center space-x-2" style={{ color: theme.textMain }}>
          <Settings2 className="w-5 h-5" style={{ color: theme.accent }} />
          <span>Settings</span>
        </h1>
        <p className="text-xs mt-1 font-medium" style={{ color: theme.textMuted }}>
          Customize your workspace layout, appearance skins, and syntax definitions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto shrink-0 select-none" style={{ borderColor: theme.borderColor }}>
        {(['editor', 'appearance', 'account', 'syntax'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              borderColor: activeTab === tab ? theme.accent : 'transparent',
              color: activeTab === tab ? theme.textMain : theme.textMuted
            }}
            className="px-5 py-3 text-xs uppercase font-mono tracking-wider font-bold border-b-2 hover:opacity-80 transition whitespace-nowrap"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Forms */}
      <div 
        className="border rounded-2xl p-6 md:p-8 max-w-4xl shadow-xs" 
        style={{ 
          backgroundColor: theme.cardBg, 
          borderColor: theme.borderColor 
        }}
      >
        
        {/* Editor Controls */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
              <Sliders size={13} className="mr-2" style={{ color: theme.accent }} />
              Editor Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5/col">
                <label className="text-[10px] font-mono uppercase tracking-widest block" style={{ color: theme.textMuted }}>Font Size (px)</label>
                <input
                  type="number"
                  value={settings.editor.fontSize}
                  onChange={(e) => handleUpdateEditor('fontSize', parseInt(e.target.value) || 12)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono uppercase tracking-widest block" style={{ color: theme.textMuted }}>Font Family</label>
                <select
                  value={settings.editor.fontFamily}
                  onChange={(e) => handleUpdateEditor('fontFamily', e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="ui-monospace">System Monospace</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest block" style={{ color: theme.textMuted }}>Tab size</label>
                <input
                  type="number"
                  value={settings.editor.tabSize}
                  onChange={(e) => handleUpdateEditor('tabSize', parseInt(e.target.value) || 2)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest block" style={{ color: theme.textMuted }}>Word Wrap</label>
                <select
                  value={settings.editor.wordWrap}
                  onChange={(e) => handleUpdateEditor('wordWrap', e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                >
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>
            </div>

            {/* Checkbox triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t" style={{ borderColor: theme.borderColor }}>
              <label 
                className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl hover:opacity-90"
                style={{ borderColor: theme.borderColor, backgroundColor: theme.isLight ? '#fafafa' : '#121214' }}
              >
                <input
                  type="checkbox"
                  checked={settings.editor.minimap}
                  onChange={(e) => handleUpdateEditor('minimap', e.target.checked)}
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold font-mono block" style={{ color: theme.textMain }}>Minimap</span>
                  <span className="text-[9px]" style={{ color: theme.textMuted }}>Enable visual code minimap inside Editor</span>
                </div>
              </label>

              <label 
                className="flex items-center space-x-3 cursor-pointer border p-3 rounded-xl hover:opacity-90"
                style={{ borderColor: theme.borderColor, backgroundColor: theme.isLight ? '#fafafa' : '#121214' }}
              >
                <input
                  type="checkbox"
                  checked={settings.editor.autoSave}
                  onChange={(e) => handleUpdateEditor('autoSave', e.target.checked)}
                  style={{ accentColor: theme.accent }}
                  className="rounded w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold font-mono block" style={{ color: theme.textMain }}>Auto-Save</span>
                  <span className="text-[9px]" style={{ color: theme.textMuted }}>Persist file revisions automatically</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Appearance Colors Controls */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
              <Paintbrush size={13} className="mr-2" style={{ color: theme.accent }} />
              Theme Skin Preset
            </h3>

            {/* Hot selection list */}
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
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] block mt-1" style={{ color: theme.textMuted }}>
                        Accent Color: {t.accent}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <div style={{ backgroundColor: t.accent }} className="w-5 h-5 rounded-full border" />
                      <div style={{ backgroundColor: t.sidebarBg }} className="w-5 h-5 rounded-full border" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Account Details */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
              <User size={13} className="mr-2" style={{ color: theme.accent }} />
              Developer Profile
            </h3>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest block" style={{ color: theme.textMuted }}>Your Name</label>
                <input
                  type="text"
                  value={settings.account.username}
                  onChange={(e) => {
                    handleUpdateAccount('username', e.target.value);
                    localStorage.setItem('user_onboarded_name', e.target.value);
                  }}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest block" style={{ color: theme.textMuted }}>Bio / Profile Description</label>
                <input
                  type="text"
                  value={settings.account.bio}
                  onChange={(e) => handleUpdateAccount('bio', e.target.value)}
                  className={`w-full border rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                  placeholder="Development environment active..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Syntax profile manager builder panel */}
        {activeTab === 'syntax' && (
          <div className="space-y-6">
            
            {/* Header description */}
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: theme.borderColor }}>
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase flex items-center" style={{ color: theme.textMain }}>
                <BookOpen size={13} className="mr-2" style={{ color: theme.accent }} />
                Luau Syntax Highlighting Config
              </h3>
              
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleExportSyntax}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-[9px] rounded-lg border font-bold font-mono hover:opacity-80 transition uppercase"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }}
                >
                  <Download size={10} />
                  <span>Export JSON</span>
                </button>

                <label 
                  className="theme-btn flex items-center space-x-1.5 px-3 py-1.5 text-[9px] rounded-lg border font-bold font-mono hover:opacity-80 transition uppercase cursor-pointer"
                  style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor, color: theme.textMain }}
                >
                  <Upload size={10} />
                  <span>Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSyntax}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Standard specifications display (No cringe complex dictionary settings) */}
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider block font-bold" style={{ color: theme.textMuted }}>
                Active Rule-Set: Standard Luau Keywords & APIs
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Keywords Dictionary Card */}
                <div 
                  className="p-4 border rounded-xl space-y-3"
                  style={{ backgroundColor: theme.isLight ? '#fbfbfb' : '#0e0f11', borderColor: theme.borderColor }}
                >
                  <span className="text-[9px] font-mono uppercase tracking-wider font-bold block" style={{ color: theme.textMuted }}>
                    Luau Highlighted Keywords
                  </span>
                  <div className="max-h-36 overflow-y-auto p-2 border rounded-lg flex flex-wrap gap-1 bg-transparent" style={{ borderColor: theme.borderColor }}>
                    {syntaxes[0]?.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[9px] font-mono px-2 py-0.5 rounded border"
                        style={{ 
                          backgroundColor: `${theme.accent}0d`, 
                          borderColor: theme.borderColor,
                          color: theme.accent 
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* API Functions List Card */}
                <div 
                  className="p-4 border rounded-xl space-y-3"
                  style={{ backgroundColor: theme.isLight ? '#fbfbfb' : '#0e0f11', borderColor: theme.borderColor }}
                >
                  <span className="text-[9px] font-mono uppercase tracking-wider font-bold block" style={{ color: theme.textMuted }}>
                    Luau Globals & Functions
                  </span>
                  <div className="max-h-36 overflow-y-auto p-2 border rounded-lg flex flex-wrap gap-1 bg-transparent" style={{ borderColor: theme.borderColor }}>
                    {syntaxes[0]?.functions.map((fn) => (
                      <span
                        key={fn}
                        className="text-[9px] font-mono px-2 py-0.5 rounded border"
                        style={{ 
                          backgroundColor: `${theme.accent}0a`, 
                          borderColor: theme.borderColor,
                          color: theme.accent 
                        }}
                      >
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
