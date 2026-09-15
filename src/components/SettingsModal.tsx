import React, { useState } from 'react';
import { UserSettings } from '../types';
import {
  BookOpen,
  Check,
  Code,
  ExternalLink,
  Globe,
  GraduationCap,
  Key,
  Layers,
  Moon,
  Palette,
  Search,
  ShieldCheck,
  Sliders,
  Sun,
  User,
  X,
  Zap,
  Maximize2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  initialTab?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  initialTab = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [userName, setUserName] = useState(settings.userName);
  const [customInstructions, setCustomInstructions] = useState(settings.customInstructions);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateSettings({
      userName: userName.trim() || 'Student',
      customInstructions: customInstructions.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-2xl max-h-[96dvh] sm:max-h-[90vh] bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--bg-sidebar)] gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-xs shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold truncate">Settings & Academic Documentation</h3>
              <p className="text-[11px] sm:text-xs text-[var(--text-muted)] truncate">
                Preferences, personalization, and viva defense rationale
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border)] px-3 sm:px-6 bg-[var(--bg-main)] text-xs font-medium overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('personalization')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'personalization'
                ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personalization</span>
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'model'
                ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Model & Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'viva'
                ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-[var(--accent)] font-semibold">Viva Defense Notes</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                  Theme Appearance
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      settings.theme === 'light'
                        ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-xs font-semibold">Light Mode</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Warm cream #F5F4EF</span>
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      settings.theme === 'dark'
                        ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-xs font-semibold">Dark Mode</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Warm charcoal #2B2925</span>
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ theme: 'system' })}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      settings.theme === 'system'
                        ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] ring-1 ring-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                    <span className="text-xs font-semibold">System</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Follow OS preference</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-2xs">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                        Focus Mode (Distraction-Free Writing)
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Hides sidebar and artifact panel to maximize chat space
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.focusMode}
                    onClick={() => onUpdateSettings({ focusMode: !settings.focusMode })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 ${
                      settings.focusMode ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                    }`}
                    title={settings.focusMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        settings.focusMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Maximizes the conversation and input bar by temporarily collapsing the sidebar navigation and artifact panel. Ideal for deep thinking, long-form drafting, and reading extended research analysis.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] space-y-2">
                <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                  Warm Neutral Color System
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Unlike traditional chatbots that use cold blue and pure white, this prototype implements
                  Anthropic Claude's eye-friendly terracotta (<code className="text-xs text-[var(--accent)]">#C96442</code>)
                  and cream (<code className="text-xs">#F5F4EF</code>) design language for reduced eye strain during extended reading.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'personalization' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  What should Claude call you?
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your Name (e.g., Rehan)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Custom Instructions & Preferences
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Focus on academic depth in Computer Science & Machine Learning, provide math derivations in LaTeX, and generate interactive components in artifacts."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] resize-y"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  These instructions guide all newly generated responses and thinking traces.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-[var(--success)] font-medium">
                  {savedSuccess && 'Preferences saved successfully!'}
                </div>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-xs transition-colors shadow-xs"
                >
                  Save Personalization
                </button>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  AI Model Backend
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'claude-3-7-sonnet',
                      name: 'Claude 3.7 Sonnet (Hybrid Architecture)',
                      desc: 'Supports dynamic reasoning tokens, side-canvas artifacts, and rapid multi-turn chat',
                    },
                    {
                      id: 'gemini-3.1-flash',
                      name: 'Gemini 3.1 Flash (Ultra-Responsive & Efficient)',
                      desc: 'Sub-second response engine answering anything and everything with zero lag',
                    },
                    {
                      id: 'gemini-3.5-flash',
                      name: 'Gemini 3.5 Flash (Deep Analytical Reasoning)',
                      desc: 'Advanced reasoning for STEM, algorithms, complex math, and deep architectural design',
                    },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onUpdateSettings({ selectedModel: m.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                        settings.selectedModel === m.id
                          ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--text-primary)]'
                          : 'border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-[var(--text-primary)]">{m.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{m.desc}</div>
                      </div>
                      {settings.selectedModel === m.id && (
                        <Check className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Web Grounding & Website Integration Toggle */}
              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-blue-500 shadow-2xs">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                        Live Web Grounding & Website Integration
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Real-time search indexing and website information gathering
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.webSearchEnabled}
                    onClick={() =>
                      onUpdateSettings({ webSearchEnabled: !settings.webSearchEnabled })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 ${
                      settings.webSearchEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                    }`}
                    title={settings.webSearchEnabled ? 'Disable Web Grounding' : 'Enable Web Grounding'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        settings.webSearchEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Enables Google Search grounding and automated website content scraping. When clients ask queries or provide links to websites, the chatbot extracts live webpage text, cross-references sources, and cites verified URLs.
                </p>
              </div>

              {/* Customer Assistance & Resolution Mode */}
              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-emerald-600 shadow-2xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                        Customer Assistance & Query Resolution
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Optimized prompt solving, policy verification & customer support
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.customerAssistanceMode}
                    onClick={() =>
                      onUpdateSettings({ customerAssistanceMode: !settings.customerAssistanceMode })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 ${
                      settings.customerAssistanceMode ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                    }`}
                    title={settings.customerAssistanceMode ? 'Disable Customer Mode' : 'Enable Customer Mode'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        settings.customerAssistanceMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Structures answers for customer support, shipping, refund policies, technical troubleshooting, and product recommendations with clear resolution checklists and interactive customer support portals.
                </p>
              </div>

              {/* API Keys & Quotas Notice */}
              <div className="p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                    API Keys, Quotas & Rate Limits
                  </h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Gemini API calls are securely proxied server-side. If you encounter a <code className="text-xs bg-[var(--bg-card)] px-1 py-0.5 rounded border border-[var(--border)]">RESOURCE_EXHAUSTED (429)</code> error on the free tier, selecting a billing-enabled API key in the AI Studio platform <strong>Settings &gt; Secrets</strong> panel increases your quotas and rate limits. The application also automatically falls back to an intelligent local reasoning engine so responses never crash.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'viva' && (
            <div className="space-y-4 leading-relaxed text-xs">
              <div className="p-4 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-border)] text-[var(--text-primary)] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm text-[var(--accent)]">
                  <GraduationCap className="w-4 h-4" />
                  <span>Academic Defense Guide (B.Tech CSE / AI & ML)</span>
                </div>
                <p className="text-xs">
                  Here is the exact rationale and design justification prepared for your viva or demo presentation:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-main)]">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                    1. Why a warm neutral palette instead of stark white/blue?
                  </h4>
                  <p className="text-[var(--text-secondary)]">
                    Most chatbots (ChatGPT, Copilot, Gemini) default to cool blue/gray palettes. Claude deliberately
                    chose a warm editorial palette (<code className="text-[var(--accent)]">#F5F4EF</code> cream canvas,
                    <code className="text-[var(--accent)]">#C96442</code> terracotta accent) based on optical ergonomics.
                    Warm hues reduce digital eye strain during prolonged reading of multi-page technical responses and establish
                    a distinctive literary warmth.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-main)]">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                    2. Why do AI messages have no chat bubble?
                  </h4>
                  <p className="text-[var(--text-secondary)]">
                    This is a deliberate <strong>content hierarchy decision</strong>. In Claude's UX philosophy, the AI's
                    synthesized response is the primary reading document, not a transient text bubble. Giving user prompts
                    a subtle background card (<code className="text-[var(--accent)]">#F0EAE2</code>) positions them as navigational
                    inputs, while the AI's content flows naturally on the canvas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-main)]">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                    3. The Artifacts Split-Canvas Architecture
                  </h4>
                  <p className="text-[var(--text-secondary)]">
                    Instead of dumping multi-hundred line code blocks inline (which breaks reading flow), substantial
                    deliverables (interactive HTML widgets, Python algorithms, technical documentation) trigger a
                    split-pane side canvas (~48% viewport). This demonstrates advanced state management, isolated sandboxed
                    execution via <code className="text-[var(--accent)]">&lt;iframe sandbox&gt;</code>, and bidirectional
                    code inspection.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-main)]">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                    4. Reasoning & Thinking Transparency
                  </h4>
                  <p className="text-[var(--text-secondary)]">
                    Modern LLMs (Claude 3.7 Sonnet, Gemini Thinking) produce step-by-step internal reasoning traces.
                    This prototype replicates the collapsible <code className="text-[var(--accent)]">&lt;thinking&gt;</code>
                    indicator with elapsed timing, providing explainable AI (XAI) transparency into problem decomposition.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-sidebar)] flex items-center justify-between text-xs text-[var(--text-muted)] shrink-0">
          <span>B.Tech CSE Academic Prototype • Original Implementation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
