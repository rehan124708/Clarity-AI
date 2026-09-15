import React from 'react';
import { ArtifactData } from '../types';
import { Code, ExternalLink, FileCode, FileText, Globe, Sparkles } from 'lucide-react';

interface ArtifactCardProps {
  artifact: ArtifactData;
  isOpen: boolean;
  onOpen: () => void;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, isOpen, onOpen }) => {
  const getIcon = () => {
    switch (artifact.type) {
      case 'html':
        return <Globe className="w-5 h-5 text-[#C96442]" />;
      case 'code':
        return <FileCode className="w-5 h-5 text-[#C96442]" />;
      case 'svg':
        return <Code className="w-5 h-5 text-[#C96442]" />;
      case 'markdown':
      default:
        return <FileText className="w-5 h-5 text-[#C96442]" />;
    }
  };

  const getTypeLabel = () => {
    switch (artifact.type) {
      case 'html':
        return 'Interactive App';
      case 'code':
        return artifact.language ? `${artifact.language.toUpperCase()} Script` : 'Code File';
      case 'svg':
        return 'Vector Graphic';
      case 'markdown':
      default:
        return 'Document';
    }
  };

  return (
    <div
      onClick={onOpen}
      className={`my-3 p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
        isOpen
          ? 'border-[var(--accent)] bg-[var(--accent-light)] ring-1 ring-[var(--accent)]'
          : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] hover:shadow-sm'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Open artifact ${artifact.title}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-[var(--bg-user-bubble)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {artifact.title}
            </h4>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--border-subtle)] text-[var(--text-secondary)] shrink-0">
              {getTypeLabel()}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
            {isOpen ? 'Currently open in right panel' : 'Click to view artifact in side canvas'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] shrink-0 ml-3">
        <span>{isOpen ? 'Active' : 'Open'}</span>
        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
};
