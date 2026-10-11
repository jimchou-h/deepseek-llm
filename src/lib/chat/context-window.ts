import type { Message } from '@/types';

export const DEFAULT_CONTEXT_MESSAGE_LIMIT = 20;
export const MIN_CONTEXT_MESSAGE_LIMIT = 1;
export const MAX_MESSAGE_CONTENT_CHARS = 8000;

export function normalizeContextMessageLimit(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_CONTEXT_MESSAGE_LIMIT;
  return Math.max(MIN_CONTEXT_MESSAGE_LIMIT, Math.floor(value));
}

/** 仅截断出参副本，控制单条消息的 token 开销；store/UI 数据不动 */
function truncateForPayload(message: Pick<Message, 'role' | 'content' | 'timestamp'>) {
  if (message.content.length <= MAX_MESSAGE_CONTENT_CHARS) return message;
  return {
    ...message,
    content: `${message.content.slice(0, MAX_MESSAGE_CONTENT_CHARS)}\n…[truncated]`,
  };
}

/** Build API payload: optional system + newest N conversation messages. System does not count toward N. */
export function buildApiMessages(options: {
  systemPrompt?: string;
  messages: Message[];
  limit: number;
}): Array<Pick<Message, 'role' | 'content' | 'timestamp'>> {
  const limit = normalizeContextMessageLimit(options.limit);
  const sliced = options.messages.slice(-limit).map(truncateForPayload);
  if (options.systemPrompt?.trim()) {
    return [
      { role: 'system', content: options.systemPrompt.trim(), timestamp: 0 },
      ...sliced,
    ];
  }
  return sliced;
}
