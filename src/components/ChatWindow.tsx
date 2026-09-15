import React, { useRef, useEffect, useState } from 'react';
import { Conversation, Message, ArtifactData, Attachment } from '../types';
import { MessageItem } from './MessageItem';
import { InputBar } from './InputBar';
import {
  ArrowDown,
  Code,
  Command,
  FileCode,
  Globe,
  GraduationCap,
  Lightbulb,
  Menu,
  Minimize2,
  Moon,
  PanelRight,
  ShieldCheck,
  Sparkles,
  Sun,
  Wand2,
} from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation | null;
  isStreaming: boolean;
  activeArtifact: ArtifactData | null;
  onOpenArtifact: (artifact: ArtifactData) => void;
  onCloseArtifact: () => void;
  isArtifactPanelOpen: boolean;
  onToggleArtifactPanel: () => void;
  onSendMessage: (text: string, attachments: Attachment[], mode: string, urls?: string[]) => void;
  onStopGenerating: () => void;
  onEditUserMessage: (messageId: string, newText: string) => void;
  onRegenerate: (messageId: string, instruction?: string) => void;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  onSwitchVersion: (messageId: string, newVersionIndex: number) => void;
  onToggleSidebar: () => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: (initialTab?: string) => void;
  userName: string;
  selectedMode: string;
  onChangeMode: (mode: string) => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
  webSearchEnabled?: boolean;
  onToggleWebSearch?: () => void;
  onOpenMediaStudio?: (mode?: 'image' | 'video') => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  isStreaming,
  activeArtifact,
  onOpenArtifact,
  onCloseArtifact,
  isArtifactPanelOpen,
  onToggleArtifactPanel,
  onSendMessage,
  onStopGenerating,
  onEditUserMessage,
  onRegenerate,
  onFeedback,
  onSwitchVersion,
  onToggleSidebar,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
  onOpenSettings,
  userName,
  selectedMode,
  onChangeMode,
  focusMode = false,
  onToggleFocusMode,
  webSearchEnabled = true,
  onToggleWebSearch,
  onOpenMediaStudio,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  const messages = conversation?.messages || [];
  const isEmptyState = messages.length === 0;

  // Auto-scroll on new message unless user scrolled up
  useEffect(() => {
    if (!userHasScrolledUp && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isStreaming, userHasScrolledUp]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
    setUserHasScrolledUp(isUp);
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setUserHasScrolledUp(false);
      setShowScrollBottom(false);
    }
  };

  // Suggested prompt chips for empty state
  const suggestedPrompts = [
    {
      title: 'Customer Query & Resolution',
      subtitle: 'Analyze customer inquiry & package status',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      prompt: 'A customer says: "I ordered an item 4 days ago with tracking #CL-8924 but it has not arrived yet. What is your refund and replacement policy, and how can you help me resolve this?"',
    },
    {
      title: 'Live Website Information Gathering',
      subtitle: 'Fetch website content and summarize key takeaways',
      icon: <Globe className="w-4 h-4 text-blue-500" />,
      prompt: 'Fetch and analyze the latest web documentation from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API and summarize key best practices.',
    },
    {
      title: 'Interactive React Widget',
      subtitle: 'Build a live activity tracker with milestones',
      icon: <Code className="w-4 h-4 text-[var(--accent)]" />,
      prompt: 'Build an interactive counter and analytics widget in an artifact with milestones and warm styling.',
    },
    {
      title: 'Neural Network Calculus',
      subtitle: 'Matrix derivation of backpropagation',
      icon: <Wand2 className="w-4 h-4 text-purple-600" />,
      prompt: 'Derive the gradient formulas for multi-layer perceptron backpropagation step-by-step with LaTeX equations.',
    },
  ];

  return (
    <main
      className={`flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden relative transition-all duration-300 ${
        isArtifactPanelOpen && !focusMode ? 'md:w-1/2 lg:w-[52%]' : 'w-full'
      }`}
      aria-label="Main chat area"
    >
      {/* Top Navigation Bar */}
      <header className="h-14 px-4 border-b border-[var(--border)] bg-[var(--bg-main)]/80 backdrop-blur-xs flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          {!focusMode && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              title="Toggle Sidebar"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0 flex items-center gap-2">
            <h1 className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {conversation ? conversation.title : 'New conversation'}
            </h1>
            <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-[var(--border-subtle)] text-[var(--text-muted)] font-medium">
              Claude 3.7 Model
            </span>
            {focusMode && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[var(--accent-light)] text-[var(--accent)] font-medium border border-[var(--accent-border)]">
                Focus Mode
              </span>
            )}
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Focus Mode Exit Pill */}
          {focusMode && onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all shadow-xs"
              title="Exit Focus Mode (Restore sidebar and panels)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Focus Mode</span>
            </button>
          )}

          {/* Quick Viva Notes Button */}
          <button
            onClick={() => onOpenSettings('viva')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--accent)] bg-[var(--accent-light)] border border-[var(--accent-border)] hover:bg-[var(--accent)] hover:text-white transition-all shadow-2xs"
            title="View Academic Viva & Architecture Notes"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Viva Notes</span>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] transition-colors hidden sm:flex"
            title="Command Palette (Cmd+K)"
          >
            <Command className="w-3 h-3" />
            <span className="font-mono text-[10px]">K</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Toggle Artifact Panel if active artifact exists and not in focus mode */}
          {!focusMode && activeArtifact && (
            <button
              onClick={onToggleArtifactPanel}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
                isArtifactPanelOpen
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)] hover:text-white'
              }`}
              title={isArtifactPanelOpen ? 'Close Artifact Canvas' : 'View Artifact Canvas'}
              aria-label={isArtifactPanelOpen ? 'Close Artifact Canvas' : 'View Artifact Canvas'}
            >
              <PanelRight className="w-4 h-4" />
              <span className="text-xs font-semibold">Canvas</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}
        </div>
      </header>

      {/* Main Chat Body */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative"
      >
        {isEmptyState ? (
          /* Claude-Inspired Empty State */
          <div className="min-h-full flex flex-col items-center justify-center max-w-2xl mx-auto py-8 text-center animate-in fade-in duration-300">
            {/* Friendly Greeting in warm editorial serif */}
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--accent)] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Prototype Mode</span>
            </div>

            <h2 className="font-serif-claude text-3xl sm:text-4xl lg:text-5xl font-normal text-[var(--text-primary)] tracking-tight mb-3">
              Good day, {userName}
            </h2>
            <p className="text-base text-[var(--text-secondary)] mb-8 max-w-lg">
              What research problem, algorithm, or interactive prototype are you exploring today?
            </p>

            {/* Suggested Prompts Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
              {suggestedPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt, [], selectedMode)}
                  className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/60 hover:bg-[var(--bg-card-hover)] hover:shadow-xs transition-all flex items-start gap-3 group focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Conversation Messages Column: max-w-[760px] centered */
          <div className="max-w-[760px] mx-auto w-full pb-10">
            {messages.map((msg, index) => {
              const isLastMessage = index === messages.length - 1;
              const isLastAssistant = isLastMessage && msg.role === 'assistant';

              return (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isStreaming={isLastAssistant && isStreaming}
                  activeArtifact={activeArtifact}
                  onOpenArtifact={onOpenArtifact}
                  onEditUserMessage={onEditUserMessage}
                  onRegenerate={onRegenerate}
                  onFeedback={onFeedback}
                  onSwitchVersion={onSwitchVersion}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 z-30 p-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] shadow-md hover:bg-[var(--bg-card-hover)] hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Sticky Bottom Input Bar */}
      <footer className="sticky bottom-0 bg-[var(--bg-main)]/90 backdrop-blur-xs pt-1 z-20">
        <InputBar
          appName="Clarity AI"
          isGenerating={isStreaming}
          onSend={onSendMessage}
          onStop={onStopGenerating}
          selectedMode={selectedMode}
          onChangeMode={onChangeMode}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={onToggleWebSearch}
          onOpenMediaStudio={onOpenMediaStudio}
        />
      </footer>
    </main>
  );
};
