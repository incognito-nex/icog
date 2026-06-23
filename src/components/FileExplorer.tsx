import React, { useState } from 'react';
import { 
  FolderPlus, FilePlus, ChevronRight, ChevronDown, Folder, FileCode, Play,
  MoreVertical, Edit, Trash2, Copy, CornerDownRight, Star, Heart, FileText, ArrowRight
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
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
    nodeType: 'file' | 'folder';
  } | null>(null);

  const toggleFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string, nodeType: 'file' | 'folder') => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId,
      nodeType
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // Close context menu on general click
  React.useEffect(() => {
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, []);

  const triggerRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('Rename node:', currentName);
    if (newName && newName.trim() && newName !== currentName) {
      onRenameNode(id, newName.trim());
    }
  };

  const triggerDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this file node?')) {
      onDeleteNode(id);
    }
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
    // list available directories
    const folders = files.filter(f => f.type === 'folder' && f.id !== id);
    const options = folders.map(f => `"${f.name}" (ID: ${f.id})`).join('\n');
    const destId = prompt(
      `Move item. Enter target folder ID (or leave blank for root):\n\nAvailable Folders:\n` +
      folders.map(f => `- ${f.name} (use ID: ${f.id})`).join('\n') + `\n\nEnter ID:`,
      ''
    );
    if (destId !== null) {
      const parentId = destId.trim() === '' ? null : destId.trim();
      onMoveNode(id, parentId);
    }
  };

  const handleCreateInFolder = (type: 'file' | 'folder', parentId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt(`Enter new ${type === 'file' ? 'Luau script' : 'folder'} name:`, type === 'file' ? 'NewScript.luau' : 'NewFolder');
    if (name && name.trim()) {
      onCreateNode(name.trim(), type, parentId);
      if (parentId) {
        setExpandedFolders(prev => ({ ...prev, [parentId]: true }));
      }
    }
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
                <Folder size={14} className="text-zinc-500 shrink-0" />
              ) : (
                <FileCode size={14} style={{ color: theme.accent }} className="shrink-0" />
              )}

              <span className={`truncate ${isActive ? 'font-semibold' : ''}`}>{node.name}</span>
            </div>

            {/* Quick Hover actions for quick workflows */}
            <div className="hidden group-hover:flex items-center space-x-1 shrink-0 bg-[#0d0e12]/90 backdrop-blur-xs pl-2">
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

          {/* Children nodes */}
          {isFolder && isExpanded && (
            <div className="relative">
              {/* Connective branch indicator */}
              <div
                style={{ left: `${Math.max(14, depth * 12 + 6)}px`, borderColor: theme.borderColor }}
                className="absolute top-0 bottom-2.5 border-l opacity-25 pointer-events-none"
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
          <span>Virtual Workspace Trees</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => handleCreateInFolder('file', null, e)}
              className="p-1 hover:text-zinc-200 transition rounded"
              title="New Root File"
            >
              <FilePlus size={13} />
            </button>
            <button
              onClick={(e) => handleCreateInFolder('folder', null, e)}
              className="p-1 hover:text-zinc-200 transition rounded"
              title="New Root Folder"
            >
              <FolderPlus size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Actual tree explorer scroll container */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 max-h-[calc(100vh-140px)]">
        {files.filter(f => f.parentId === null).length === 0 ? (
          <div className="p-4 text-center text-zinc-600 text-xs font-mono">
            Empty workspace. Use file icons above.
          </div>
        ) : (
          renderTree(null)
        )}
      </div>

      {/* Direct Quick Info Badge */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="p-2.5 border-t bg-[#0d0e12]/60 text-left font-sans flex items-center space-x-2 pointer-events-none"
      >
        <Heart size={11} className="text-red-500 animate-pulse shrink-0 fill-current" />
        <span className="text-[9px] font-mono tracking-wider text-zinc-500 uppercase">
          Dynamic IO active
        </span>
      </div>

      {/* High-Fidelity Custom Floating Context Menu */}
      {contextMenu && (
        <div
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: theme.sidebarBg,
            borderColor: theme.borderColor,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
          className="fixed z-50 border rounded-lg py-1.5 w-44 font-sans text-xs flex flex-col pointer-events-auto bg-[#14161e] select-none"
        >
          <button
            onClick={(e) => triggerRename(contextMenu.nodeId, files.find(f => f.id === contextMenu.nodeId)?.name || '', e)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-[#ee3c22]/10 hover:text-[#ee3c22] transition flex items-center space-x-2"
          >
            <Edit size={12} />
            <span>Rename Node</span>
          </button>
          
          <button
            onClick={(e) => triggerDuplicate(contextMenu.nodeId, e)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-[#ee3c22]/10 hover:text-[#ee3c22] transition flex items-center space-x-2"
          >
            <Copy size={12} />
            <span>Duplicate File</span>
          </button>

          <button
            onClick={(e) => triggerMove(contextMenu.nodeId, e)}
            className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-[#ee3c22]/10 hover:text-[#ee3c22] transition flex items-center space-x-2"
          >
            <CornerDownRight size={12} />
            <span>Move Path...</span>
          </button>

          {contextMenu.nodeType === 'file' && (
            <button
              onClick={(e) => triggerToggleFav(contextMenu.nodeId, e)}
              className="px-3.5 py-1.5 text-left text-zinc-300 hover:bg-[#ee3c22]/10 hover:text-[#ee3c22] transition flex items-center space-x-2"
            >
              <Star size={12} />
              <span>Toggle Favorite</span>
            </button>
          )}

          <div className="h-[1px] bg-zinc-800 my-1" />

          <button
            onClick={(e) => triggerDelete(contextMenu.nodeId, e)}
            className="px-3.5 py-1.5 text-left text-rose-500 hover:bg-rose-500/10 transition flex items-center space-x-2 font-semibold"
          >
            <Trash2 size={12} />
            <span>Purge Node</span>
          </button>
        </div>
      )}
    </div>
  );
}
