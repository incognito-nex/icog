import React, { useState } from 'react';
import { 
  FileCode, Search, Star, SortAsc, Eye, Play, ToggleLeft, ArrowUpDown, 
  Trash2, Plus, Edit, Download, StarOff, Calendar, Scale, ShieldAlert
} from 'lucide-react';
import { FileNode, AppTheme, UserSettings } from '../types';

interface ScriptsProps {
  files: FileNode[];
  onOpenFileInEditor: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onCreateNewFile: (name: string, type: 'file' | 'folder', content?: string) => void;
  onRunScript: (fileId: string) => void;
  theme: AppTheme;
  settings: UserSettings;
  setActiveSection: (sec: string) => void;
}

export default function ScriptsView({
  files,
  onOpenFileInEditor,
  onToggleFavorite,
  onDeleteFile,
  onCreateNewFile,
  onRunScript,
  theme,
  settings,
  setActiveSection,
}: ScriptsProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Luau files only
  const scriptFiles = files.filter(f => f.type === 'file');

  // Derive static tags to mimic complex script tagging
  const getSimulatedTags = (fileName: string): string[] => {
    const fLower = fileName.toLowerCase();
    if (fLower.includes('chassis') || fLower.includes('suspension') || fLower.includes('porsche')) {
      return ['Physics', 'Motorsports', 'Utilities'];
    }
    if (fLower.includes('cheat') || fLower.includes('anti') || fLower.includes('secure')) {
      return ['Security', 'Server', 'Admin'];
    }
    if (fLower.includes('tween') || fLower.includes('gui') || fLower.includes('ui')) {
      return ['Interface', 'Animation', 'Client'];
    }
    return ['Virtual', 'Module'];
  };

  const handleCreateScript = () => {
    const name = prompt('Enter your script name (e.g., RagdollDismount.luau):');
    if (!name) return;
    
    // add ext if missing
    const finalName = name.endsWith('.luau') ? name : `${name}.luau`;
    const defaultText = `--!strict\n-- Auto-constructed script file: ${finalName}\nprint("Booting active workspace diagnostics...")\n`;
    onCreateNewFile(finalName, 'file', defaultText);
  };

  // Filter & Sort
  const filteredScripts = scriptFiles
    .filter((file) => {
      const matchesSearch = 
        file.name.toLowerCase().includes(search.toLowerCase()) || 
        (file.content && file.content.toLowerCase().includes(search.toLowerCase()));
      const matchesFavorite = showFavoritesOnly ? file.isFavorite : true;
      
      if (selectedTag === 'all') return matchesSearch && matchesFavorite;
      const tags = getSimulatedTags(file.name);
      const matchesTag = tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());
      
      return matchesSearch && matchesFavorite && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'size') {
        return (b.size || 0) - (a.size || 0);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const availableTags = ['all', 'Physics', 'Motorsports', 'Security', 'Server', 'Interface', 'Animation', 'Virtual'];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 font-sans">
      
      {/* Title bar row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4 border-b border-zinc-850">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
            Workspace Script Manager
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Publish, edit, and launch optimized server/client Luau executable frames
          </p>
        </div>

        <button
          onClick={handleCreateScript}
          style={{ backgroundColor: theme.accent }}
          className="flex items-center space-x-1.5 text-xs text-white font-mono px-3.5 py-2 rounded-lg font-bold shadow-md hover:opacity-90 active:scale-95 transition"
        >
          <Plus size={14} />
          <span>New Luau Frame</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-zinc-950/40 p-3 rounded-lg border border-zinc-900">
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search script content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#14151b] border border-zinc-800 rounded-md py-1.5 px-9 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Tags quick links */}
        <div className="flex flex-wrap gap-1.5 py-1 justify-center md:justify-start">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              style={{
                color: selectedTag === tag ? theme.textMain : theme.textMuted,
                borderColor: selectedTag === tag ? theme.accent : 'transparent',
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-mono leading-none border uppercase transition-all ${
                selectedTag === tag 
                  ? 'bg-zinc-900 border font-semibold' 
                  : 'hover:bg-zinc-900/40 text-zinc-500'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {/* Sorting */}
          <div className="flex items-center space-x-1 bg-[#14151b] border border-zinc-800 p-1 rounded-md shrink-0">
            <button
              onClick={() => setSortBy('name')}
              className={`p-1 px-2 text-[9px] font-mono rounded ${sortBy === 'name' ? 'bg-[#ee3c22] text-white' : 'text-zinc-400'}`}
              title="Sort by Name"
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`p-1 px-2 text-[9px] font-mono rounded ${sortBy === 'date' ? 'bg-[#ee3c22] text-white' : 'text-zinc-400'}`}
              title="Sort by Date"
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('size')}
              className={`p-1 px-2 text-[9px] font-mono rounded ${sortBy === 'size' ? 'bg-[#ee3c22] text-white' : 'text-zinc-400'}`}
              title="Sort by Size"
            >
              Size
            </button>
          </div>

          {/* Toggle Favorites */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{
              borderColor: showFavoritesOnly ? theme.accent : 'transparent',
              color: showFavoritesOnly ? theme.accent : theme.textMuted
            }}
            className={`p-1.5 px-3 rounded-md bg-[#14151b] border border-zinc-800 text-[10px] uppercase font-mono flex items-center space-x-1.5 hover:border-zinc-700 transition`}
          >
            <Star size={11} className={showFavoritesOnly ? "fill-current" : ""} />
            <span>Favs</span>
          </button>
        </div>
      </div>

      {/* Grid cards */}
      {filteredScripts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 bg-zinc-950/20 rounded-xl">
          <FileCode size={36} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-xs text-zinc-500 font-mono">No active executable script nodes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredScripts.map((file) => {
            const tags = getSimulatedTags(file.name);
            return (
              <div
                key={file.id}
                className="group relative bg-[#171920]/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition duration-300 flex flex-col justify-between"
              >
                {/* Accent glow on top */}
                <div 
                  style={{ backgroundColor: file.isFavorite ? '#f59e0b' : theme.accent }}
                  className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition duration-300 rounded-t-xl"
                />

                {/* Top Metas */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileCode size={20} style={{ color: theme.accent }} className="shrink-0" />
                      <div className="text-left">
                        <h3 className="text-xs font-bold font-mono text-zinc-100 group-hover:text-white transition truncate max-w-[150px]">
                          {file.name}
                        </h3>
                        <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider block mt-0.5">
                          LUAU CODE CELL
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(file.id)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-yellow-500 transition"
                      title={file.isFavorite ? "Unfavorite" : "Favorite"}
                    >
                      <Star size={14} className={file.isFavorite ? "text-yellow-500 fill-yellow-500" : ""} />
                    </button>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[8px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-zinc-900/60 text-zinc-400 border border-zinc-800/80 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Character stats count */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-850 text-[10px] font-mono text-zinc-400 bg-zinc-950/20 p-2 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Scale size={11} className="text-zinc-600" />
                      <span>Size: {file.size} bytes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={11} className="text-zinc-600" />
                      <span className="truncate">Mod: {new Date(file.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between">
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition"
                    title="Delete permanently"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onOpenFileInEditor(file.id)}
                      className="px-2.5 py-1 text-[10px] font-mono rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition font-semibold"
                    >
                      Edit Code
                    </button>

                    <button
                      onClick={() => {
                        onRunScript(file.id);
                        // Show visual toast notification or simple alert
                        onOpenFileInEditor(file.id);
                        setActiveSection('editor');
                      }}
                      style={{ backgroundColor: `${theme.accent}1c`, color: theme.accent, borderColor: `${theme.accent}40` }}
                      className="px-2.5 py-1 text-[10px] font-mono rounded border hover:opacity-90 font-bold transition flex items-center space-x-1"
                    >
                      <Play size={10} className="fill-current" />
                      <span>Execute</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
