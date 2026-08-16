import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/types';
import {
  Session,
  createEmptySession,
  migrateLegacyChatState,
  titleAfterFirstUserMessage,
  DEFAULT_SESSION_TITLE,
} from '@/lib/chat/session-utils';
import {
  DEFAULT_CONTEXT_MESSAGE_LIMIT,
  normalizeContextMessageLimit,
} from '@/lib/chat/context-window';

export type { Session };

interface ChatState {
  sessions: Session[];
  activeSessionId: string | null;
  contextMessageLimit: number;

  createSession: () => string;
  setActiveSession: (id: string) => void;
  deleteSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  deleteMessage: (sessionId: string, timestamp: number) => void;
  clearMessages: (sessionId: string) => void;
  updateContextMessageLimit: (limit: number) => void;
  getActiveSession: () => Session | null;
}

function ensureActiveSession(state: Pick<ChatState, 'sessions' | 'activeSessionId'>): {
  sessions: Session[];
  activeSessionId: string;
} {
  if (state.sessions.length === 0) {
    const session = createEmptySession();
    return { sessions: [session], activeSessionId: session.id };
  }
  const active =
    state.activeSessionId && state.sessions.some((s) => s.id === state.activeSessionId)
      ? state.activeSessionId
      : state.sessions[0].id;
  return { sessions: state.sessions, activeSessionId: active };
}

const initialSession = createEmptySession();

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [initialSession],
      activeSessionId: initialSession.id,
      contextMessageLimit: DEFAULT_CONTEXT_MESSAGE_LIMIT,

      createSession: () => {
        const session = createEmptySession();
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: session.id,
        }));
        return session.id;
      },

      setActiveSession: (id) => {
        const exists = get().sessions.some((s) => s.id === id);
        if (!exists) return;
        set({ activeSessionId: id });
      },

      deleteSession: (id) => {
        set((state) => {
          const remaining = state.sessions.filter((s) => s.id !== id);

          if (remaining.length === 0) {
            const session = createEmptySession();
            return {
              sessions: [session],
              activeSessionId: session.id,
            };
          }

          const activeSessionId =
            state.activeSessionId === id ? remaining[0].id : state.activeSessionId;

          return {
            sessions: remaining,
            activeSessionId,
          };
        });
      },

      addMessage: (sessionId, message) => {
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id !== sessionId) return session;
            const title = titleAfterFirstUserMessage(
              session.title,
              session.messages,
              message
            );
            return {
              ...session,
              title,
              messages: [...session.messages, message],
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      deleteMessage: (sessionId, timestamp) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.filter((msg) => msg.timestamp !== timestamp),
                  updatedAt: Date.now(),
                }
              : session
          ),
        }));
      },

      clearMessages: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  title: DEFAULT_SESSION_TITLE,
                  messages: [],
                  updatedAt: Date.now(),
                }
              : session
          ),
        }));
      },

      updateContextMessageLimit: (limit) => {
        set({ contextMessageLimit: normalizeContextMessageLimit(limit) });
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = ensureActiveSession(get());
        return sessions.find((s) => s.id === activeSessionId) ?? null;
      },
    }),
    {
      name: 'chat-store',
      version: 1,
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        contextMessageLimit: state.contextMessageLimit,
      }),
      migrate: (persistedState) => {
        const legacy = (persistedState ?? {}) as {
          messages?: Message[];
          sessions?: Session[];
          activeSessionId?: string | null;
          contextMessageLimit?: number;
        };
        const migrated = migrateLegacyChatState(legacy);
        return {
          sessions: migrated.sessions,
          activeSessionId: migrated.activeSessionId,
          contextMessageLimit: normalizeContextMessageLimit(
            legacy.contextMessageLimit ?? DEFAULT_CONTEXT_MESSAGE_LIMIT
          ),
        };
      },
    }
  )
);
