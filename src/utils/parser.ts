import { ArtifactData } from '../types';

export interface ParsedResponse {
  cleanText: string;
  thinking: string;
  isThinkingActive: boolean;
  artifact: ArtifactData | null;
}

export function parseClaudeResponse(rawText: string): ParsedResponse {
  let text = rawText;
  let thinking = '';
  let isThinkingActive = false;
  let artifact: ArtifactData | null = null;

  // Extract <thinking> tags
  const thinkingCompleteRegex = /<thinking>([\s\S]*?)<\/thinking>/i;
  const thinkingCompleteMatch = text.match(thinkingCompleteRegex);

  if (thinkingCompleteMatch) {
    thinking = thinkingCompleteMatch[1].trim();
    text = text.replace(thinkingCompleteRegex, '').trim();
  } else {
    // Check if thinking is still open and streaming
    const thinkingOpenIndex = text.indexOf('<thinking>');
    if (thinkingOpenIndex !== -1) {
      isThinkingActive = true;
      thinking = text.slice(thinkingOpenIndex + 10).trim();
      text = text.slice(0, thinkingOpenIndex).trim();
    }
  }

  // Extract <artifact ...> tags
  // Matches <artifact identifier="..." type="..." title="...">...</artifact>
  const artifactCompleteRegex = /<artifact\s+([^>]*?)>([\s\S]*?)<\/artifact>/i;
  const artifactMatch = text.match(artifactCompleteRegex);

  if (artifactMatch) {
    const attrString = artifactMatch[1];
    const content = artifactMatch[2];

    const idMatch = attrString.match(/identifier=["']([^"']+)["']/i);
    const typeMatch = attrString.match(/type=["']([^"']+)["']/i);
    const titleMatch = attrString.match(/title=["']([^"']+)["']/i);
    const langMatch = attrString.match(/language=["']([^"']+)["']/i);

    const artifactType = (typeMatch ? typeMatch[1].toLowerCase() : 'code') as 'code' | 'html' | 'markdown' | 'svg';

    artifact = {
      id: 'art-' + Math.random().toString(36).substring(2, 9),
      identifier: idMatch ? idMatch[1] : 'artifact-1',
      title: titleMatch ? titleMatch[1] : 'Generated Artifact',
      type: artifactType,
      language: langMatch ? langMatch[1] : (artifactType === 'html' ? 'html' : artifactType === 'svg' ? 'svg' : 'python'),
      content: content.trim(),
      version: 1,
    };

    // Remove the artifact tag block from text or replace with a reference
    text = text.replace(artifactCompleteRegex, '').trim();
  } else {
    // Check if artifact is currently streaming open
    const artifactOpenRegex = /<artifact\s+([^>]*?)>([\s\S]*)$/i;
    const streamingMatch = text.match(artifactOpenRegex);
    if (streamingMatch) {
      const attrString = streamingMatch[1];
      const partialContent = streamingMatch[2];

      const idMatch = attrString.match(/identifier=["']([^"']+)["']/i);
      const typeMatch = attrString.match(/type=["']([^"']+)["']/i);
      const titleMatch = attrString.match(/title=["']([^"']+)["']/i);

      artifact = {
        id: 'streaming-artifact',
        identifier: idMatch ? idMatch[1] : 'artifact-1',
        title: titleMatch ? titleMatch[1] : 'Generating Artifact...',
        type: (typeMatch ? typeMatch[1].toLowerCase() : 'code') as any,
        content: partialContent,
        version: 1,
      };

      text = text.replace(artifactOpenRegex, '').trim();
    }
  }

  return {
    cleanText: text,
    thinking,
    isThinkingActive,
    artifact,
  };
}

export function formatTimestamp(time: number): string {
  const date = new Date(time);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function groupConversationsByDate<T extends { id: string; updatedAt: number }>(conversations: T[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const sevenDaysAgo = todayStart - 6 * 86400000;

  const groups: {
    today: T[];
    yesterday: T[];
    pastSevenDays: T[];
    older: T[];
  } = {
    today: [],
    yesterday: [],
    pastSevenDays: [],
    older: [],
  };

  for (const conv of conversations) {
    if (conv.updatedAt >= todayStart) {
      groups.today.push(conv);
    } else if (conv.updatedAt >= yesterdayStart) {
      groups.yesterday.push(conv);
    } else if (conv.updatedAt >= sevenDaysAgo) {
      groups.pastSevenDays.push(conv);
    } else {
      groups.older.push(conv);
    }
  }

  return groups;
}
