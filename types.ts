
export enum AppMode {
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  VOICE = 'VOICE',
  VISION = 'VISION',
  SETTINGS = 'SETTINGS',
  DASHBOARD = 'DASHBOARD',
  TTS_STUDIO = 'TTS_STUDIO'
}

export interface GroundingMetadata {
  webUrls?: string[];
  mapsUrls?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  grounding?: GroundingMetadata;
  timestamp: number;
  tokens?: number;
  thought?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  mode: AppMode;
  category?: string;
  isThinkingMode?: boolean; // ميزة التفكير العميق الجديدة
}

export interface AISettings {
  modelName: string;
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  safetySettings: string;
  systemInstruction: string;
  thinkingBudget: number;
  useSearch: boolean;
  useMaps: boolean;
}

export interface ImageStyle {
  id: string;
  name: string;
  promptSuffix: string;
  previewColor: string;
}
