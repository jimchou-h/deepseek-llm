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

export type { Session };

interface ChatState {
  sessions: Session[];
  activeSessionId: string | null;
  loadingBySessionId: Record<string, boolean>;
  streamingContentBySessionId: Record<string, string | null>;
  streamingReasoningBySessionId: Record<string, string | null>;

  createSession: () => string;
  setActiveSession: (id: string) => void;
  deleteSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  deleteMessage: (sessionId: string, timestamp: number) => void;
  clearMessages: (sessionId: string) => void;
  setLoading: (sessionId: string, loading: boolean) => void;
  setCurrentStreamingMessage: (sessionId: string, content: string | null) => void;
  setCurrentStreamingReasoningMessage: (sessionId: string, content: string | null) => void;
  getActiveSession: () => Session | null;
  isSessionLoading: (sessionId: string | null) => boolean;
  getSessionStreaming: (sessionId: string | null) => {
    content: string | null;
    reasoning: string | null;
  };
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
      loadingBySessionId: {},
      streamingContentBySessionId: {},
      streamingReasoningBySessionId: {},

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
          const nextLoading = { ...state.loadingBySessionId };
          const nextStreaming = { ...state.streamingContentBySessionId };
          const nextReasoning = { ...state.streamingReasoningBySessionId };
          delete nextLoading[id];
          delete nextStreaming[id];
          delete nextReasoning[id];

          if (remaining.length === 0) {
            const session = createEmptySession();
            return {
              sessions: [session],
              activeSessionId: session.id,
              loadingBySessionId: nextLoading,
              streamingContentBySessionId: nextStreaming,
              streamingReasoningBySessionId: nextReasoning,
            };
          }

          const activeSessionId =
            state.activeSessionId === id ? remaining[0].id : state.activeSessionId;

          return {
            sessions: remaining,
            activeSessionId,
            loadingBySessionId: nextLoading,
            streamingContentBySessionId: nextStreaming,
            streamingReasoningBySessionId: nextReasoning,
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
          streamingContentBySessionId: {
            ...state.streamingContentBySessionId,
            [sessionId]: null,
          },
          streamingReasoningBySessionId: {
            ...state.streamingReasoningBySessionId,
            [sessionId]: null,
          },
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
          streamingContentBySessionId: {
            ...state.streamingContentBySessionId,
            [sessionId]: null,
          },
          streamingReasoningBySessionId: {
            ...state.streamingReasoningBySessionId,
            [sessionId]: null,
          },
        }));
      },

      setLoading: (sessionId, loading) => {
        set((state) => ({
          loadingBySessionId: {
            ...state.loadingBySessionId,
            [sessionId]: loading,
          },
        }));
      },

      setCurrentStreamingMessage: (sessionId, content) => {
        set((state) => ({
          streamingContentBySessionId: {
            ...state.streamingContentBySessionId,
            [sessionId]: content,
          },
        }));
      },

      setCurrentStreamingReasoningMessage: (sessionId, content) => {
        set((state) => ({
          streamingReasoningBySessionId: {
            ...state.streamingReasoningBySessionId,
            [sessionId]: content,
          },
        }));
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = ensureActiveSession(get());
        return sessions.find((s) => s.id === activeSessionId) ?? null;
      },

      isSessionLoading: (sessionId) => {
        if (!sessionId) return false;
        return Boolean(get().loadingBySessionId[sessionId]);
      },

      getSessionStreaming: (sessionId) => {
        if (!sessionId) return { content: null, reasoning: null };
        const state = get();
        return {
          content: state.streamingContentBySessionId[sessionId] ?? null,
          reasoning: state.streamingReasoningBySessionId[sessionId] ?? null,
        };
      },
    }),
    {
      name: 'chat-store',
      version: 1,
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
      migrate: (persistedState) => {
        const legacy = (persistedState ?? {}) as {
          messages?: Message[];
          sessions?: Session[];
          activeSessionId?: string | null;
        };
        const migrated = migrateLegacyChatState(legacy);
        return {
          sessions: migrated.sessions,
          activeSessionId: migrated.activeSessionId,
        };
      },
    }
  )
);
