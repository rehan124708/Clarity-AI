export type Role = 'user' | 'assistant';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  dataUrl?: string;
}

export interface ArtifactData {
  id: string;
  identifier: string;
  title: string;
  type: 'code' | 'html' | 'markdown' | 'svg' | 'image' | 'video';
  content: string;
  language?: string;
  version: number;
  versions?: { version: number; content: string; timestamp: number }[];
  mediaUrl?: string;
  aspectRatio?: string;
  resolution?: string;
  prompt?: string;
}

export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  aspectRatio: string;
  model: string;
  resolution?: string;
  status?: 'generating' | 'ready' | 'error';
  operationName?: string;
  error?: string;
  createdAt: number;
}

export interface MessageVersion {
  text: string;
  thinking?: string;
  thinkingDuration?: number;
  artifact?: ArtifactData;
  media?: GeneratedMedia;
  timestamp: number;
}

export interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface WebsiteInfo {
  url: string;
  title: string;
  description?: string;
  status?: 'loaded' | 'error';
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  thinking?: string;
  thinkingDuration?: number;
  artifact?: ArtifactData;
  versions?: MessageVersion[];
  currentVersionIndex?: number;
  attachments?: Attachment[];
  feedback?: 'positive' | 'negative' | null;
  citations?: { id: number; title: string; url?: string }[];
  groundingSources?: GroundingSource[];
  searchQueries?: string[];
  websitesFetched?: WebsiteInfo[];
  webSearchUsed?: boolean;
  quotaNotice?: boolean;
  fallbackNotice?: boolean;
  media?: GeneratedMedia;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  customInstructions: string;
  color: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  isPinned?: boolean;
  projectId?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  userName: string;
  customInstructions: string;
  responseStyle: 'fast' | 'balanced' | 'extended';
  selectedModel: string;
  focusMode: boolean;
  webSearchEnabled: boolean;
  customerAssistanceMode: boolean;
}
