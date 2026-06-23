import React, { useState } from 'react';
import { 
  Sliders, User, Key, Download, Upload, Trash2, Plus, RefreshCw, 
  Settings2, Palette, ShieldCheck, Paintbrush, BookOpen, Layers
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
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedSyntaxId, setSelectedSyntaxId] = useState<string>(settings.syntax.engineId);
  
  // Syntax builder bindings
  const currentSyntaxItem = syntaxes.find(s => s.id === selectedSyntaxId) || syntaxes[0];
  const [keywordInput, setKeywordInput] = useState('');
  const [functionInput, setFunctionInput] = useState('');

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

  const handleUpdateAppearance = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value
      }
    }));
  };

  // Syntax manager operations
  const handleCreateProfile = () => {
    const pName = newProfileName.trim() || 'Custom Mode v' + (syntaxes.length + 1);
    const newProfile: CustomSyntaxProfile = {
      id: 'custom-' + Date.now(),
      name: pName,
      keywords: [...currentSyntaxItem.keywords],
      functions: [...currentSyntaxItem.functions],
      colors: { ...currentSyntaxItem.colors }
    };
    setSyntaxes(prev => [...prev, newProfile]);
    setSelectedSyntaxId(newProfile.id);
    setSettings(prev => ({
      ...prev,
      syntax: { engineId: newProfile.id }
    }));
    setNewProfileName('');
    alert(`Syntax Profile "${pName}" successfully registered.`);
  };

  const handleDeleteProfile = (id: string) => {
    if (id === 'studio-classic') {
      alert('Cannot delete official standard system Luau profile.');
      return;
    }
    const filtered = syntaxes.filter(s => s.id !== id);
    setSyntaxes(filtered);
    const nextId = 'studio-classic';
    setSelectedSyntaxId(nextId);
    setSettings(prev => ({
      ...prev,
      syntax: { engineId: nextId }
    }));
    alert('Syntax Profile purged.');
  };

  const handleRenameProfile = (newName: string) => {
    if (selectedSyntaxId === 'studio-classic') return;
    setSyntaxes(prev => prev.map(s => {
      if (s.id === selectedSyntaxId) {
        return { ...s, name: newName };
      }
      return s;
    }));
  };

  const handleUpdateSyntaxColor = (colorKey: keyof CustomSyntaxProfile['colors'], colorVal: string) => {
    setSyntaxes(prev => prev.map(s => {
      if (s.id === selectedSyntaxId) {
        return {
          ...s,
          colors: {
            ...s.colors,
            [colorKey]: colorVal
          }
        };
      }
      return s;
    }));
  };

  const handleAddKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (!kw) return;
    if (currentSyntaxItem.keywords.includes(kw)) {
      alert('Keyword already registered in syntax list.');
      return;
    }
    setSyntaxes(prev => prev.map(s => {
      if (s.id === selectedSyntaxId) {
        return {
          ...s,
          keywords: [...s.keywords, kw]
        };
      }
      return s;
    }));
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setSyntaxes(prev => prev.map(s => {
      if (s.id === selectedSyntaxId) {
        return {
          ...s,
          keywords: s.keywords.filter(k => k !== kw)
        };
      }
      return s;
    }));
  };

  const handleAddFunction = () => {
    const fnName = functionInput.trim();
    if (!fnName) return;
    if (currentSyntaxItem.functions.includes(fnName)) {
      alert('Function name already registered.');
      return;
    }
    setSyntaxes(prev => prev.map(s => {
      if (s.id === selectedSyntaxId) {
        return {
          ...s,
          functions: [...s.functions, fnName]
        };
      }
      return s;
    }));
    setFunctionInput('');
  };

  const handleRemoveFunction = (fn: string) => {
    setSyntaxes(prev => prev.map(s => {
      if (s.id === selectedSyntaxId) {
        return {
          ...s,
          functions: s.functions.filter(f => f !== fn)
        };
      }
      return s;
    }));
  };

  const handleExportSyntax = () => {
    const dataStr = JSON.stringify(currentSyntaxItem, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSyntaxItem.name.toLowerCase().replace(/\s+/g, '_')}_syntax_profile.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSyntax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.name && parsed.colors) {
          const importedProfile: CustomSyntaxProfile = {
            id: 'custom-' + Date.now(),
            name: parsed.name + ' (Imported)',
            keywords: parsed.keywords || [],
            functions: parsed.functions || [],
            colors: parsed.colors
          };
          setSyntaxes(prev => [...prev, importedProfile]);
          setSelectedSyntaxId(importedProfile.id);
          setSettings(prev => ({
            ...prev,
            syntax: { engineId: importedProfile.id }
          }));
          alert('Custom raw Luau syntax rules successfully parsed.');
        } else {
          alert('Failed parsing: Missing syntax configurations.');
        }
      } catch (err) {
        alert('Corrupted JSON schema provided.');
      }
    };
    reader.readAsText(file);
  };

  const selectEngineProfile = (id: string) => {
    setSelectedSyntaxId(id);
    setSettings(prev => ({
      ...prev,
      syntax: { engineId: id }
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 font-sans">
      
      {/* Title */}
      <div className="pb-4 border-b border-zinc-850 text-left">
        <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase flex items-center space-x-2">
          <Settings2 className="text-[#ee3c22] w-5 h-5" />
          <span>Workspace Preferences</span>
        </h1>
        <p className="text-xs text-zinc-500 font-mono mt-1">
          Tune compiler triggers, dashboard layouts, custom syntax profiles, and physical telemetry
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-900 overflow-x-auto shrink-0 select-none">
        {(['editor', 'appearance', 'account', 'syntax'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              borderColor: activeTab === tab ? theme.accent : 'transparent',
              color: activeTab === tab ? theme.textMain : theme.textMuted
            }}
            className={`px-5 py-3 text-xs uppercase font-mono tracking-wider font-semibold border-b-2 hover:text-white transition whitespace-nowrap`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Forms */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 md:p-7 max-w-4xl text-left">
        
        {/* Editor Controls */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-zinc-300 tracking-wider uppercase flex items-center">
              <Sliders size={13} className="text-[#ee3c22] mr-2" />
              Monaco Editor Environment Configs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5Col">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Font Size</label>
                <input
                  type="number"
                  value={settings.editor.fontSize}
                  onChange={(e) => handleUpdateEditor('fontSize', parseInt(e.target.value) || 12)}
                  className="w-full bg-[#14151b] border border-zinc-800 rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Font Family</label>
                <select
                  value={settings.editor.fontFamily}
                  onChange={(e) => handleUpdateEditor('fontFamily', e.target.value)}
                  className="w-full bg-[#14151b] border border-[#2d3340] rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                >
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="ui-monospace">System Monospace</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Tab size</label>
                <input
                  type="number"
                  value={settings.editor.tabSize}
                  onChange={(e) => handleUpdateEditor('tabSize', parseInt(e.target.value) || 2)}
                  className="w-full bg-[#14151b] border border-[#2d3340] rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Word Wrap</label>
                <select
                  value={settings.editor.wordWrap}
                  onChange={(e) => handleUpdateEditor('wordWrap', e.target.value)}
                  className="w-full bg-[#14151b] border border-[#2d3340] rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                >
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>
            </div>

            {/* Checkbox triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
              <label className="flex items-center space-x-3 cursor-pointer bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={settings.editor.minimap}
                  onChange={(e) => handleUpdateEditor('minimap', e.target.checked)}
                  className="accent-[#ee3c22] rounded w-4 h-4"
                />
                <div>
                  <span className="text-xs font-semibold text-zinc-200 font-mono block">Render Sidebar Minimap</span>
                  <span className="text-[9px] text-zinc-500 font-mono">VS Code style scaling thumb map</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={settings.editor.autoSave}
                  onChange={(e) => handleUpdateEditor('autoSave', e.target.checked)}
                  className="accent-[#ee3c22] rounded w-4 h-4"
                />
                <div>
                  <span className="text-xs font-semibold text-zinc-200 font-mono block">Reactive Auto-Save</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Autosave code states into storage</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Appearance Colors Controls */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-zinc-300 tracking-wider uppercase flex items-center">
              <Paintbrush size={13} className="text-[#ee3c22] mr-2" />
              Chassis Skin Presets
            </h3>

            {/* Hot selection list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {themes.map((t) => {
                const isActive = settings.appearance.themeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSetTheme(t.id)}
                    className={`p-4 rounded-xl text-left border flex items-center justify-between transition ${
                      isActive 
                        ? 'bg-[#1b1e25] border-[#ee3c22] shadow-md shadow-[#ee3c22]/10' 
                        : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-mono text-zinc-200 uppercase flex items-center space-x-2">
                        <span>{t.name}</span>
                        {isActive && <span className="text-[8px] bg-[#ee3c22]/20 border border-[#ee3c22] text-[#ee3c22] px-1 py-0.2 rounded font-semibold tracking-wider">ACTIVE</span>}
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono block mt-1.5 uppercase">
                        Accent Decal: {t.accent}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <div style={{ backgroundColor: t.accent }} className="w-4.5 h-4.5 rounded-full border border-zinc-950" />
                      <div style={{ backgroundColor: t.sidebarBg }} className="w-4.5 h-4.5 rounded-full border border-zinc-950" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Blur adjustments */}
            <div className="pt-4 border-t border-zinc-900 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Dashboard Acrylic Blur</label>
                <select
                  value={settings.appearance.blurIntensity}
                  onChange={(e) => handleUpdateAppearance('blurIntensity', e.target.value)}
                  className="bg-[#14151b] border border-[#2d3340] rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none w-full sm:w-72 block"
                >
                  <option value="none">Disabled (High FPS)</option>
                  <option value="low">Low (Porsche Comfort)</option>
                  <option value="medium">Medium (Calibrated Glass)</option>
                  <option value="high">High (Turbo Frost)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Account Details */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold font-mono text-zinc-300 tracking-wider uppercase flex items-center">
              <User size={13} className="text-[#ee3c22] mr-2" />
              Pilot Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Developer Handle</label>
                <input
                  type="text"
                  value={settings.account.username}
                  onChange={(e) => handleUpdateAccount('username', e.target.value)}
                  className="w-full bg-[#14151b] border border-zinc-800 rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                  placeholder="Username"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Chassis Badge Rank</label>
                <select
                  value={settings.account.badge}
                  onChange={(e) => handleUpdateAccount('badge', e.target.value)}
                  className="w-full bg-[#14151b] border border-[#2d3340] rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                >
                  <option value="Lead Calibrator">Lead Calibrator</option>
                  <option value="GT3 RS Pilot">GT3 RS Pilot</option>
                  <option value="Luau Architect">Luau Architect</option>
                  <option value="Workspace Admin">Workspace Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Profile bio / credentials</label>
                <input
                  type="text"
                  value={settings.account.bio}
                  onChange={(e) => handleUpdateAccount('bio', e.target.value)}
                  className="w-full bg-[#14151b] border border-zinc-800 rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                  placeholder="Software chassis specs..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Avatar Decal URL</label>
                <input
                  type="text"
                  value={settings.account.avatarUrl}
                  onChange={(e) => handleUpdateAccount('avatarUrl', e.target.value)}
                  className="w-full bg-[#14151b] border border-zinc-800 rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Profile review card */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-xl flex items-center space-x-4">
              <img
                src={settings.account.avatarUrl}
                alt="preview"
                className="w-14 h-14 rounded-full border border-zinc-700 object-cover shrink-0"
              />
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-zinc-100 uppercase">{settings.account.username}</div>
                <div className="text-[9px] text-[#ee3c22] font-semibold mt-0.5 tracking-widest">{settings.account.badge.toUpperCase()}</div>
                <div className="text-[9px] text-zinc-500 mt-1">{settings.account.bio || 'Luau active system calibrator.'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Syntax profile manager builder panel */}
        {activeTab === 'syntax' && (
          <div className="space-y-6">
            
            {/* Header description */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-xs font-bold font-mono text-zinc-300 tracking-wider uppercase flex items-center">
                <BookOpen size={13} className="text-[#ee3c22] mr-2" />
                Luau Custom Tokenizer & Theme colors
              </h3>
              
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleExportSyntax}
                  className="flex items-center space-x-1 px-2.5 py-1 text-[9px] rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition uppercase font-semibold"
                >
                  <Download size={10} />
                  <span>Export</span>
                </button>

                <label className="flex items-center space-x-1 px-2.5 py-1 text-[9px] rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition uppercase font-semibold cursor-pointer">
                  <Upload size={10} />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSyntax}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Selector dropdown of active rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Active Token Rule-Engine</label>
                <div className="flex space-x-2">
                  <select
                    value={selectedSyntaxId}
                    onChange={(e) => selectEngineProfile(e.target.value)}
                    className="flex-1 bg-[#14151b] border border-[#2d3340] rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                  >
                    {syntaxes.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  
                  {selectedSyntaxId !== 'studio-classic' && (
                    <button
                      onClick={() => handleDeleteProfile(selectedSyntaxId)}
                      className="p-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition"
                      title="Purge custom rules code cell"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* New profile creator form */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">Clone Active into Custom Profile</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="E.g., Hyper Gloss Mode..."
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="flex-1 bg-[#14151b] border border-zinc-800 rounded-md py-1.5 px-3 text-xs font-mono text-zinc-200 focus:outline-none"
                  />
                  <button
                    onClick={handleCreateProfile}
                    className="px-3 rounded bg-[#ee3c22] text-white text-xs font-mono font-bold hover:opacity-90 active:scale-95 transition"
                  >
                    Clone
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time details color modifiers & keywords config */}
            <div className="pt-4 border-t border-zinc-900 space-y-5">
              
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400">
                  Profile Token Color Settings: {currentSyntaxItem.name}
                </h4>
                {selectedSyntaxId === 'studio-classic' && (
                  <span className="text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30 font-semibold tracking-wide uppercase font-mono">
                    System Level Read-Only
                  </span>
                )}
              </div>

              {/* Color Grid list */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.keys(currentSyntaxItem.colors).map((ckey) => {
                  const keyName = ckey as keyof CustomSyntaxProfile['colors'];
                  const colorVal = currentSyntaxItem.colors[keyName];
                  const disabled = selectedSyntaxId === 'studio-classic';
                  return (
                    <div key={ckey} className="p-2 bg-zinc-900/30 border border-zinc-850 rounded-lg flex items-center space-x-2">
                      <input
                        type="color"
                        value={colorVal}
                        disabled={disabled}
                        onChange={(e) => handleUpdateSyntaxColor(keyName, e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer shrink-0 disabled:opacity-40"
                      />
                      <div className="text-left font-mono">
                        <div className="text-[8px] text-zinc-500 uppercase tracking-widest">{ckey}</div>
                        <div className="text-[9px] text-zinc-300 font-bold uppercase">{colorVal}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Keywords and Custom Function dynamic registers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Keywords List Card */}
                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-bold block">Keywords Dictionary</span>
                  {selectedSyntaxId !== 'studio-classic' && (
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        placeholder="new_keyword..."
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 placeholder-zinc-700"
                      />
                      <button
                        onClick={handleAddKeyword}
                        className="px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold font-mono"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <div className="h-28 overflow-y-auto border border-zinc-850 bg-zinc-950/40 p-2 rounded flex flex-wrap gap-1 leading-normal align-middle">
                    {currentSyntaxItem.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-[#ee3c22]/10 border border-[#ee3c22]/20 text-[#ee3c22] flex items-center space-x-1"
                      >
                        <span>{kw}</span>
                        {selectedSyntaxId !== 'studio-classic' && (
                          <button 
                            onClick={() => handleRemoveKeyword(kw)}
                            className="hover:text-white font-bold ml-1 text-[8px]"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* API Functions List Card */}
                <div className="p-4 bg-zinc-900/20 border border-zinc-850 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-bold block">Functions & Globals</span>
                  {selectedSyntaxId !== 'studio-classic' && (
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        placeholder="new_global_API..."
                        value={functionInput}
                        onChange={(e) => setFunctionInput(e.target.value)}
                        className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-200 placeholder-zinc-700"
                      />
                      <button
                        onClick={handleAddFunction}
                        className="px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold font-mono"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <div className="h-28 overflow-y-auto border border-zinc-850 bg-zinc-950/40 p-2 rounded flex flex-wrap gap-1 leading-normal align-middle">
                    {currentSyntaxItem.functions.map((fn) => (
                      <span
                        key={fn}
                        className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-450 flex items-center space-x-1"
                      >
                        <span>{fn}</span>
                        {selectedSyntaxId !== 'studio-classic' && (
                          <button 
                            onClick={() => handleRemoveFunction(fn)}
                            className="hover:text-white font-bold ml-1 text-[8px]"
                          >
                            ×
                          </button>
                        )}
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
