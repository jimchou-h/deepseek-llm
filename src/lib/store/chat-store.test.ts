import { beforeEach, describe, expect, it } from 'vitest';
import { useChatStore } from './chat-store';
import { useChatStreamingStore } from './chat-streaming-store';
import { createEmptySession, DEFAULT_SESSION_TITLE } from '@/lib/chat/session-utils';

function resetStores() {
  const session = createEmptySession();
  useChatStore.setState({
    sessions: [session],
    activeSessionId: session.id,
    contextMessageLimit: 50,
  });
  useChatStreamingStore.setState({
    loadingBySessionId: {},
    streamingContentBySessionId: {},
    streamingReasoningBySessionId: {},
  });
}

describe('useChatStore multi-session', () => {
  beforeEach(() => {
    resetStores();
  });

  it('creates a new empty active session', () => {
    const id = useChatStore.getState().createSession();
    const state = useChatStore.getState();
    expect(state.activeSessionId).toBe(id);
    const session = state.sessions.find((s) => s.id === id);
    expect(session?.messages).toEqual([]);
    expect(session?.title).toBe(DEFAULT_SESSION_TITLE);
  });

  it('switches active session without moving messages', () => {
    const a = useChatStore.getState().activeSessionId!;
    useChatStore.getState().addMessage(a, {
      role: 'user',
      content: 'A会话',
      timestamp: 1,
    });
    const b = useChatStore.getState().createSession();
    useChatStore.getState().setActiveSession(a);
    expect(useChatStore.getState().activeSessionId).toBe(a);
    expect(useChatStore.getState().sessions.find((s) => s.id === a)?.messages).toHaveLength(1);
    expect(useChatStore.getState().sessions.find((s) => s.id === b)?.messages).toHaveLength(0);
  });

  it('deletes active session and activates another', () => {
    const first = useChatStore.getState().activeSessionId!;
    const second = useChatStore.getState().createSession();
    useChatStore.getState().deleteSession(second);
    expect(useChatStore.getState().sessions.some((s) => s.id === second)).toBe(false);
    expect(useChatStore.getState().activeSessionId).toBe(first);
  });

  it('creates a fresh session when deleting the last one', () => {
    const only = useChatStore.getState().activeSessionId!;
    useChatStore.getState().deleteSession(only);
    const state = useChatStore.getState();
    expect(state.sessions).toHaveLength(1);
    expect(state.sessions[0].id).not.toBe(only);
    expect(state.activeSessionId).toBe(state.sessions[0].id);
  });

  it('auto-titles from first user message', () => {
    const id = useChatStore.getState().activeSessionId!;
    useChatStore.getState().addMessage(id, {
      role: 'user',
      content: '帮我写一首诗',
      timestamp: 1,
    });
    expect(useChatStore.getState().sessions.find((s) => s.id === id)?.title).toBe(
      '帮我写一首诗'
    );
  });

  it('keeps streaming updates on the originating session after switch', () => {
    const a = useChatStore.getState().activeSessionId!;
    useChatStreamingStore.getState().setLoading(a, true);
    useChatStreamingStore.getState().setStreamingContent(a, 'hello');
    const b = useChatStore.getState().createSession();
    expect(useChatStore.getState().activeSessionId).toBe(b);
    expect(useChatStreamingStore.getState().isSessionLoading(a)).toBe(true);
    expect(useChatStreamingStore.getState().isSessionLoading(b)).toBe(false);
    expect(useChatStreamingStore.getState().getSessionStreaming(a).content).toBe('hello');
    expect(useChatStreamingStore.getState().getSessionStreaming(b).content).toBeNull();
  });

  it('persists context message limit with a floor of 1', () => {
    expect(useChatStore.getState().contextMessageLimit).toBe(50);
    useChatStore.getState().updateContextMessageLimit(10);
    expect(useChatStore.getState().contextMessageLimit).toBe(10);
    useChatStore.getState().updateContextMessageLimit(0);
    expect(useChatStore.getState().contextMessageLimit).toBe(1);
  });
});
