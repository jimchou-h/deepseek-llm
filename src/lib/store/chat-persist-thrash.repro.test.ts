import { beforeEach, describe, expect, it, vi } from 'vitest';

const idb = vi.hoisted(() => {
  const store = new Map<string, unknown>();
  return {
    store,
    get: vi.fn(async (k: string) => store.get(k)),
    set: vi.fn(async (k: string, v: unknown) => {
      store.set(k, v);
    }),
    del: vi.fn(async (k: string) => {
      store.delete(k);
    }),
  };
});

vi.mock('idb-keyval', () => idb);

describe('persist thrash repro + fix', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('REPRO: zustand persist rewrites storage on unrelated field updates', async () => {
    const writes: string[] = [];
    const map = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        writes.push(k);
        map.set(k, v);
      },
      removeItem: (k: string) => map.delete(k),
      clear: () => map.clear(),
    });

    const { create } = await import('zustand');
    const { persist } = await import('zustand/middleware');

    type State = {
      sessions: { id: string; messages: { content: string }[] }[];
      streaming: string;
      setStreaming: (v: string) => void;
    };

    const useStore = create<State>()(
      persist(
        (set) => ({
          sessions: [
            {
              id: 's1',
              messages: Array.from({ length: 40 }, (_, i) => ({
                content: `m-${i}-${'x'.repeat(200)}`,
              })),
            },
          ],
          streaming: '',
          setStreaming: (v) => set({ streaming: v }),
        }),
        {
          name: 'chat-store-repro',
          partialize: (s) => ({ sessions: s.sessions }),
        }
      )
    );

    useStore.getState();
    const baseline = writes.filter((k) => k === 'chat-store-repro').length;

    for (let t = 0; t < 30; t++) {
      useStore.getState().setStreaming(`partial-${t}`);
    }

    const after = writes.filter((k) => k === 'chat-store-repro').length - baseline;
    expect(after).toBeGreaterThan(10);
  });

  it('FIX: streaming store updates do not touch chat-store persistence', async () => {
    idb.store.clear();
    idb.set.mockClear();
    vi.stubGlobal('indexedDB', {});

    const { useChatStore } = await import('@/lib/store/chat-store');
    const { useChatStreamingStore } = await import('@/lib/store/chat-streaming-store');

    const sessionId = useChatStore.getState().activeSessionId!;
    for (let i = 0; i < 20; i++) {
      useChatStore.getState().addMessage(sessionId, {
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `message-${i}-${'x'.repeat(100)}`,
        timestamp: i + 1,
      });
    }
    await new Promise((r) => setTimeout(r, 0));
    expect(idb.set).toHaveBeenCalledWith('chat-store', expect.any(String));

    const baseline = idb.set.mock.calls.length;

    for (let t = 0; t < 30; t++) {
      useChatStreamingStore.getState().setStreamingContent(sessionId, `partial-${t}`);
    }
    await new Promise((r) => setTimeout(r, 0));

    expect(idb.set.mock.calls.length - baseline).toBe(0);
    vi.unstubAllGlobals();
  });
});
