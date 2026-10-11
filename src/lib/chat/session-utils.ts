import { v4 as uuidv4 } from 'uuid';
import type { Message } from '@/types';
import type { ModelType } from '@/lib/api/config';

export const DEFAULT_SESSION_TITLE = '新对话';
export const TITLE_MAX_LENGTH = 30;

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  /** 会话级模型覆盖；缺省跟随全局设置 */
  model?: ModelType;
}

export function truncateTitle(content: string, maxLength = TITLE_MAX_LENGTH): string {
  const normalized = content.trim().replace(/\s+/g, ' ');
  if (!normalized) return DEFAULT_SESSION_TITLE;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}…`;
}

export function createEmptySession(now = Date.now()): Session {
  return {
    id: uuidv4(),
    title: DEFAULT_SESSION_TITLE,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function titleAfterFirstUserMessage(
  currentTitle: string,
  messagesBefore: Message[],
  newMessage: Message
): string {
  if (newMessage.role !== 'user') return currentTitle;
  const hadUser = messagesBefore.some((m) => m.role === 'user');
  if (hadUser) return currentTitle;
  return truncateTitle(newMessage.content);
}
