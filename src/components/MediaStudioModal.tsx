import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  Play,
  Pause,
  Maximize2,
  RefreshCw,
  Sliders,
  Wand2,
  Send,
  Upload,
  Layers,
  Film,
  Check,
  AlertCircle,
} from 'lucide-react';
import { GeneratedMedia } from '../types';

interface MediaStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertMediaToChat?: (media: GeneratedMedia, textPrompt: string) => void;
  initialMode?: 'image' | 'video';
  initialPrompt?: string;
  initialImageBase64?: string;
}

export const MediaStudioModal: React.FC<MediaStudioModalProps> = ({
  isOpen,
  onClose,
  onInsertMediaToChat,
  initialMode = 'image',
  initialPrompt = '',
  initialImageBase64,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>(initialMode);
  
  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState(initialPrompt);
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [imageResolution, setImageResolution] = useState<'1K' | '2K'>('1K');
  const [imageStyle, setImageStyle] = useState('Photorealistic');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ model: string; prompt: string } | null>(null);

  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [videoSourceImage, setVideoSourceImage] = useState<string | null>(initialImageBase64 || null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Preset styles
  const stylePresets = [
    { name: 'Photorealistic', desc: 'True-to-life 8k studio lighting' },
    { name: 'Cinematic', desc: 'Anamorphic widescreen, dramatic contrast' },
    { name: 'Anime & Manga', desc: 'Vibrant cel-shaded Japanese digital art' },
    { name: 'Cyberpunk Neon', desc: 'Rain-slicked streets & holographic glow' },
    { name: 'Warm Watercolor', desc: 'Soft pastel washes and textured paper' },
    { name: 'Architectural 3D', desc: 'Minimalist clean render with ray-tracing' },
  ];

  // Video motion presets
  const motionPresets = [
    'Cinematic slow pan across the scene',
    'Dynamic aerial drone flythrough with soft parallax',
    'Hypnotic continuous time-lapse with shifting light',
    'Gentle atmospheric breeze with subtle particles',
  ];

  // Generate Image Handler
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setStatusMessage('Rendering high-fidelity imagery via Gemini Vision...');
    try {
      const fullPrompt = `${imagePrompt.trim()}, ${imageStyle} style, master quality, ultra-detailed`;
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio: imageAspectRatio,
          imageSize: imageResolution,
          style: imageStyle,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.url) {
        setGeneratedImage(data.url);
        setImageMeta({
          model: data.modelUsed || 'gemini-3.1-flash-image',
          prompt: imagePrompt,
        });
        setStatusMessage('Image generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      setStatusMessage(`Notice: ${err?.message || 'Using generative synthesis'}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Generate Video Handler
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() && !videoSourceImage) return;
    if (isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setVideoProgress(15);
    setStatusMessage('Initializing Google Veo 3.1 neural video engine...');

    try {
      const payload: any = {
        prompt: videoPrompt.trim() || 'A high-definition cinematic video sequence',
        aspectRatio: videoAspectRatio,
        resolution: videoResolution,
      };

      if (videoSourceImage) {
        payload.imageBase64 = videoSourceImage.replace(/^data:image\/[a-z]+;base64,/, '');
      }

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to start video operation');
      const data = await res.json();

      const operationName = data.operationName;
      if (!operationName) throw new Error('No operation name received');

      // Poll for completion
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        setVideoProgress((prev) => Math.min(prev + 12, 92));
        setStatusMessage(`Synthesizing motion keyframes (step ${attempts}/8)...`);

        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });
          const statusData = await statusRes.json();

          if (statusData.done) {
            clearInterval(pollInterval);
            setVideoProgress(100);
            setIsGeneratingVideo(false);
            setGeneratedVideoUrl(statusData.videoUrl || `/api/video-stream?op=${encodeURIComponent(operationName)}`);
            setStatusMessage('Veo 3.1 video ready!');
          }
        } catch (pollErr) {
          console.warn('Polling error:', pollErr);
        }

        if (attempts > 30) {
          clearInterval(pollInterval);
          setIsGeneratingVideo(false);
          setStatusMessage('Generation timed out. Please try again.');
        }
      }, 1500);
    } catch (err: any) {
      console.error('Video error:', err);
      setIsGeneratingVideo(false);
      setStatusMessage(`Video error: ${err?.message || 'Failed to generate'}`);
    }
  };

  // Convert current generated image to video source
  const handleAnimateImageToVideo = () => {
    if (!generatedImage) return;
    setVideoSourceImage(generatedImage);
    setActiveTab('video');
    if (!videoPrompt) {
      setVideoPrompt(`Animate this scene with realistic motion and smooth cinematic camera work: ${imagePrompt}`);
    }
  };

  // Insert generated media into the conversation
  const handleInsertMedia = () => {
    if (!onInsertMediaToChat) return;

    if (activeTab === 'image' && generatedImage) {
      const mediaItem: GeneratedMedia = {
        id: `img-${Date.now()}`,
        type: 'image',
        url: generatedImage,
        prompt: imagePrompt,
        aspectRatio: imageAspectRatio,
        model: imageMeta?.model || 'gemini-3.1-flash-image',
        resolution: imageResolution,
        status: 'ready',
        createdAt: Date.now(),
      };
      onInsertMediaToChat(mediaItem, `Here is the generated image for: "${imagePrompt}"`);
      onClose();
    } else if (activeTab === 'video' && generatedVideoUrl) {
      const mediaItem: GeneratedMedia = {
        id: `vid-${Date.now()}`,
        type: 'video',
        url: generatedVideoUrl,
        prompt: videoPrompt,
        aspectRatio: videoAspectRatio,
        model: 'veo-3.1-lite-generate-preview',
        resolution: videoResolution,
        status: 'ready',
        createdAt: Date.now(),
      };
      onInsertMediaToChat(mediaItem, `Here is the generated video for: "${videoPrompt}"`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96dvh] sm:max-h-[90vh]">
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between bg-[var(--bg-card)] shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--accent)] to-[#E8A87C] text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                <span>Clarity Media Studio</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20">
                  Gemini & Veo 3.1
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)] truncate sm:whitespace-normal">
                Next-generation photorealistic image synthesis & cinematic video generation
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
            {/* Tab switchers */}
            <div className="flex bg-[var(--bg-main)] p-1 rounded-xl border border-[var(--border)] text-xs font-medium">
              <button
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'image'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image Gen</span>
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'video'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5" />
                <span>Video (Veo)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          {/* Controls Column (Left) */}
          <div className="md:col-span-6 space-y-4">
            {activeTab === 'image' ? (
              <>
                {/* Image Prompt */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center justify-between">
                    <span>Creative Prompt</span>
                    <span className="text-[11px] text-[var(--accent)] font-normal flex items-center gap-1">
                      <Wand2 className="w-3 h-3" /> Gemini 3.1 Flash Image
                    </span>
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="E.g., A futuristic glass greenhouse in a misty cedar forest at dawn, cinematic lighting, 8k..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: '1:1', label: '1:1 Square' },
                      { id: '16:9', label: '16:9 Wide' },
                      { id: '9:16', label: '9:16 Reel' },
                      { id: '4:3', label: '4:3 Classic' },
                      { id: '3:4', label: '3:4 Tall' },
                    ].map((ar) => (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setImageAspectRatio(ar.id as any)}
                        className={`py-2 px-1 text-center rounded-xl border text-[11px] font-medium transition-all ${
                          imageAspectRatio === ar.id
                            ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                            : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                        }`}
                      >
                        {ar.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Presets */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Artistic Style Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {stylePresets.map((st) => (
                      <button
                        key={st.name}
                        type="button"
                        onClick={() => setImageStyle(st.name)}
                        className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                          imageStyle === st.name
                            ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--text-primary)]'
                            : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                        }`}
                      >
                        <div className="font-semibold text-xs text-[var(--text-primary)]">{st.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={!imagePrompt.trim() || isGeneratingImage}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-medium text-sm transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {isGeneratingImage ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Image...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Generate Image</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Video Tab Controls */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center justify-between">
                    <span>Motion / Video Prompt</span>
                    <span className="text-[11px] text-[var(--accent)] font-normal flex items-center gap-1">
                      <Film className="w-3 h-3" /> Google Veo 3.1 Lite
                    </span>
                  </label>
                  <textarea
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="Describe the motion, camera action, or animation you want Veo to render..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Image-to-Video Source */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center justify-between">
                    <span>Source Starting Frame (Optional)</span>
                    {videoSourceImage && (
                      <button
                        onClick={() => setVideoSourceImage(null)}
                        className="text-[11px] text-[var(--error)] hover:underline"
                      >
                        Remove Image
                      </button>
                    )}
                  </label>
                  {videoSourceImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-[var(--border)] max-h-36 bg-black flex items-center justify-center">
                      <img src={videoSourceImage} alt="Starting frame" className="max-h-36 object-contain" />
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
                        Initial Frame
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-[var(--border)] hover:border-[var(--accent)] rounded-xl p-4 text-center cursor-pointer bg-[var(--bg-card)] transition-colors"
                    >
                      <Upload className="w-5 h-5 mx-auto text-[var(--text-muted)] mb-1" />
                      <div className="text-xs text-[var(--text-primary)] font-medium">Upload Image to Animate</div>
                      <div className="text-[11px] text-[var(--text-muted)]">PNG, JPG or WebP (max 5MB)</div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setVideoSourceImage(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Video Aspect Ratio & Camera Presets */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['16:9', '9:16'].map((ar) => (
                        <button
                          key={ar}
                          type="button"
                          onClick={() => setVideoAspectRatio(ar as any)}
                          className={`py-2 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                            videoAspectRatio === ar
                              ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                              : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                          }`}
                        >
                          {ar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Resolution
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['720p', '1080p'].map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setVideoResolution(res as any)}
                          className={`py-2 px-2 text-center rounded-xl border text-xs font-medium transition-all ${
                            videoResolution === res
                              ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] font-semibold'
                              : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Motion Shortcuts */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Camera Motion Presets
                  </label>
                  <div className="space-y-1.5">
                    {motionPresets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setVideoPrompt(p)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] truncate transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Video Button */}
                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={(!videoPrompt.trim() && !videoSourceImage) || isGeneratingVideo}
                  className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-medium text-sm transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {isGeneratingVideo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Video ({videoProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Film className="w-4 h-4" />
                      <span>Generate Veo Video</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* Status notice */}
            {statusMessage && (
              <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate">{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Preview Column (Right) */}
          <div className="md:col-span-6 flex flex-col items-center justify-center border border-[var(--border)] rounded-2xl bg-[var(--bg-card)] p-4 min-h-[360px] relative overflow-hidden">
            {activeTab === 'image' ? (
              generatedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="relative max-h-[380px] w-full flex items-center justify-center rounded-xl overflow-hidden bg-black/20 border border-[var(--border)]">
                    <img
                      src={generatedImage}
                      alt={imagePrompt}
                      className="max-h-[360px] max-w-full object-contain rounded-lg shadow-md"
                    />
                  </div>
                  
                  {/* Actions under image */}
                  <div className="w-full flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={handleAnimateImageToVideo}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
                    >
                      <Film className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Animate with Veo</span>
                    </button>

                    <a
                      href={generatedImage}
                      download={`clarity-image-${Date.now()}.png`}
                      className="p-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-primary)] transition-colors"
                      title="Download PNG"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {onInsertMediaToChat && (
                      <button
                        onClick={handleInsertMedia}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-xs transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-[var(--text-muted)] space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--accent)]">
                    <ImageIcon className="w-8 h-8 opacity-60" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Image Canvas Ready</h3>
                  <p className="text-xs max-w-xs mx-auto">
                    Type a prompt on the left and select an aspect ratio to render with Gemini Vision.
                  </p>
                </div>
              )
            ) : generatedVideoUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="relative max-h-[380px] w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-[360px] max-w-full rounded-lg"
                  />
                </div>

                <div className="w-full flex items-center justify-between gap-2 pt-1">
                  <a
                    href={generatedVideoUrl}
                    download={`clarity-veo-video-${Date.now()}.mp4`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
                  >
                    <Download className="w-4 h-4 text-[var(--accent)]" />
                    <span>Download MP4</span>
                  </a>

                  {onInsertMediaToChat && (
                    <button
                      onClick={handleInsertMedia}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold shadow-xs transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Chat</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-[var(--text-muted)] space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--accent)]">
                  <VideoIcon className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Veo 3.1 Video Canvas</h3>
                <p className="text-xs max-w-xs mx-auto">
                  Provide a motion prompt or attach an image to generate a high-definition video sequence.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
