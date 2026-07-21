import { v4 as uuidv4 } from 'uuid';
import type { Message } from '@/types';

export const DEFAULT_SESSION_TITLE = '新对话';
export const TITLE_MAX_LENGTH = 30;

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
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

export interface LegacyChatPersist {
  messages?: Message[];
  sessions?: Session[];
  activeSessionId?: string | null;
}

export function migrateLegacyChatState(
  persisted: LegacyChatPersist,
  now = Date.now()
): { sessions: Session[]; activeSessionId: string } {
  if (persisted.sessions && persisted.sessions.length > 0) {
    const activeSessionId =
      persisted.activeSessionId &&
      persisted.sessions.some((s) => s.id === persisted.activeSessionId)
        ? persisted.activeSessionId
        : persisted.sessions[0].id;
    return { sessions: persisted.sessions, activeSessionId };
  }

  const session = createEmptySession(now);
  session.messages = persisted.messages ?? [];
  if (session.messages.length > 0) {
    const firstUser = session.messages.find((m) => m.role === 'user');
    if (firstUser) {
      session.title = truncateTitle(firstUser.content);
    }
  }

  return { sessions: [session], activeSessionId: session.id };
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
