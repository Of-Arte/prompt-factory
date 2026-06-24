export type Provider = 'Claude' | 'Claude Fable 5' | 'Claude Opus 4.8' | 'Gemini 3.1 Pro' | 'Gemini 3.5 Flash' | 'GPT-5.5' | 'Grok Imagine' | 'ChatGPT' | 'Gemini' | 'Grok' | 'Qwen';

export type TemplateType = string;

export interface Spec {
  id: string;
  author_id?: string;
  author: string;
  authorHandle: string;
  title: string;
  content: string;
  provider: Provider;
  templateType: TemplateType;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  tags: string[];
  fork_of: string | null;
  forks: number;
  lastRefined: string;
  isFavorite: boolean;
}
