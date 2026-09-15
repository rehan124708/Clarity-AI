import React, { useState, useEffect, useRef } from 'react';
import {
  Conversation,
  Message,
  ArtifactData,
  Attachment,
  UserSettings,
  Project,
  GeneratedMedia,
} from './types';
import { initialConversations, initialProjects } from './data/mockConversations';
import { parseClaudeResponse } from './utils/parser';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ArtifactPanel } from './components/ArtifactPanel';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import { ProjectModal } from './components/ProjectModal';
import { MediaStudioModal } from './components/MediaStudioModal';

export default function App() {
  // Local storage initializers
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('claude_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialConversations;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('claude_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialProjects;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-counter');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Artifact side-canvas state
  const [activeArtifact, setActiveArtifact] = useState<ArtifactData | null>(() => {
    // Default to the first conversation's interactive counter artifact
    const firstConv = initialConversations[0];
    const assistantMsg = firstConv?.messages.find((m) => m.artifact);
    return assistantMsg?.artifact || null;
  });
  const [isArtifactPanelOpen, setIsArtifactPanelOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Sidebar mobile drawer state (open by default on desktop >= 1024px)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Streaming state & abort controller
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reasoning mode: 'fast' | 'balanced' | 'extended'
  const [selectedMode, setSelectedMode] = useState<string>('balanced');

  // User Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('claude_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          theme: parsed.theme || 'light',
          userName: parsed.userName || 'Rehan',
          customInstructions:
            parsed.customInstructions ||
            'Focus on clear academic explanations, mathematical derivation where applicable, and clean interactive artifacts.',
          responseStyle: parsed.responseStyle || 'balanced',
          selectedModel: parsed.selectedModel || 'claude-3-7-sonnet',
          focusMode: parsed.focusMode ?? false,
          webSearchEnabled: parsed.webSearchEnabled ?? true,
          customerAssistanceMode: parsed.customerAssistanceMode ?? true,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      theme: 'light',
      userName: 'Rehan',
      customInstructions:
        'Focus on clear academic explanations, mathematical derivation where applicable, and clean interactive artifacts.',
      responseStyle: 'balanced',
      selectedModel: 'claude-3-7-sonnet',
      focusMode: false,
      webSearchEnabled: true,
      customerAssistanceMode: true,
    };
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('general');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMediaStudioOpen, setIsMediaStudioOpen] = useState(false);
  const [mediaStudioMode, setMediaStudioMode] = useState<'image' | 'video'>('image');

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('claude_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('claude_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('claude_settings', JSON.stringify(settings));
  }, [settings]);

  // Handle Theme switching & dynamic system preference changes
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        settings.theme === 'dark' || (settings.theme === 'system' && mediaQuery.matches);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const listener = () => {
      if (settings.theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [settings.theme]);

  const handleToggleTheme = () => {
    setSettings((prev) => {
      const isCurrentlyDark =
        prev.theme === 'dark' ||
        (prev.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      return {
        ...prev,
        theme: isCurrentlyDark ? 'light' : 'dark',
      };
    });
  };

  const handleToggleFocusMode = () => {
    setSettings((prev) => ({
      ...prev,
      focusMode: !prev.focusMode,
    }));
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Slash '/' for command palette if not in an input
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  // Handler: New Chat
  const handleNewChat = () => {
    const newId = 'conv-' + Math.random().toString(36).substring(2, 9);
    const newConv: Conversation = {
      id: newId,
      title: 'New conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      projectId: activeProjectId || undefined,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveArtifact(null);
    setIsArtifactPanelOpen(false);
  };

  // Handler: Delete Conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  // Handler: Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  // Handler: Pin/Unpin Conversation
  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Handler: Open Artifact in Side Canvas
  const handleOpenArtifact = (artifact: ArtifactData) => {
    setActiveArtifact(artifact);
    setIsArtifactPanelOpen(true);
  };

  // Handler: Send Message
  const handleSendMessage = async (
    text: string,
    attachments: Attachment[] = [],
    mode: string = selectedMode,
    urls: string[] = []
  ) => {
    let convId = activeConversationId;
    let currentConv = activeConversation;

    // If no active conversation or empty, create one
    if (!currentConv) {
      const newId = 'conv-' + Math.random().toString(36).substring(2, 9);
      const newConv: Conversation = {
        id: newId,
        title: text.slice(0, 36) || (urls.length > 0 ? urls[0] : 'New conversation'),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        projectId: activeProjectId || undefined,
        messages: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newId);
      convId = newId;
      currentConv = newConv;
    } else if (currentConv.messages.length === 0) {
      // Update title from first prompt
      handleRenameConversation(currentConv.id, text.slice(0, 38) || 'New conversation');
    }

    const userMessageId = 'msg-' + Math.random().toString(36).substring(2, 9);
    const userMessageText =
      urls.length > 0 && !text.includes(urls[0])
        ? `${text}${text.trim() ? '\n\n' : ''}[Integrated Websites]:\n${urls.map((u) => `- ${u}`).join('\n')}`
        : text;

    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      text: userMessageText,
      attachments: attachments.length > 0 ? attachments : undefined,
      websitesFetched: urls.length > 0 ? urls.map((u) => ({ url: u, title: u })) : undefined,
      timestamp: Date.now(),
    };

    const assistantMessageId = 'msg-' + Math.random().toString(36).substring(2, 9);
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      thinking: '',
      timestamp: Date.now(),
    };

    // Update conversation with user message and pending assistant message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...c.messages, userMessage, assistantMessage],
          };
        }
        return c;
      })
    );

    setIsStreaming(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const startTime = Date.now();
    let accumulatedText = '';
    let latestGrounding: any = null;
    let latestWebsites: any = null;
    let latestQuotaNotice = false;
    let latestFallbackNotice = false;

    try {
      const activeProject = projects.find((p) => p.id === currentConv?.projectId);
      const systemInstruction = [
        settings.customInstructions,
        activeProject ? `Project Context (${activeProject.name}): ${activeProject.customInstructions}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...currentConv.messages.map((m) => ({ role: m.role, content: m.text })),
            { role: 'user', content: userMessageText },
          ],
          model: settings.selectedModel,
          mode,
          systemInstruction,
          webSearch: settings.webSearchEnabled !== false,
          customerAssistanceMode: settings.customerAssistanceMode !== false,
          urls: urls.length > 0 ? urls : undefined,
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') continue;

          try {
            const data = JSON.parse(dataStr);

            if (data.quotaNotice) {
              latestQuotaNotice = true;
            }
            if (data.fallbackNotice) {
              latestFallbackNotice = true;
            }

            if (data.grounding) {
              latestGrounding = data.grounding;
            }
            if (data.websites) {
              latestWebsites = data.websites;
            }

            if (data.text) {
              accumulatedText += data.text;
              const parsed = parseClaudeResponse(accumulatedText);
              const duration = (Date.now() - startTime) / 1000;

              // Update assistant message state
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id === convId) {
                    const msgs = [...c.messages];
                    const lastIdx = msgs.findIndex((m) => m.id === assistantMessageId);
                    if (lastIdx !== -1) {
                      msgs[lastIdx] = {
                        ...msgs[lastIdx],
                        text: parsed.cleanText,
                        thinking: parsed.thinking,
                        thinkingDuration: duration,
                        artifact: parsed.artifact || undefined,
                        groundingSources: latestGrounding?.sources || msgs[lastIdx].groundingSources,
                        searchQueries: latestGrounding?.queries || msgs[lastIdx].searchQueries,
                        websitesFetched: latestWebsites || msgs[lastIdx].websitesFetched,
                        webSearchUsed: Boolean(latestGrounding || latestWebsites),
                        quotaNotice: latestQuotaNotice || msgs[lastIdx].quotaNotice,
                        fallbackNotice: latestFallbackNotice || msgs[lastIdx].fallbackNotice,
                      };
                    }
                    return { ...c, messages: msgs };
                  }
                  return c;
                })
              );

              // If an artifact was detected and completed, automatically open panel
              if (parsed.artifact && !parsed.artifact.id.includes('streaming')) {
                setActiveArtifact(parsed.artifact);
                setIsArtifactPanelOpen(true);
              }
            }
          } catch (e) {
            // ignore partial JSON parse errors during streaming
          }
        }
      }

      // Final synchronization for late-arriving grounding or website metadata
      if (latestGrounding || latestWebsites || latestQuotaNotice || latestFallbackNotice) {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === convId) {
              const msgs = [...c.messages];
              const lastIdx = msgs.findIndex((m) => m.id === assistantMessageId);
              if (lastIdx !== -1) {
                msgs[lastIdx] = {
                  ...msgs[lastIdx],
                  groundingSources: latestGrounding?.sources || msgs[lastIdx].groundingSources,
                  searchQueries: latestGrounding?.queries || msgs[lastIdx].searchQueries,
                  websitesFetched: latestWebsites || msgs[lastIdx].websitesFetched,
                  webSearchUsed: Boolean(latestGrounding || latestWebsites),
                  quotaNotice: latestQuotaNotice || msgs[lastIdx].quotaNotice,
                  fallbackNotice: latestFallbackNotice || msgs[lastIdx].fallbackNotice,
                };
              }
              return { ...c, messages: msgs };
            }
            return c;
          })
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.warn('API error, executing client fallback:', err?.message);
        // Seamless fallback to client simulator so prototype never displays a broken screen
        await executeClientFallbackStream(convId!, assistantMessageId, text, startTime);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Client-side fallback generator if backend stream is interrupted or offline
  const executeClientFallbackStream = async (
    convId: string,
    assistantMessageId: string,
    userQuery: string,
    startTime: number
  ) => {
    const lower = userQuery.toLowerCase();
    let thinking = `Deconstructing query: "${userQuery}"\nFormulating step-by-step technical response adhering to Claude's warm conversational and analytical standard.`;
    let responseText = `Here is a comprehensive solution tailored to your request.\n\n`;

    if (lower.includes('react') || lower.includes('widget') || lower.includes('counter') || lower.includes('interactive')) {
      thinking = `User is requesting an interactive React component. Designing an activity metric tracker with milestone alerts and state persistence. Packaging in an artifact for dual preview/code inspection.`;
      responseText = `I've created an interactive activity counter widget with real-time feedback and milestone alerts:

<artifact identifier="activity-metric-tracker" type="html" title="Interactive Metric Tracker">
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #F5F4EF; font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="p-6 flex flex-col items-center justify-center min-h-[400px]">
  <div class="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-[#E3E0D8] text-center">
    <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0EAE2] text-[#C96442] mb-3">Interactive Artifact</span>
    <h3 class="text-xl font-semibold text-[#2D2A26] mb-1">Activity Counter</h3>
    <p class="text-sm text-[#6B6660] mb-6">Real-time state tracking with milestone alerts.</p>
    
    <div id="countDisplay" class="text-5xl font-bold text-[#C96442] my-4 transition-all">0</div>
    
    <div class="flex items-center justify-center gap-3 mt-6">
      <button onclick="updateCount(-1)" class="w-12 h-12 rounded-xl border border-[#E3E0D8] bg-[#F5F4EF] hover:bg-[#EEECE3] text-xl font-bold text-[#2D2A26] transition-colors">-</button>
      <button onclick="resetCount()" class="px-4 h-12 rounded-xl border border-[#E3E0D8] text-xs font-semibold text-[#6B6660] hover:bg-[#F5F4EF] transition-colors">Reset</button>
      <button onclick="updateCount(1)" class="w-12 h-12 rounded-xl bg-[#C96442] hover:bg-[#B55838] text-xl font-bold text-white transition-colors">+</button>
    </div>
    <div id="status" class="text-xs text-[#7A9A76] mt-4 font-medium h-4"></div>
  </div>

  <script>
    let count = 0;
    function updateCount(diff) {
      count = Math.max(0, count + diff);
      const display = document.getElementById('countDisplay');
      display.innerText = count;
      display.style.transform = 'scale(1.15)';
      setTimeout(() => display.style.transform = 'scale(1)', 150);
      
      const status = document.getElementById('status');
      if (count > 0 && count % 5 === 0) {
        status.innerText = '🎉 Milestone reached: ' + count + ' units!';
      } else {
        status.innerText = '';
      }
    }
    function resetCount() {
      count = 0;
      document.getElementById('countDisplay').innerText = 0;
      document.getElementById('status').innerText = 'Counter reset';
      setTimeout(() => document.getElementById('status').innerText = '', 1500);
    }
  </script>
</body>
</html>
</artifact>

### Architectural Highlights
- **Encapsulated State**: Clean bounds checking with state transition hooks.
- **Micro-Interactions**: Fluid elastic bounce physics on active button taps.
- **Theme Consistency**: Matches the Claude warm neutral design system.`;
    } else if (lower.includes('pancake') || lower.includes('cook') || lower.includes('recipe') || lower.includes('food')) {
      thinking = `Analyzing cooking and recipe inquiry: "${userQuery}". Formulating scratch recipe with exact ingredient proportions, chemical leavening dynamics, and cooking tips.`;
      responseText = `Here is a foolproof, scratch gourmet recipe tailored to your request!

### Key Secrets for Perfect Results
1. **Never Overmix**: Whisk wet and dry ingredients just until combined. Visible lumps create pockets of air that make the final texture airy and light.
2. **Batter Rest**: Let batter rest for 8–10 minutes for starches to hydrate and baking powder to create micro-bubbles.
3. **Heat Control**: Use medium-low heat (~350°F / 175°C) so the center cooks through before the exterior browns.

### Ingredients
- **2 cups (250g)** All-purpose flour
- **2½ tsp** Baking powder & **½ tsp** Baking soda
- **2 tbsp** Sugar & **¾ tsp** Fine salt
- **1¾ cups** Milk or buttermilk
- **2** Large eggs & **4 tbsp** Melted butter
- **1 tsp** Pure vanilla extract

### Cooking Steps
1. Whisk dry ingredients in a large bowl.
2. Emulsify wet ingredients in a separate measuring jug.
3. Fold wet into dry until just incorporated (lumpy is good!). Let rest 10 minutes.
4. Cook on a greased griddle for ~2½ minutes until bubbles burst. Flip and cook for 90 seconds until golden brown.`;
    } else if (lower.includes('workout') || lower.includes('exercise') || lower.includes('fitness') || lower.includes('routine')) {
      thinking = `Analyzing fitness request: "${userQuery}". Building progressive bodyweight training split with sets, reps, and recovery advice.`;
      responseText = `Here is a high-efficiency 3-day full-body workout routine designed for beginners with no equipment needed:

### Weekly Schedule
- **Day 1: Upper-Body Push & Core**
  - Push-ups (regular or knee): 3 sets × 8–12 reps (rest 60s)
  - Chair Dips: 3 sets × 10 reps (rest 60s)
  - Forearm Plank: 3 sets × 30–45s (rest 45s)
- **Day 2: Lower-Body Strength & Mobility**
  - Bodyweight Squats: 3 sets × 15 reps (rest 60s)
  - Reverse Lunges: 3 sets × 10 reps/leg (rest 60s)
  - Glute Bridges: 3 sets × 15 reps (hold 2s at top)
- **Day 3: Pull & Posterior Chain**
  - Doorway Rows: 3 sets × 10 reps (rest 60s)
  - Superman Extensions: 3 sets × 12 reps (rest 45s)
  - Dead-bug Core Holds: 3 sets × 12 alternating reps

### Recovery & Nutrition Rules
- Drink 500ml water upon waking and stay hydrated throughout the day.
- Target 7–8 hours of quality sleep for muscle recovery.`;
    } else {
      thinking = `Analyzing prompt: "${userQuery}"\nEvaluating context, core objectives, and actionable next steps with Claude's standard of clear, high-density insight.`;
      responseText = `Here is a clear, thorough answer to your query:

### 1. Core Principles
- **Direct Answer**: Addressing the exact intent and constraints of your prompt with practical, actionable information.
- **Context & Verification**: Providing structured clarity so you can immediately put this knowledge to use.

### 2. Practical Execution Steps
1. **Define Objective**: Clarify the specific outcome or milestone you want to achieve.
2. **Apply Best Practices**: Follow established standards for reliability, efficiency, and safety.
3. **Iterate & Refine**: Measure initial results and adjust parameters as needed.

Feel free to ask follow-up questions or let me know if you would like me to dive deeper into any specific detail!`;
    }

    const fullPayload = `<thinking>\n${thinking}\n</thinking>\n\n${responseText}`;
    let currentSlice = '';

    for (let i = 0; i < fullPayload.length; i += 12) {
      currentSlice = fullPayload.slice(0, i + 12);
      const parsed = parseClaudeResponse(currentSlice);
      const duration = (Date.now() - startTime) / 1000;

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            const msgs = [...c.messages];
            const idx = msgs.findIndex((m) => m.id === assistantMessageId);
            if (idx !== -1) {
              msgs[idx] = {
                ...msgs[idx],
                text: parsed.cleanText,
                thinking: parsed.thinking,
                thinkingDuration: duration,
                artifact: parsed.artifact || undefined,
              };
            }
            return { ...c, messages: msgs };
          }
          return c;
        })
      );

      if (parsed.artifact) {
        setActiveArtifact(parsed.artifact);
        setIsArtifactPanelOpen(true);
      }

      await new Promise((r) => setTimeout(r, 15));
    }
  };

  // Handler: Stop Generating
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  // Handler: Edit User Message & Fork
  const handleEditUserMessage = (messageId: string, newText: string) => {
    if (!activeConversation) return;

    const msgIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const originalMsg = activeConversation.messages[msgIndex];

    // Save previous version in versions array
    const previousVersions = originalMsg.versions || [];
    const updatedVersions = [
      ...previousVersions,
      { text: originalMsg.text, timestamp: originalMsg.timestamp },
    ];

    // Truncate messages after this message to fork the conversation
    const truncatedMessages = activeConversation.messages.slice(0, msgIndex);

    // Update conversation with edited message
    const updatedUserMsg: Message = {
      ...originalMsg,
      text: newText,
      versions: updatedVersions,
      currentVersionIndex: updatedVersions.length,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...truncatedMessages, updatedUserMsg],
          };
        }
        return c;
      })
    );

    // Re-trigger assistant response with new edited text
    setTimeout(() => {
      handleSendMessage(newText, originalMsg.attachments || [], selectedMode);
    }, 50);
  };

  // Handler: Regenerate Assistant Response
  const handleRegenerate = (messageId: string, instruction?: string) => {
    if (!activeConversation) return;

    const msgIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Find the preceding user message
    const userMsg = activeConversation.messages[msgIndex - 1];
    if (!userMsg || userMsg.role !== 'user') return;

    const promptText = instruction ? `${userMsg.text} (${instruction})` : userMsg.text;

    // Truncate from assistant message
    const messagesBefore = activeConversation.messages.slice(0, msgIndex);
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            messages: messagesBefore,
          };
        }
        return c;
      })
    );

    setTimeout(() => {
      handleSendMessage(promptText, userMsg.attachments || [], selectedMode);
    }, 50);
  };

  // Handler: Thumbs Up / Down Feedback
  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId
                ? { ...m, feedback: m.feedback === feedback ? null : feedback }
                : m
            ),
          };
        }
        return c;
      })
    );
  };

  // Handler: Switch between multiple response versions
  const handleSwitchVersion = (messageId: string, newVersionIndex: number) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversationId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === messageId && m.versions && m.versions[newVersionIndex]) {
                const target = m.versions[newVersionIndex];
                return {
                  ...m,
                  text: target.text,
                  thinking: target.thinking,
                  thinkingDuration: target.thinkingDuration,
                  artifact: target.artifact,
                  currentVersionIndex: newVersionIndex,
                };
              }
              return m;
            }),
          };
        }
        return c;
      })
    );
  };

  // Handler: Media Studio
  const handleOpenMediaStudio = (mode: 'image' | 'video' = 'image') => {
    setMediaStudioMode(mode);
    setIsMediaStudioOpen(true);
  };

  const handleInsertMediaToChat = (media: GeneratedMedia, responseText: string) => {
    const targetConvId = activeConversationId || (conversations[0]?.id ?? null);
    if (!targetConvId) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text:
        media.type === 'image'
          ? `Generate image with Gemini: "${media.prompt}"`
          : `Generate video with Veo: "${media.prompt}"`,
      timestamp: Date.now(),
    };

    const mediaArtifact: ArtifactData = {
      id: media.id,
      identifier: `media-${media.id}`,
      title:
        media.type === 'image'
          ? `Gemini Image: ${media.prompt.slice(0, 24)}...`
          : `Veo Video: ${media.prompt.slice(0, 24)}...`,
      type: media.type,
      content: media.url,
      mediaUrl: media.url,
      prompt: media.prompt,
      aspectRatio: media.aspectRatio,
      version: 1,
    };

    const assistantMsg: Message = {
      id: `msg-${Date.now() + 1}-assistant`,
      role: 'assistant',
      text: responseText,
      media: media,
      artifact: mediaArtifact,
      timestamp: Date.now() + 5,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetConvId) {
          return {
            ...c,
            updatedAt: Date.now(),
            messages: [...c.messages, userMsg, assistantMsg],
          };
        }
        return c;
      })
    );

    setActiveArtifact(mediaArtifact);
    setIsArtifactPanelOpen(true);
  };

  // Handler: Create Project
  const handleCreateProject = (newProj: Omit<Project, 'id' | 'createdAt'>) => {
    const project: Project = {
      ...newProj,
      id: 'proj-' + Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
    };
    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(project.id);
  };

  return (
    <div className="flex h-[100dvh] h-screen w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] antialiased font-sans">
      {/* Left Sidebar - hidden when Focus Mode is active */}
      {!settings.focusMode && (
        <Sidebar
          appName="Clarity AI"
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            const selected = conversations.find((c) => c.id === id);
            const foundArtifact = selected?.messages.find((m) => m.artifact)?.artifact;
            if (foundArtifact) {
              setActiveArtifact(foundArtifact);
            }
          }}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onTogglePin={handleTogglePin}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => setActiveProjectId(id)}
          onOpenNewProjectModal={() => setIsProjectModalOpen(true)}
          onOpenSettings={() => {
            setSettingsInitialTab('general');
            setIsSettingsOpen(true);
          }}
          userName={settings.userName}
        />
      )}

      {/* Main Chat Panel */}
      <ChatWindow
        conversation={activeConversation}
        isStreaming={isStreaming}
        activeArtifact={activeArtifact}
        onOpenArtifact={handleOpenArtifact}
        onCloseArtifact={() => setIsArtifactPanelOpen(false)}
        isArtifactPanelOpen={!settings.focusMode && isArtifactPanelOpen && Boolean(activeArtifact)}
        onToggleArtifactPanel={() => setIsArtifactPanelOpen(!isArtifactPanelOpen)}
        onSendMessage={handleSendMessage}
        onStopGenerating={handleStopGenerating}
        onEditUserMessage={handleEditUserMessage}
        onRegenerate={handleRegenerate}
        onFeedback={handleFeedback}
        onSwitchVersion={handleSwitchVersion}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={(tab) => {
          setSettingsInitialTab(tab || 'general');
          setIsSettingsOpen(true);
        }}
        userName={settings.userName}
        selectedMode={selectedMode}
        onChangeMode={setSelectedMode}
        focusMode={settings.focusMode}
        onToggleFocusMode={handleToggleFocusMode}
        webSearchEnabled={settings.webSearchEnabled !== false}
        onToggleWebSearch={() =>
          setSettings((prev) => ({
            ...prev,
            webSearchEnabled: prev.webSearchEnabled === false ? true : false,
          }))
        }
        onOpenMediaStudio={handleOpenMediaStudio}
      />

      {/* Signature Right-Side Canvas: Artifact Panel - hidden when Focus Mode is active */}
      {!settings.focusMode && isArtifactPanelOpen && activeArtifact && (
        <ArtifactPanel
          artifact={activeArtifact}
          onClose={() => setIsArtifactPanelOpen(false)}
        />
      )}

      {/* Media Studio Modal (Gemini 3.1 Flash Image & Google Veo 3.1 Video) */}
      <MediaStudioModal
        isOpen={isMediaStudioOpen}
        onClose={() => setIsMediaStudioOpen(false)}
        initialMode={mediaStudioMode}
        onInsertMediaToChat={handleInsertMediaToChat}
      />

      {/* Settings & Academic Viva Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
        initialTab={settingsInitialTab}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewChat={handleNewChat}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={(tab) => {
          setSettingsInitialTab(tab || 'general');
          setIsSettingsOpen(true);
        }}
        onOpenNewProject={() => setIsProjectModalOpen(true)}
        theme={settings.theme}
        focusMode={settings.focusMode}
        onToggleFocusMode={handleToggleFocusMode}
      />

      {/* New Project Folder Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
