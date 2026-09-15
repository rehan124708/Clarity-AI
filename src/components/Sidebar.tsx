import React, { useState } from 'react';
import { Conversation, Project } from '../types';
import { groupConversationsByDate } from '../utils/parser';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  MoreHorizontal,
  PenSquare,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

interface SidebarProps {
  appName?: string;
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onOpenNewProjectModal: () => void;
  onOpenSettings: () => void;
  userName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  appName = 'Clarity AI',
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePin,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenSettings,
  userName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  // Filter conversations by title or message body content
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesProject = activeProjectId ? c.projectId === activeProjectId : true;
    if (!q) return matchesProject;

    const matchesTitle = c.title.toLowerCase().includes(q);
    const matchesMessages = c.messages?.some(
      (m) =>
        (m.text && m.text.toLowerCase().includes(q)) ||
        (m.artifact && m.artifact.title && m.artifact.title.toLowerCase().includes(q)) ||
        (m.media && m.media.prompt && m.media.prompt.toLowerCase().includes(q))
    );
    return (matchesTitle || matchesMessages) && matchesProject;
  });

  const pinnedConversations = filteredConversations.filter((c) => c.isPinned);
  const unpinnedConversations = filteredConversations.filter((c) => !c.isPinned);
  const grouped = groupConversationsByDate(unpinnedConversations);

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile & Tablet Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col transition-all duration-200 ease-in-out shadow-2xl lg:shadow-none lg:static ${
          isOpen
            ? 'translate-x-0 lg:w-64 xl:w-72'
            : '-translate-x-full lg:w-0 lg:-translate-x-full lg:overflow-hidden lg:border-r-0 lg:p-0'
        }`}
        aria-label="Application sidebar"
      >
        {/* Top Header: Logo + Mobile Close */}
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Claude-inspired warm circular emblem mark */}
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-serif-claude text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Clarity AI
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action: + New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-all shadow-xs hover:shadow focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8.5 pr-8 py-1.5 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Conversation and Projects List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 text-xs">
          {/* Projects Section */}
          <div className="pt-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              <button
                onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
              >
                {isProjectsExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>Projects</span>
              </button>
              <button
                onClick={onOpenNewProjectModal}
                className="p-1 rounded hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--accent)]"
                title="Create Project"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isProjectsExpanded && (
              <div className="space-y-0.5 mt-1">
                <button
                  onClick={() => onSelectProject(null)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    activeProjectId === null
                      ? 'bg-[var(--bg-card)] font-medium text-[var(--text-primary)] shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span className="truncate">All Conversations</span>
                </button>

                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      activeProjectId === proj.id
                        ? 'bg-[var(--bg-card)] font-medium text-[var(--text-primary)] shadow-2xs'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: proj.color || 'var(--accent)' }}
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pinned Section (if any) */}
          {pinnedConversations.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-[var(--accent)] uppercase tracking-wider">
                <Pin className="w-3 h-3 fill-current" />
                <span>Pinned</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {pinnedConversations.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {/* Grouped History */}
          {grouped.today.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Today
              </div>
              <div className="space-y-0.5 mt-1">
                {grouped.today.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {grouped.yesterday.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Yesterday
              </div>
              <div className="space-y-0.5 mt-1">
                {grouped.yesterday.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {grouped.pastSevenDays.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Previous 7 Days
              </div>
              <div className="space-y-0.5 mt-1">
                {grouped.pastSevenDays.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {grouped.older.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Older
              </div>
              <div className="space-y-0.5 mt-1">
                {grouped.older.map((conv) => renderConversationItem(conv))}
              </div>
            </div>
          )}

          {filteredConversations.length === 0 && (
            <div className="p-4 text-center text-xs text-[var(--text-muted)]">
              No conversations found.
            </div>
          )}
        </div>

        {/* Bottom Sidebar: User Avatar + Plan badge + Settings */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-sidebar)] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs text-[var(--text-primary)] truncate">
                  {userName}
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  <span className="text-[10.5px] text-[var(--text-muted)] truncate">
                    B.Tech CSE / AI & ML
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              title="Settings & Viva Notes"
              aria-label="Settings and viva notes"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  function renderConversationItem(conv: Conversation) {
    const isActive = activeConversationId === conv.id;
    const isEditingThis = editingId === conv.id;

    if (isEditingThis) {
      return (
        <div key={conv.id} className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--accent)] flex items-center gap-1.5">
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(conv.id);
              if (e.key === 'Escape') setEditingId(null);
            }}
            className="flex-1 text-xs bg-transparent text-[var(--text-primary)] focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => handleSaveRename(conv.id)}
            className="p-1 text-[var(--success)] hover:bg-[var(--bg-card-hover)] rounded"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="p-1 text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)] rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    return (
      <div
        key={conv.id}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl transition-all ${
          isActive
            ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-2xs border border-[var(--border)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
        }`}
      >
        <button
          onClick={() => {
            onSelectConversation(conv.id);
            if (window.innerWidth < 1024) onClose();
          }}
          className="flex-1 text-left truncate pr-6 focus:outline-none"
        >
          <span className="truncate block">{conv.title}</span>
        </button>

        {/* Action Menu (accessible on hover and touch devices) */}
        <div className="absolute right-1.5 flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId(activeMenuId === conv.id ? null : conv.id);
            }}
            className={`p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] ${
              activeMenuId === conv.id ? 'opacity-100 bg-[var(--bg-card-hover)] text-[var(--text-primary)]' : 'opacity-70 sm:opacity-0 sm:group-hover:opacity-100'
            } transition-opacity`}
            title="Options"
            aria-label="Conversation options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {activeMenuId === conv.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 z-30 w-36 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg p-1 text-xs space-y-0.5 animate-in fade-in"
            >
              <button
                onClick={() => {
                  onTogglePin(conv.id);
                  setActiveMenuId(null);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]"
              >
                {conv.isPinned ? <PinOff className="w-3 h-3 text-[var(--accent)]" /> : <Pin className="w-3 h-3" />}
                <span>{conv.isPinned ? 'Unpin' : 'Pin conversation'}</span>
              </button>

              <button
                onClick={() => handleStartRename(conv)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]"
              >
                <PenSquare className="w-3 h-3" />
                <span>Rename</span>
              </button>

              <button
                onClick={() => {
                  onDeleteConversation(conv.id);
                  setActiveMenuId(null);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--error)]/10 text-[var(--error)]"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
};
