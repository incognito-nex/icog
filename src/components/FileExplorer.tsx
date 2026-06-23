import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, FilePlus, ChevronRight, ChevronDown, Folder, FolderOpen, FileCode, Play,
  MoreVertical, Edit, Trash2, Copy, CornerDownRight, Star, Heart, FileText, 
  ArrowRight, Lock, Code2, AlertTriangle, X, FileJson, FileTerminal, FileKey
} from 'lucide-react';
import { FileNode, AppTheme } from '../types';

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCreateNode: (name: string, type: 'file' | 'folder', parentId: string | null) => void;
  onRenameNode: (id: string, newName: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onMoveNode: (id: string, newParentId: string | null) => void;
  theme: AppTheme;
}

export default function FileExplorer({
  files,
  activeFileId,
  onSelectFile,
  onCreateNode,
  onRenameNode,
  onDeleteNode,
  onDuplicateNode,
  onToggleFavorite,
  onMoveNode,
  theme,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root-scripts': true,
    'root-modules': true,
  });

  // Floating Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    nodeType: 'file' | 'folder';
  } | null>(null);

  // Floating Empty Space Context Menu State
  const [emptySpaceMenu, setEmptySpaceMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Custom HUD Dialog Modal State (No generic browser prompts)
  const [activeModal, setActiveModal] = useState<'create_file' | 'create_folder' | 'rename' | 'delete' | 'move' | null>(null);
  const [modalNodeId, setModalNodeId] = useState<string | null>(null);
  const [modalParentId, setModalParentId] = useState<string | null>(null);
  const [modalInputValue, setModalInputValue] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.lua') || lower.endsWith('.luau')) {
      // VS Code style blue Lua/Luau file icon
      return <FileCode size={14} style={{ color: '#519aba' }} className="shrink-0" />;
    }
    if (lower.endsWith('.txt')) {
      // VS Code dark gray document file icon
      return <FileText size={14} style={{ color: '#90a4ae' }} className="shrink-0" />;
    }
    if (lower.endsWith('.py')) {
      // VS Code yellow/blue Python icon
      return <FileTerminal size={14} style={{ color: '#3572a5' }} className="shrink-0" />;
    }
    if (lower.endsWith('.json')) {
      // VS Code yellow JSON brackets icon
      return <FileJson size={14} style={{ color: '#cbcb41' }} className="shrink-0" />;
    }
    if (lower.includes('.env')) {
      // VS Code key-lock env icon
      return <FileKey size={14} style={{ color: '#e6b450' }} className="shrink-0" />;
    }
    // Generic script file icon
    return <FileCode size={14} style={{ color: '#858585' }} className="shrink-0" />;
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string, nodeType: 'file' | 'folder') => {
    e.preventDefault();
    e.stopPropagation();
    setEmptySpaceMenu(null);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId,
      nodeType
    });
  };

  const handleEmptySpaceContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu(null);
    setEmptySpaceMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const closeMenus = () => {
    setContextMenu(null);
    setEmptySpaceMenu(null);
  };

  // Listen globally to clean popups on normal clicks
  useEffect(() => {
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  // Modal Initiators (Replacing prompt/confirm overrides!)
  const triggerRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalNodeId(id);
    setModalInputValue(currentName);
    setModalError(null);
    setActiveModal('rename');
  };

  const triggerDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalNodeId(id);
    setActiveModal('delete');
  };

  const triggerDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicateNode(id);
  };

  const triggerToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(id);
  };

  const triggerMove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalNodeId(id);
    setModalParentId(''); // default to root
    setActiveModal('move');
  };

  const handleCreateInFolder = (type: 'file' | 'folder', parentId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalParentId(parentId);
    setModalInputValue(type === 'file' ? 'NewScript.luau' : 'NewFolder');
    setModalError(null);
    setActiveModal(type === 'file' ? 'create_file' : 'create_folder');
  };

  // Submit Modal changes
  const submitModal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = modalInputValue.trim();
    if (!val && activeModal !== 'delete' && activeModal !== 'move') {
      setModalError('Value cannot be empty');
      return;
    }

    if (activeModal === 'rename' && modalNodeId) {
      onRenameNode(modalNodeId, val);
    } else if (activeModal === 'create_file') {
      onCreateNode(val, 'file', modalParentId);
      if (modalParentId) {
        setExpandedFolders(prev => ({ ...prev, [modalParentId]: true }));
      }
    } else if (activeModal === 'create_folder') {
      onCreateNode(val, 'folder', modalParentId);
      if (modalParentId) {
        setExpandedFolders(prev => ({ ...prev, [modalParentId]: true }));
      }
    } else if (activeModal === 'delete' && modalNodeId) {
      onDeleteNode(modalNodeId);
    } else if (activeModal === 'move' && modalNodeId) {
      const pid = modalParentId === '' ? null : modalParentId;
      onMoveNode(modalNodeId, pid);
    }

    setActiveModal(null);
    setModalNodeId(null);
    setModalParentId(null);
  };

  const renderTree = (parentId: string | null, depth: number = 0) => {
    const nodes = files.filter(f => f.parentId === parentId);

    // folders first, then files
    const sortedNodes = [...nodes].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return sortedNodes.map((node) => {
      const isFolder = node.type === 'folder';
      const isExpanded = !!expandedFolders[node.id];
      const isActive = activeFileId === node.id;

      return (
        <div key={node.id} className="select-none font-mono">
          <div
            onClick={() => {
              if (isFolder) {
                setExpandedFolders(prev => ({ ...prev, [node.id]: !prev[node.id] }));
              } else {
                onSelectFile(node.id);
              }
            }}
            onContextMenu={(e) => handleContextMenu(e, node.id, node.type)}
            style={{
              paddingLeft: `${Math.max(8, depth * 12)}px`,
              borderColor: isActive ? theme.accent : 'transparent',
              background: isActive ? `${theme.accent}12` : 'transparent',
              color: isActive ? theme.textMain : theme.textMuted,
            }}
            className={`group py-1.5 px-3 flex items-center justify-between text-xs cursor-pointer hover:bg-zinc-800/10 rounded-md transition duration-150 relative ${
              isActive ? 'border-l-2' : ''
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              {isFolder ? (
                <span className="text-zinc-500 shrink-0">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              ) : (
                <span className="w-4" />
              )}

              {isFolder ? (
                isExpanded ? (
                  <FolderOpen size={14} style={{ color: '#d29a38' }} className="shrink-0" />
                ) : (
                  <Folder size={14} style={{ color: '#d29a38' }} className="shrink-0" />
                )
              ) : (
                getFileIcon(node.name)
              )}

              <span className={`truncate ${isActive ? 'font-semibold' : ''}`}>{node.name}</span>
            </div>

            {/* Quick hover nodes */}
            <div className="hidden group-hover:flex items-center space-x-1 shrink-0 bg-[#0d0e12]/95 backdrop-blur-xs pl-2">
              {isFolder ? (
                <>
                  <button
                    onClick={(e) => handleCreateInFolder('file', node.id, e)}
                    className="p-1 hover:text-white rounded"
                    title="Add Script File"
                  >
                    <FilePlus size={12} />
                  </button>
                  <button
                    onClick={(e) => handleCreateInFolder('folder', node.id, e)}
                    className="p-1 hover:text-white rounded"
                    title="Add Nested Folder"
                  >
                    <FolderPlus size={12} />
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => triggerToggleFav(node.id, e)}
                  className="p-1 hover:text-yellow-400 rounded"
                  title="Tag favorite"
                >
                  <Star size={12} className={node.isFavorite ? "fill-yellow-500 text-yellow-500" : ""} />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, node.id, node.type);
                }}
                className="p-1 hover:text-white rounded"
                title="Options Menu"
              >
                <MoreVertical size={12} />
              </button>
            </div>
          </div>

          {/* Children nodes connector indicators */}
          {isFolder && isExpanded && (
            <div className="relative">
              <div
                style={{ left: `${Math.max(14, depth * 12 + 6)}px`, borderColor: theme.borderColor }}
                className="absolute top-0 bottom-2.5 border-l opacity-20 pointer-events-none"
              />
              {renderTree(node.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div
      onContextMenu={handleEmptySpaceContextMenu}
      style={{
        backgroundColor: theme.sidebarBg,
        borderColor: theme.borderColor
      }}
      className="w-full sm:w-56 h-full shrink-0 border-r flex flex-col justify-between font-mono relative bg-black/10 selection:bg-rose-500/10"
    >
      {/* Search & Actions Bar */}
      <div 
        style={{ borderColor: theme.borderColor }}
        className="p-3 border-b space-y-2 shrink-0 bg-black/20"
      >
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-sans">
          <span>Workspace</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => handleCreateInFolder('file', null, e)}
              className="p-1 hover:text-zinc-200 transition rounded cursor-pointer"
              title="New Root File"
            >
              <FilePlus size={13} />
            </button>
            <button
              onClick={(e) => handleCreateInFolder('folder', null, e)}
              className="p-1 hover:text-zinc-200 transition rounded cursor-pointer"
              title="New Root Folder"
            >
              <FolderPlus size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Workspace files list */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 max-h-[calc(100vh-140px)]">
        {files.filter(f => f.parentId === null).length === 0 ? (
          <div className="p-4 text-center text-zinc-650 text-xs font-mono">
            Empty workspace. Use file icons above.
          </div>
        ) : (
          renderTree(null)
        )}
      </div>

      {/* Dynamic I/O Active badge */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="p-2.5 border-t bg-[#0d0e12]/60 text-left font-sans flex items-center space-x-2 pointer-events-none"
      >
        <Heart size={11} className="text-emerald-500 animate-pulse shrink-0 fill-current" />
        <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
          Dynamic IO active
        </span>
      </div>

      {/* Context Menu for File Items */}
      {contextMenu && (
        <div
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: theme.sidebarBg,
            borderColor: theme.borderColor,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
          className="fixed z-50 border rounded-xl py-1.5 w-44 font-sans text-xs flex flex-col pointer-events-auto bg-[#14161e] select-none"
        >
          <button
            onClick={(e) => triggerRename(contextMenu.nodeId, files.find(f => f.id === contextMenu.nodeId)?.name || '', e)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
          >
            <Edit size={12} />
            <span>Rename</span>
          </button>
          
          <button
            onClick={(e) => triggerDuplicate(contextMenu.nodeId, e)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
          >
            <Copy size={12} />
            <span>Duplicate</span>
          </button>

          <button
            onClick={(e) => triggerMove(contextMenu.nodeId, e)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
          >
            <CornerDownRight size={12} />
            <span>Move Item</span>
          </button>

          {contextMenu.nodeType === 'file' && (
            <button
              onClick={(e) => triggerToggleFav(contextMenu.nodeId, e)}
              className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
            >
              <Star size={12} />
              <span>Toggle Favorite</span>
            </button>
          )}

          <div className="h-[1px] bg-zinc-800/60 my-1" />

          <button
            onClick={(e) => triggerDelete(contextMenu.nodeId, e)}
            className="px-3.5 py-1.5 text-left text-rose-500 hover:bg-rose-500/10 transition flex items-center space-x-2 font-semibold cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Empty Space Context Menu */}
      {emptySpaceMenu && (
        <div
          style={{
            top: `${emptySpaceMenu.y}px`,
            left: `${emptySpaceMenu.x}px`,
            backgroundColor: theme.sidebarBg,
            borderColor: theme.borderColor,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
          className="fixed z-50 border rounded-xl py-1.5 w-48 font-sans text-xs flex flex-col pointer-events-auto bg-[#14161e] select-none"
        >
          <button
            onClick={(e) => handleCreateInFolder('file', null, e)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
          >
            <FilePlus size={12} />
            <span>Create New File</span>
          </button>

          <button
            onClick={(e) => handleCreateInFolder('folder', null, e)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-zinc-800/40 hover:text-white transition flex items-center space-x-2 cursor-pointer"
          >
            <FolderPlus size={12} />
            <span>Create New Folder</span>
          </button>
        </div>
      )}

      {/* Modular HUD Dialogues (Better than standard alerts) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs font-sans p-4">
          <div 
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.borderColor,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
            className="w-full max-w-sm border rounded-2xl p-5 space-y-4 text-left animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: theme.borderColor }}>
              <span className="text-xs font-bold font-mono uppercase tracking-widest text-zinc-300" style={{ color: theme.textMain }}>
                {activeModal === 'create_file' && 'Create New File'}
                {activeModal === 'create_folder' && 'Create New Folder'}
                {activeModal === 'rename' && 'Rename'}
                {activeModal === 'delete' && 'Delete Item'}
                {activeModal === 'move' && 'Move Item'}
              </span>
              <button 
                onClick={() => setActiveModal(null)} 
                className="text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={submitModal} className="space-y-4">
              
              {/* Conditional parameters based on modal actions */}
              {(activeModal === 'create_file' || activeModal === 'create_folder' || activeModal === 'rename') && (
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold tracking-widest uppercase block" style={{ color: theme.accent }}>Name:</label>
                  <input
                    autoFocus
                    type="text"
                    value={modalInputValue}
                    onChange={(e) => {
                      setModalInputValue(e.target.value);
                      setModalError(null);
                    }}
                    className="w-full py-2 px-3 border rounded-xl font-mono text-xs focus:outline-none focus:border-zinc-500"
                    style={{
                      backgroundColor: theme.isLight ? '#f4f4f5' : '#07080a',
                      color: theme.textMain,
                      borderColor: theme.borderColor
                    }}
                  />
                </div>
              )}

              {activeModal === 'delete' && (
                <div className="flex items-start space-x-3 text-xs leading-relaxed">
                  <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-zinc-300" style={{ color: theme.textMain }}>
                    Are you absolutely sure you want to permanently delete this item? This operation cannot be undone.
                  </p>
                </div>
              )}

              {activeModal === 'move' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-bold tracking-widest uppercase block" style={{ color: theme.accent }}>Folder Destination:</label>
                  <select
                    value={modalParentId || ''}
                    onChange={(e) => setModalParentId(e.target.value)}
                    className="w-full py-2 px-3 border rounded-xl font-mono text-xs focus:outline-none focus:border-zinc-500"
                    style={{
                      backgroundColor: theme.isLight ? '#f4f4f5' : '#07080a',
                      color: theme.textMain,
                      borderColor: theme.borderColor
                    }}
                  >
                    <option value="">[Workspace Root]</option>
                    {files.filter(f => f.type === 'folder' && f.id !== modalNodeId).map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {modalError && (
                <p className="text-[10px] text-rose-500 font-semibold font-mono uppercase">{modalError}</p>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: theme.borderColor }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-1.5 text-[10px] font-mono hover:bg-zinc-800/10 rounded-lg text-zinc-400 uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[10px] font-mono font-bold rounded-lg uppercase transition hover:opacity-90 cursor-pointer"
                  style={{ 
                    backgroundColor: activeModal === 'delete' ? '#ef4444' : theme.accent,
                    color: activeModal === 'delete' ? '#ffffff' : (theme.isLight ? '#ffffff' : '#000000')
                  }}
                >
                  {activeModal === 'delete' && 'Delete'}
                  {activeModal === 'create_file' && 'Create'}
                  {activeModal === 'create_folder' && 'Create'}
                  {activeModal === 'rename' && 'Rename'}
                  {activeModal === 'move' && 'Move'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
