import type { Message } from '@/types';

export const DEFAULT_CONTEXT_MESSAGE_LIMIT = 50;
export const MIN_CONTEXT_MESSAGE_LIMIT = 1;

export function normalizeContextMessageLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_CONTEXT_MESSAGE_LIMIT;
  return Math.max(MIN_CONTEXT_MESSAGE_LIMIT, Math.floor(value));
}

/** Build API payload: optional system + newest N conversation messages. System does not count toward N. */
export function buildApiMessages(options: {
  systemPrompt?: string;
  messages: Message[];
  limit: number;
}): Array<Pick<Message, 'role' | 'content' | 'timestamp'>> {
  const limit = normalizeContextMessageLimit(options.limit);
  const sliced = options.messages.slice(-limit);
  if (options.systemPrompt?.trim()) {
    return [
      { role: 'system', content: options.systemPrompt.trim(), timestamp: 0 },
      ...sliced,
    ];
  }
  return sliced;
}
