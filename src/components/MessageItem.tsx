import React, { useState } from 'react';
import { Message, ArtifactData } from '../types';
import { ThinkingBlock } from './ThinkingBlock';
import { ArtifactCard } from './ArtifactCard';
import { MediaCard } from './MediaCard';
import { CodeBlock } from './CodeBlock';
import ReactMarkdown from 'react-markdown';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit2,
  ExternalLink,
  FileText,
  Globe,
  Info,
  RotateCcw,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
  activeArtifact: ArtifactData | null;
  onOpenArtifact: (artifact: ArtifactData) => void;
  onEditUserMessage?: (messageId: string, newText: string) => void;
  onRegenerate?: (messageId: string, instruction?: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
  onSwitchVersion?: (messageId: string, newVersionIndex: number) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isStreaming = false,
  activeArtifact,
  onOpenArtifact,
  onEditUserMessage,
  onRegenerate,
  onFeedback,
  onSwitchVersion,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showRegenMenu, setShowRegenMenu] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message: ', err);
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text && onEditUserMessage) {
      onEditUserMessage(message.id, editText.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  // Multiple versions pager logic
  const totalVersions = (message.versions ? message.versions.length : 0) + 1;
  const currentVersion = (message.currentVersionIndex ?? totalVersions - 1) + 1;

  if (isUser) {
    return (
      <div className="group w-full my-4 flex flex-col items-end">
        <div className="w-full max-w-2xl">
          {/* Version pager if user message has multiple edits */}
          {totalVersions > 1 && (
            <div className="flex items-center justify-end gap-1 mb-1 text-xs text-[var(--text-muted)] font-mono">
              <button
                onClick={() => onSwitchVersion && onSwitchVersion(message.id, currentVersion - 2)}
                disabled={currentVersion <= 1}
                className="p-0.5 rounded hover:bg-[var(--bg-card-hover)] disabled:opacity-30"
                title="Previous version"
                aria-label="Previous version"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>
                {currentVersion} / {totalVersions}
              </span>
              <button
                onClick={() => onSwitchVersion && onSwitchVersion(message.id, currentVersion)}
                disabled={currentVersion >= totalVersions}
                className="p-0.5 rounded hover:bg-[var(--bg-card-hover)] disabled:opacity-30"
                title="Next version"
                aria-label="Next version"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* User message card */}
          <div className="relative rounded-2xl bg-[var(--bg-user-bubble)] border border-[var(--border)] p-4 shadow-xs text-[var(--text-primary)]">
            {/* Attached images/files */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {message.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-xs"
                  >
                    {att.dataUrl && att.type.startsWith('image/') ? (
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="w-7 h-7 object-cover rounded"
                      />
                    ) : (
                      <FileText className="w-4 h-4 text-[var(--accent)]" />
                    )}
                    <span className="font-medium truncate max-w-[140px]">{att.name}</span>
                    <span className="text-[var(--text-muted)] text-[10px]">({att.size})</span>
                  </div>
                ))}
              </div>
            )}

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--accent)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-y min-h-[70px]"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(message.text);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors"
                  >
                    Save & Submit
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[15.5px] leading-relaxed whitespace-pre-wrap">
                {message.text}
              </div>
            )}

            {/* Hover Edit Pencil Icon */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                title="Edit and fork message"
                aria-label="Edit and fork message"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message: flows directly on canvas, with small abstract AI mark
  return (
    <div className="group w-full my-6 flex gap-3.5 items-start">
      {/* Abstract AI Avatar Mark */}
      <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center shrink-0 mt-1">
        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Thinking Block */}
        {(message.thinking || isStreaming) && (
          <ThinkingBlock
            thinking={message.thinking || ''}
            isActive={isStreaming && !message.text}
            durationSeconds={message.thinkingDuration || 2.8}
          />
        )}

        {/* Message Markdown Body */}
        <div className="markdown-body">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                if (!inline && (match || codeString.includes('\n'))) {
                  return (
                    <CodeBlock
                      language={match ? match[1] : 'code'}
                      code={codeString}
                    />
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.text}
          </ReactMarkdown>

          {/* Streaming pulsing cursor */}
          {isStreaming && message.text && (
            <span className="inline-block w-2 h-4 ml-1 bg-[var(--accent)] animate-pulse align-middle" />
          )}
        </div>

        {/* Live Connected Websites Chips */}
        {message.websitesFetched && message.websitesFetched.length > 0 && (
          <div className="mt-3.5 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs">
            <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)] mb-2">
              <Globe className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Integrated Websites ({message.websitesFetched.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.websitesFetched.map((site, sIdx) => (
                <a
                  key={sIdx}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors group/link"
                  title={site.url}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="max-w-[200px] truncate font-medium">{site.title || site.url}</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover/link:text-[var(--accent)] shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Search Grounding Sources & Queries */}
        {message.groundingSources && message.groundingSources.length > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-[var(--bg-card)]/70 border border-[var(--border)] text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                <Search className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Web Grounding & Sources ({message.groundingSources.length})</span>
              </div>
              {message.searchQueries && message.searchQueries.length > 0 && (
                <span className="text-[11px] text-[var(--text-muted)] italic truncate max-w-[220px]">
                  "{message.searchQueries[0]}"
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {message.groundingSources.map((source, gIdx) => (
                <a
                  key={gIdx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors group/link"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="max-w-[190px] truncate">{source.title}</span>
                  <ExternalLink className="w-3 h-3 text-[var(--text-muted)] group-hover/link:text-[var(--accent)] shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Generated Image or Video Media Card */}
        {message.media && (
          <MediaCard
            media={message.media}
            onOpenAsArtifact={onOpenArtifact}
          />
        )}

        {/* Attached Artifact Preview Card */}
        {message.artifact && (
          <ArtifactCard
            artifact={message.artifact}
            isOpen={activeArtifact?.id === message.artifact.id}
            onOpen={() => onOpenArtifact(message.artifact!)}
          />
        )}

        {/* API Quota Notice / Information */}
        {message.quotaNotice && !isStreaming && (
          <div className="mt-3 p-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="leading-relaxed">
              <span className="font-semibold">Free-Tier Quota Notice: </span>
              Gemini API rate limit reached. The response above was completed seamlessly via the smart fallback engine. To increase request limits, select a billing-enabled key in Settings &gt; Secrets.
            </div>
          </div>
        )}

        {/* Action bar below AI message */}
        {!isStreaming && (
          <div className="flex items-center gap-1.5 mt-3 pt-1 text-xs text-[var(--text-muted)]">
            {/* Version Pager for Assistant Message */}
            {totalVersions > 1 && (
              <div className="flex items-center gap-1 mr-2 px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-card)] font-mono text-[11px]">
                <button
                  onClick={() => onSwitchVersion && onSwitchVersion(message.id, currentVersion - 2)}
                  disabled={currentVersion <= 1}
                  className="hover:text-[var(--text-primary)] disabled:opacity-30"
                  title="Previous response"
                  aria-label="Previous response"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <span>
                  {currentVersion}/{totalVersions}
                </span>
                <button
                  onClick={() => onSwitchVersion && onSwitchVersion(message.id, currentVersion)}
                  disabled={currentVersion >= totalVersions}
                  className="hover:text-[var(--text-primary)] disabled:opacity-30"
                  title="Next response"
                  aria-label="Next response"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              title="Copy message"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[var(--success)]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Regenerate Button with Popover */}
            <div className="relative">
              <button
                onClick={() => setShowRegenMenu(!showRegenMenu)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                title="Regenerate response"
                aria-label="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {showRegenMenu && (
                <div className="absolute left-0 bottom-full mb-1 z-30 w-44 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg p-1 text-xs">
                  <button
                    onClick={() => {
                      setShowRegenMenu(false);
                      onRegenerate && onRegenerate(message.id, 'Try again');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]"
                  >
                    Try again
                  </button>
                  <button
                    onClick={() => {
                      setShowRegenMenu(false);
                      onRegenerate && onRegenerate(message.id, 'More detailed explanation with code');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]"
                  >
                    More detailed
                  </button>
                  <button
                    onClick={() => {
                      setShowRegenMenu(false);
                      onRegenerate && onRegenerate(message.id, 'More concise summary');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]"
                  >
                    More concise
                  </button>
                </div>
              )}
            </div>

            {/* Feedback Thumbs */}
            <button
              onClick={() => onFeedback && onFeedback(message.id, 'positive')}
              className={`p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
                message.feedback === 'positive'
                  ? 'text-[var(--accent)] bg-[var(--accent-light)]'
                  : 'hover:text-[var(--text-primary)]'
              }`}
              title="Helpful response"
              aria-label="Helpful response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onFeedback && onFeedback(message.id, 'negative')}
              className={`p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
                message.feedback === 'negative'
                  ? 'text-[var(--error)] bg-[var(--error)]/10'
                  : 'hover:text-[var(--text-primary)]'
              }`}
              title="Not helpful"
              aria-label="Not helpful"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
