import { create } from 'zustand';

interface ChatStreamingState {
  loadingBySessionId: Record<string, boolean>;
  streamingContentBySessionId: Record<string, string | null>;
  streamingReasoningBySessionId: Record<string, string | null>;
  setLoading: (sessionId: string, loading: boolean) => void;
  setStreamingContent: (sessionId: string, content: string | null) => void;
  setStreamingReasoning: (sessionId: string, content: string | null) => void;
  clearSessionStreaming: (sessionId: string) => void;
  clearAllForSession: (sessionId: string) => void;
  isSessionLoading: (sessionId: string | null) => boolean;
  getSessionStreaming: (sessionId: string | null) => {
    content: string | null;
    reasoning: string | null;
  };
}

export const useChatStreamingStore = create<ChatStreamingState>((set, get) => ({
  loadingBySessionId: {},
  streamingContentBySessionId: {},
  streamingReasoningBySessionId: {},

  setLoading: (sessionId, loading) => {
    set((state) => ({
      loadingBySessionId: {
        ...state.loadingBySessionId,
        [sessionId]: loading,
      },
    }));
  },

  setStreamingContent: (sessionId, content) => {
    set((state) => ({
      streamingContentBySessionId: {
        ...state.streamingContentBySessionId,
        [sessionId]: content,
      },
    }));
  },

  setStreamingReasoning: (sessionId, content) => {
    set((state) => ({
      streamingReasoningBySessionId: {
        ...state.streamingReasoningBySessionId,
        [sessionId]: content,
      },
    }));
  },

  clearSessionStreaming: (sessionId) => {
    set((state) => ({
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

  clearAllForSession: (sessionId) => {
    set((state) => {
      const loadingBySessionId = { ...state.loadingBySessionId };
      const streamingContentBySessionId = { ...state.streamingContentBySessionId };
      const streamingReasoningBySessionId = { ...state.streamingReasoningBySessionId };
      delete loadingBySessionId[sessionId];
      delete streamingContentBySessionId[sessionId];
      delete streamingReasoningBySessionId[sessionId];
      return {
        loadingBySessionId,
        streamingContentBySessionId,
        streamingReasoningBySessionId,
      };
    });
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
}));
