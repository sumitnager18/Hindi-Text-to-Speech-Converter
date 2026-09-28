export interface VoiceOption {
  id: string;
  name: string;
  hindiName: string;
  gender: 'female' | 'male';
  description: string;
  accent: string;
  bestFor: string;
  color: string;
}

export interface EmotionOption {
  id: string;
  name: string;
  hindiName: string;
  iconName: string;
  description: string;
  color: string;
}

export interface SampleTextSnippet {
  id: string;
  title: string;
  category: 'quote' | 'story' | 'poetry' | 'news' | 'dialogue' | 'greeting';
  hindiText: string;
  recommendedVoice: string;
  recommendedEmotion: string;
  description: string;
}

export interface GeneratedAudioItem {
  id: string;
  text: string;
  voice: string;
  emotion: string;
  duration: number;
  wavBase64: string;
  pcmBase64: string;
  timestamp: number;
  speed: number;
  pitch: number;
  isFavorite?: boolean;
}

export interface TTSRequestPayload {
  text: string;
  voice: string;
  emotion: string;
  customEmotionPrompt?: string;
  rateStyle?: 'slow' | 'normal' | 'fast';
  pitchStyle?: 'low' | 'normal' | 'high';
}

export interface TTSResponseData {
  success: boolean;
  voice: string;
  emotion: string;
  duration: number;
  sampleRate: number;
  pcmBase64: string;
  wavBase64: string;
  mimeType: string;
  text: string;
  timestamp: number;
  error?: string;
}
