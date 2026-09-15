import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

interface ThinkingBlockProps {
  thinking: string;
  isActive?: boolean;
  durationSeconds?: number;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  thinking,
  isActive = false,
  durationSeconds = 2.4,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!thinking && !isActive) return null;

  return (
    <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/70 overflow-hidden transition-all text-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-[var(--bg-card-hover)] transition-colors text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="text-[var(--accent)]">
            <Sparkles className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
          </div>
          <span className="font-medium text-[var(--text-secondary)]">
            {isActive ? 'Thinking...' : 'Thinking Process'}
          </span>
          {!isActive && durationSeconds && (
            <span className="text-xs text-[var(--text-muted)] font-mono">
              ({durationSeconds.toFixed(1)}s)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <span>{isExpanded ? 'Hide' : 'Show reasoning'}</span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-main)]/50">
          <div className="pl-3 border-l-2 border-[var(--accent)]/40 font-mono text-[13px] text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
            {thinking || 'Evaluating context and analyzing prompt constraints...'}
            {isActive && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--accent)] animate-pulse align-middle" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
