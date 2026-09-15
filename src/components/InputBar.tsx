import React, { useRef, useEffect, useState } from 'react';
import { Attachment } from '../types';
import {
  ArrowUp,
  ChevronDown,
  Globe,
  Link,
  Mic,
  MicOff,
  Paperclip,
  Plus,
  Square,
  X,
  Sparkles,
  Zap,
  Brain,
} from 'lucide-react';

interface InputBarProps {
  appName?: string;
  isGenerating: boolean;
  onSend: (text: string, attachments: Attachment[], mode: string, urls?: string[]) => void;
  onStop: () => void;
  selectedMode: string;
  onChangeMode: (mode: string) => void;
  webSearchEnabled?: boolean;
  onToggleWebSearch?: () => void;
  onOpenMediaStudio?: (mode?: 'image' | 'video') => void;
}

export const InputBar: React.FC<InputBarProps> = ({
  appName = 'Clarity AI',
  isGenerating,
  onSend,
  onStop,
  selectedMode,
  onChangeMode,
  webSearchEnabled = true,
  onToggleWebSearch,
  onOpenMediaStudio,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea up to ~8 lines (approx 190px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 190)}px`;
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAddUrl = () => {
    let clean = tempUrl.trim();
    if (!clean) return;
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    if (!urls.includes(clean)) {
      setUrls((prev) => [...prev, clean]);
    }
    setTempUrl('');
    setShowUrlInput(false);
  };

  const removeUrl = (urlToRemove: string) => {
    setUrls((prev) => prev.filter((u) => u !== urlToRemove));
  };

  const handleSubmit = () => {
    if (isGenerating) {
      onStop();
      return;
    }
    if (!inputText.trim() && attachments.length === 0 && urls.length === 0) return;

    onSend(inputText.trim(), attachments, selectedMode, urls);
    setInputText('');
    setAttachments([]);
    setUrls([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle file uploads (images, code files, docs)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          id: 'att-' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || 'text/plain',
          dataUrl: event.target?.result as string,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Voice recording toggle with Web Speech API or simulated speech recognition
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } catch (err) {
        simulateVoiceInput();
      }
    } else {
      simulateVoiceInput();
    }
  };

  const simulateVoiceInput = () => {
    setIsRecording(true);
    setTimeout(() => {
      const demoPhrases = [
        'How does backpropagation work in deep neural networks?',
        'Can you generate an interactive React simulation for data structures?',
        'What are the key architectural improvements in FlashAttention?',
      ];
      const randomPhrase = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
      setInputText((prev) => (prev ? `${prev} ${randomPhrase}` : randomPhrase));
      setIsRecording(false);
    }, 2000);
  };

  const modes = [
    {
      id: 'fast',
      label: 'Fast',
      description: 'Quick responses with minimal latency',
      icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'balanced',
      label: 'Balanced',
      description: 'Well-rounded reasoning & comprehensive explanations',
      icon: <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />,
    },
    {
      id: 'extended',
      label: 'Extended Thinking',
      description: 'Deep multi-step reasoning trace with artifacts',
      icon: <Brain className="w-3.5 h-3.5 text-purple-500" />,
    },
  ];

  const currentModeObj = modes.find((m) => m.id === selectedMode) || modes[1];

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 pb-2 sm:pb-4 pb-safe">
      {/* File attachment and website URL preview chips */}
      {(attachments.length > 0 || urls.length > 0) && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 px-1">
          {/* Website URLs */}
          {urls.map((u) => (
            <div
              key={u}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 shadow-xs animate-in fade-in"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="max-w-[140px] sm:max-w-[170px] truncate font-medium">{u}</span>
              <button
                onClick={() => removeUrl(u)}
                className="p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition-colors"
                title="Remove website"
                aria-label="Remove website"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Attachments */}
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-[var(--bg-user-bubble)] border border-[var(--border)] text-xs text-[var(--text-primary)] shadow-xs animate-in fade-in"
            >
              {att.dataUrl && att.type.startsWith('image/') ? (
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="w-5 h-5 object-cover rounded"
                />
              ) : (
                <Paperclip className="w-3.5 h-3.5 text-[var(--accent)]" />
              )}
              <span className="max-w-[120px] sm:max-w-[150px] truncate font-medium">{att.name}</span>
              <span className="text-[var(--text-muted)] text-[10px]">({att.size})</span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 rounded hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                title="Remove attachment"
                aria-label="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xs hover:border-[var(--accent)]/60 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask anything, solve customer queries, or enter website URLs...`}
          rows={1}
          className="w-full pt-3 pb-2 px-3 sm:px-4 bg-transparent border-0 resize-none text-[14.5px] sm:text-[15px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none max-h-48"
        />

        {/* Action bar inside input box */}
        <div className="flex items-center justify-between px-2 sm:px-3 pb-2 pt-0.5 gap-1">
          {/* Left tools: Attachment, Add Website URL, Web Grounding toggle, Media Studio */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink min-w-0 overflow-x-auto no-scrollbar py-0.5">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] shrink-0"
              title="Attach files or images"
              aria-label="Attach files or images"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Add Website URL Button & Popover */}
            <div className="relative shrink-0">
              <button
                onClick={() => {
                  setShowUrlInput(!showUrlInput);
                  setTimeout(() => urlInputRef.current?.focus(), 50);
                }}
                className={`p-1.5 sm:p-2 rounded-xl transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
                  urls.length > 0 || showUrlInput
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                }`}
                title="Integrate live website URL"
                aria-label="Integrate live website URL"
              >
                <Link className="w-4 h-4" />
              </button>

              {showUrlInput && (
                <div className="absolute left-0 bottom-full mb-2 z-40 w-72 max-w-[calc(100vw-2rem)] p-2.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl animate-in fade-in">
                  <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-1.5 flex items-center justify-between">
                    <span>Integrate Website URL</span>
                    <button
                      onClick={() => setShowUrlInput(false)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={urlInputRef}
                      type="url"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                      placeholder="https://example.com/docs..."
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      onClick={handleAddUrl}
                      disabled={!tempUrl.trim()}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-medium disabled:opacity-40 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1.5">
                    Extracts live page content to answer customer queries.
                  </div>
                </div>
              )}
            </div>

            {/* Web Search & Grounding Quick Toggle */}
            {onToggleWebSearch && (
              <button
                onClick={onToggleWebSearch}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  webSearchEnabled
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent'
                }`}
                title={
                  webSearchEnabled
                    ? 'Live Web Integration active (searches web & extracts live websites)'
                    : 'Web Search disabled (click to enable)'
                }
                aria-label="Toggle web integration"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Web Grounding</span>
              </button>
            )}

            {/* Media Studio (Image & Video Generation) */}
            {onOpenMediaStudio && (
              <button
                type="button"
                onClick={() => onOpenMediaStudio('image')}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-medium text-[var(--accent)] bg-[var(--accent-light)] hover:bg-[var(--accent)]/20 border border-[var(--accent)]/25 transition-all shadow-2xs shrink-0"
                title="Generate images with Gemini and videos with Veo 3.1"
                aria-label="Open Media Studio"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="font-semibold hidden sm:inline">Media Studio</span>
                <span className="font-semibold sm:hidden text-[11px]">Studio</span>
              </button>
            )}
          </div>

          {/* Right tools: Mode dropdown, Mic, Send */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mode selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-card-hover)] text-xs text-[var(--text-secondary)] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                aria-expanded={showModeMenu}
                title="Select reasoning mode"
              >
                {currentModeObj.icon}
                <span className="hidden md:inline">{currentModeObj.label}</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>

              {showModeMenu && (
                <div className="absolute right-0 bottom-full mb-2 z-30 w-56 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl p-1.5 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Model Reasoning Mode
                  </div>
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        onChangeMode(mode.id);
                        setShowModeMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                        selectedMode === mode.id
                          ? 'bg-[var(--accent-light)] border border-[var(--accent-border)]'
                          : 'hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      <div className="mt-0.5">{mode.icon}</div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--text-primary)]">
                          {mode.label}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {mode.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Input Microphone */}
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-xl transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent)] ${
                isRecording
                  ? 'bg-[var(--error)]/10 text-[var(--error)] animate-pulse'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
              }`}
              title={isRecording ? 'Listening... click to stop' : 'Voice input'}
              aria-label={isRecording ? 'Listening... click to stop' : 'Voice input'}
            >
              {isRecording ? <MicOff className="w-4 h-4 text-[var(--error)]" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send / Stop Button */}
            {isGenerating ? (
              <button
                onClick={onStop}
                className="w-8 h-8 rounded-full bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                title="Stop generating"
                aria-label="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() && attachments.length === 0}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  inputText.trim() || attachments.length > 0
                    ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm hover:scale-105'
                    : 'bg-[var(--border)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper disclaimer text */}
      <div className="text-center text-[11.5px] text-[var(--text-muted)] mt-2 select-none">
        {appName} is an academic prototype. Responses may contain errors. Verify important information.
      </div>
    </div>
  );
};
