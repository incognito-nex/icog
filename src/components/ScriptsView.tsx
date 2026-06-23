import React, { useState } from 'react';
import { 
  FileCode, Search, Star, Play, Trash2, Plus, Calendar, Scale
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

  // Filter Luau files only
  const scriptFiles = files.filter(f => f.type === 'file');

  const handleCreateScript = () => {
    setActiveSection('editor');
  };

  // Filter & Sort
  const filteredScripts = scriptFiles
    .filter((file) => {
      const matchesSearch = 
        file.name.toLowerCase().includes(search.toLowerCase()) || 
        (file.content && file.content.toLowerCase().includes(search.toLowerCase()));
      const matchesFavorite = showFavoritesOnly ? file.isFavorite : true;
      return matchesSearch && matchesFavorite;
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

  const inputBg = theme.isLight 
    ? 'bg-zinc-100 text-zinc-900 border-zinc-200 focus:border-zinc-400 focus:bg-white' 
    : 'bg-zinc-900 text-zinc-100 border-zinc-850 focus:border-zinc-700';

  const controlBarBg = theme.isLight ? 'bg-zinc-50' : 'bg-black/30';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 font-sans text-left">
      
      {/* Title bar row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4 border-b" style={{ borderColor: theme.borderColor }}>
        <div>
          <h1 className="text-lg font-bold font-mono tracking-tight uppercase" style={{ color: theme.textMain }}>
            Workspace Script Manager
          </h1>
          <p className="text-xs font-mono mt-1" style={{ color: theme.textMuted }}>
            Create, view, and execute Luau files in the integrated runtime environment.
          </p>
        </div>

        <button
          onClick={handleCreateScript}
          style={{ backgroundColor: theme.accent }}
          className="flex items-center space-x-1.5 text-xs text-white font-mono px-3.5 py-2.5 rounded-xl font-bold shadow-xs hover:opacity-90 active:scale-98 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>New Luau File</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: controlBarBg, borderColor: theme.borderColor }}>
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: theme.textMuted }} />
          <input
            type="text"
            placeholder="Search script content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-xl py-2 px-9 text-xs font-mono placeholder-zinc-400 focus:outline-none transition ${inputBg}`}
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {/* Sorting */}
          <div className="flex items-center space-x-1 border p-1 rounded-xl shrink-0" style={{ borderColor: theme.borderColor, backgroundColor: theme.isLight ? '#ffffff' : '#0a0a0c' }}>
            <button
              onClick={() => setSortBy('name')}
              className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition uppercase ${
                sortBy === 'name' 
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Sort by Name"
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition uppercase ${
                sortBy === 'date' 
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Sort by Date"
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('size')}
              className={`p-1.5 px-3 text-[10px] font-mono rounded-lg font-bold transition uppercase ${
                sortBy === 'size' 
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Sort by Size"
            >
              Size
            </button>
          </div>

          {/* Toggle Favorites */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{
              borderColor: showFavoritesOnly ? theme.accent : theme.borderColor,
              color: showFavoritesOnly ? theme.accent : theme.textMuted,
              backgroundColor: showFavoritesOnly ? `${theme.accent}0d` : (theme.isLight ? '#ffffff' : '#0a0a0c')
            }}
            className={`p-1.5 px-3.5 rounded-xl border text-[10px] uppercase font-mono font-bold flex items-center space-x-1.5 hover:opacity-90 transition cursor-pointer`}
          >
            <Star size={11} className={showFavoritesOnly ? "fill-current" : ""} />
            <span>Favs</span>
          </button>
        </div>
      </div>

      {/* Grid cards */}
      {filteredScripts.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-xl" style={{ borderColor: theme.borderColor, backgroundColor: theme.isLight ? '#fcfcfc' : 'rgba(0,0,0,0.1)' }}>
          <FileCode size={36} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
          <p className="text-xs font-mono" style={{ color: theme.textMuted }}>No matching Luau scripts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScripts.map((file) => {
            return (
              <div
                key={file.id}
                className="group relative border rounded-xl p-5 transition duration-200 flex flex-col justify-between"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
              >
                {/* Accent glow on top */}
                <div 
                  style={{ backgroundColor: file.isFavorite ? '#f59e0b' : theme.accent }}
                  className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition duration-200 rounded-t-xl"
                />

                {/* Top Metas */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-zinc-500/10" style={{ color: theme.accent }}>
                        <FileCode size={18} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xs font-bold font-mono truncate max-w-[170px]" style={{ color: theme.textMain }}>
                          {file.name}
                        </h3>
                        <span className="text-[9px] font-mono uppercase tracking-wider block mt-0.5" style={{ color: theme.textMuted }}>
                          LUAU SOURCE FILE
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(file.id)}
                      className="p-1 rounded-lg transition"
                      style={{ color: file.isFavorite ? '#f59e0b' : theme.textMuted }}
                      title={file.isFavorite ? "Unfavorite" : "Favorite"}
                    >
                      <Star size={14} className={file.isFavorite ? "fill-current" : ""} />
                    </button>
                  </div>

                  {/* Character stats count */}
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono p-2.5 rounded-lg border" style={{ backgroundColor: theme.isLight ? '#fbfbfb' : '#07080a', borderColor: theme.borderColor, color: theme.textMuted }}>
                    <div className="flex items-center space-x-1 shrink-0">
                      <Scale size={11} className="opacity-60" />
                      <span>{file.size} bytes</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <Calendar size={11} className="opacity-60" />
                      <span className="truncate">{new Date(file.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="mt-5 pt-3.5 border-t flex items-center justify-between" style={{ borderColor: theme.borderColor }}>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                    title="Delete file permanently"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onOpenFileInEditor(file.id)}
                      className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border font-bold transition cursor-pointer"
                      style={{ backgroundColor: theme.isLight ? '#ffffff' : 'transparent', borderColor: theme.borderColor, color: theme.textMain }}
                    >
                      Edit Code
                    </button>

                    <button
                      onClick={() => {
                        onRunScript(file.id);
                        onOpenFileInEditor(file.id);
                        setActiveSection('editor');
                      }}
                      style={{ backgroundColor: `${theme.accent}1c`, color: theme.accent, borderColor: `${theme.accent}40` }}
                      className="px-2.5 py-1.5 text-[10px] font-mono rounded-lg border font-bold hover:opacity-90 transition flex items-center space-x-1 cursor-pointer"
                    >
                      <Play size={10} className="fill-current" />
                      <span>Run</span>
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
