import React, { useState } from 'react';
import { ArtifactData } from '../types';
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  Download,
  Eye,
  ExternalLink,
  History,
  Maximize2,
  RotateCcw,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ArtifactPanelProps {
  artifact: ArtifactData | null;
  onClose: () => void;
  onUpdateVersion?: (version: number) => void;
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({
  artifact,
  onClose,
  onUpdateVersion,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>(
    artifact?.type === 'html' ||
      artifact?.type === 'markdown' ||
      artifact?.type === 'svg' ||
      artifact?.type === 'image' ||
      artifact?.type === 'video'
      ? 'preview'
      : 'code'
  );
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!artifact) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy artifact content: ', err);
    }
  };

  const handleDownload = () => {
    const extensions: Record<string, string> = {
      html: 'html',
      code: artifact.language === 'python' ? 'py' : artifact.language === 'javascript' ? 'js' : 'txt',
      markdown: 'md',
      svg: 'svg',
    };
    const ext = extensions[artifact.type] || 'txt';
    const filename = `${artifact.identifier || 'artifact'}.${ext}`;
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    let blobType = 'text/plain';
    if (artifact.type === 'html') blobType = 'text/html';
    else if (artifact.type === 'svg') blobType = 'image/svg+xml';
    else if (artifact.type === 'markdown') blobType = 'text/markdown';

    const blob = new Blob([artifact.content], { type: blobType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <aside
      className={`fixed inset-0 z-40 md:static md:z-10 flex flex-col bg-[var(--bg-main)] border-l border-[var(--border)] transition-all duration-300 ${
        isFullscreen ? 'md:fixed md:inset-0 md:z-50' : 'md:w-1/2 lg:w-[48%]'
      }`}
      aria-label="Artifact side panel"
    >
      {/* Header */}
      <header className="h-14 px-3 sm:px-4 border-b border-[var(--border)] bg-[var(--bg-sidebar)] flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            onClick={onClose}
            className="md:hidden p-2 -ml-1 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] shrink-0"
            title="Back to conversation"
            aria-label="Back to conversation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[200px]">
                {artifact.title}
              </h3>
              <span className="text-[10px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-[var(--border-subtle)] text-[var(--text-secondary)] uppercase tracking-wider shrink-0">
                {artifact.type}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[var(--text-muted)] font-mono truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
              {artifact.identifier}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Version Indicator */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
            <History className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="font-mono font-medium">v{artifact.version || 1}</span>
          </div>

          {/* Preview vs Code Toggle */}
          <div className="flex items-center p-0.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">Code</span>
            </button>
          </div>

          <div className="hidden xs:block h-4 w-px bg-[var(--border)] mx-0.5 sm:mx-1" />

          {/* Action buttons */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            title="Copy artifact content"
            aria-label="Copy artifact content"
          >
            {copied ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            title="Download file"
            aria-label="Download file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenInNewTab}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] hidden sm:block"
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] hidden md:block"
            title={isFullscreen ? 'Exit full width' : 'Full width'}
            aria-label={isFullscreen ? 'Exit full width' : 'Full width'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            title="Close artifact"
            aria-label="Close artifact"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-[var(--bg-main)]">
        {activeTab === 'preview' ? (
          <div className="h-full w-full">
            {artifact.type === 'html' ? (
              <iframe
                title={artifact.title}
                srcDoc={artifact.content}
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0 bg-white"
              />
            ) : artifact.type === 'svg' ? (
              <div
                className="h-full w-full flex items-center justify-center p-8 bg-white"
                dangerouslySetInnerHTML={{ __html: artifact.content }}
              />
            ) : artifact.type === 'image' ? (
              <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black/5 dark:bg-black/40">
                <div className="relative max-h-[80vh] max-w-full flex items-center justify-center rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg bg-black">
                  <img
                    src={artifact.mediaUrl || artifact.content}
                    alt={artifact.title}
                    referrerPolicy="no-referrer"
                    className="max-h-[75vh] max-w-full object-contain rounded-xl"
                  />
                </div>
                {artifact.prompt && (
                  <div className="mt-4 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-secondary)] max-w-lg text-center">
                    &ldquo;{artifact.prompt}&rdquo;
                  </div>
                )}
              </div>
            ) : artifact.type === 'video' ? (
              <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-black/10 dark:bg-black/60">
                <div className="relative max-h-[80vh] max-w-full rounded-2xl overflow-hidden border border-[var(--border)] shadow-xl bg-black">
                  <video
                    src={artifact.mediaUrl || artifact.content}
                    controls
                    autoPlay
                    loop
                    className="max-h-[75vh] max-w-full rounded-xl"
                  />
                </div>
                {artifact.prompt && (
                  <div className="mt-4 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-secondary)] max-w-lg text-center">
                    &ldquo;{artifact.prompt}&rdquo;
                  </div>
                )}
              </div>
            ) : artifact.type === 'markdown' ? (
              <div className="max-w-3xl mx-auto p-8 markdown-body">
                <ReactMarkdown>{artifact.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="p-6">
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] mb-4">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    Static Code Preview
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    This is a non-HTML script ({artifact.language || 'code'}). Switch to the{' '}
                    <strong>Code</strong> tab to inspect or copy the full source syntax.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#1E1D1A] text-[#EAE6DF] font-mono text-xs overflow-x-auto">
                  <pre>{artifact.content.slice(0, 1000)}</pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Code View with dark styling */
          <div className="h-full w-full bg-[#1E1D1A] text-[#EAE6DF] font-mono text-[13px] overflow-auto select-text p-4">
            <pre className="leading-relaxed">
              {artifact.content.split('\n').map((line, idx) => (
                <div key={idx} className="table-row">
                  <span className="table-cell pr-4 text-right select-none text-[#6E6A62] text-xs w-8">
                    {idx + 1}
                  </span>
                  <span className="table-cell">{line || ' '}</span>
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </aside>
  );
};
