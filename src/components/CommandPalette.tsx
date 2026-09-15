import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FolderPlus,
  GraduationCap,
  Maximize2,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onToggleTheme: () => void;
  onOpenSettings: (tab?: string) => void;
  onOpenNewProject: () => void;
  theme: 'light' | 'dark' | 'system';
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewChat,
  onToggleTheme,
  onOpenSettings,
  onOpenNewProject,
  theme,
  focusMode = false,
  onToggleFocusMode,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'new-chat',
      title: 'New Conversation',
      subtitle: 'Start a fresh prompt thread',
      icon: <Plus className="w-4 h-4 text-[var(--accent)]" />,
      run: () => {
        onNewChat();
        onClose();
      },
    },
    {
      id: 'theme',
      title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      subtitle: 'Toggle warm neutral color palette',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[var(--accent)]" />,
      run: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'focus-mode',
      title: focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode',
      subtitle: focusMode
        ? 'Restore navigation sidebar and artifact panels'
        : 'Hide sidebar and artifact panels for distraction-free writing',
      icon: <Maximize2 className="w-4 h-4 text-[var(--accent)]" />,
      run: () => {
        if (onToggleFocusMode) onToggleFocusMode();
        onClose();
      },
    },
    {
      id: 'viva-notes',
      title: 'Academic Viva & Design Defense',
      subtitle: 'Review rationale for palette, artifacts, and content hierarchy',
      icon: <GraduationCap className="w-4 h-4 text-[var(--accent)]" />,
      run: () => {
        onOpenSettings('viva');
        onClose();
      },
    },
    {
      id: 'new-project',
      title: 'Create Project Folder',
      subtitle: 'Organize conversations with custom instructions',
      icon: <FolderPlus className="w-4 h-4 text-emerald-600" />,
      run: () => {
        onOpenNewProject();
        onClose();
      },
    },
    {
      id: 'settings',
      title: 'Open Settings & Preferences',
      subtitle: 'Configure persona, models, and reasoning',
      icon: <Settings className="w-4 h-4 text-[var(--text-secondary)]" />,
      run: () => {
        onOpenSettings('general');
        onClose();
      },
    },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden text-[var(--text-primary)] animate-in zoom-in-95 duration-150"
      >
        <div className="p-3 border-b border-[var(--border)] flex items-center gap-2">
          <Search className="w-4 h-4 text-[var(--text-muted)] ml-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            autoFocus
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--border-subtle)] text-[var(--text-muted)]">
            ESC
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.map((action) => (
            <button
              key={action.id}
              onClick={action.run}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-card-hover)] text-left transition-colors group focus:outline-none focus:bg-[var(--bg-card-hover)]"
            >
              <div className="p-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] group-hover:scale-105 transition-transform shrink-0">
                {action.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {action.title}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  {action.subtitle}
                </div>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-xs text-[var(--text-muted)]">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
