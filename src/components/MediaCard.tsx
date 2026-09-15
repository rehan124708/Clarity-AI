import React, { useState, useRef } from 'react';
import { GeneratedMedia, ArtifactData } from '../types';
import {
  Download,
  Maximize2,
  Sparkles,
  Film,
  Image as ImageIcon,
  Play,
  Pause,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface MediaCardProps {
  media: GeneratedMedia;
  onOpenAsArtifact?: (artifact: ArtifactData) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ media, onOpenAsArtifact }) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(media.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenArtifact = () => {
    if (onOpenAsArtifact) {
      onOpenAsArtifact({
        id: media.id,
        identifier: `media-${media.id}`,
        title: media.type === 'image' ? 'Gemini Generated Image' : 'Veo Generated Video',
        type: media.type,
        content: media.url,
        mediaUrl: media.url,
        prompt: media.prompt,
        aspectRatio: media.aspectRatio,
        version: 1,
      });
    }
  };

  const isImage = media.type === 'image';

  return (
    <div className="my-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs overflow-hidden max-w-xl transition-all hover:border-[var(--accent)]/50">
      {/* Media Header */}
      <div className="px-3.5 py-2.5 bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
            {isImage ? <ImageIcon className="w-3.5 h-3.5" /> : <Film className="w-3.5 h-3.5" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <span>{isImage ? 'Gemini 3.1 Vision' : 'Google Veo 3.1'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-normal bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-muted)]">
                {media.aspectRatio || '1:1'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyPrompt}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
            title="Copy prompt"
            aria-label="Copy prompt"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <a
            href={media.url}
            download={isImage ? `gemini-image-${Date.now()}.png` : `veo-video-${Date.now()}.mp4`}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
            title={isImage ? 'Download PNG' : 'Download MP4'}
          >
            <Download className="w-3.5 h-3.5" />
          </a>

          {onOpenAsArtifact && (
            <button
              onClick={handleOpenArtifact}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
              title="Open in side canvas"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Canvas</span>
            </button>
          )}
        </div>
      </div>

      {/* Media Canvas Body */}
      <div className="relative bg-black/5 dark:bg-black/50 flex items-center justify-center overflow-hidden min-h-[220px] max-h-[380px]">
        {isImage ? (
          <img
            src={media.url}
            alt={media.prompt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain max-h-[380px] select-none"
            onClick={handleOpenArtifact}
          />
        ) : (
          <video
            ref={videoRef}
            src={media.url}
            controls
            autoPlay
            loop
            className="w-full h-full object-contain max-h-[380px]"
          />
        )}
      </div>

      {/* Prompt Footer */}
      <div className="px-3.5 py-2.5 bg-[var(--bg-card)] border-t border-[var(--border-subtle)]">
        <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed line-clamp-2">
          &ldquo;{media.prompt}&rdquo;
        </p>
      </div>
    </div>
  );
};
