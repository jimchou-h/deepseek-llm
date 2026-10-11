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

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('chat-store IndexedDB persistence', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    idb.store.clear();
    idb.get.mockClear();
    idb.set.mockClear();
    idb.del.mockClear();
  });

  it('removes the legacy localStorage chat-store key on load', async () => {
    const legacy = new Map([['chat-store', '{"state":{"messages":[]},"version":1}']]);
    const removeItem = vi.fn((k: string) => legacy.delete(k));
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => legacy.get(k) ?? null,
      setItem: (k: string, v: string) => legacy.set(k, v),
      removeItem,
      clear: () => legacy.clear(),
    });

    await import('./chat-store');
    expect(removeItem).toHaveBeenCalledWith('chat-store');
  });

  it('does not use localStorage for chat-store writes and persists via idb', async () => {
    vi.stubGlobal('indexedDB', {});
    const localStorageWrites: string[] = [];
    const legacy = new Map<string, string>();
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => legacy.get(k) ?? null,
      setItem: (k: string, v: string) => {
        localStorageWrites.push(k);
        legacy.set(k, v);
      },
      removeItem: (k: string) => legacy.delete(k),
      clear: () => legacy.clear(),
    });

    const { useChatStore } = await import('./chat-store');
    const sessionId = useChatStore.getState().activeSessionId!;
    useChatStore.getState().addMessage(sessionId, {
      role: 'user',
      content: 'hello idb',
      timestamp: 1,
    });
    await flush();

    expect(localStorageWrites).not.toContain('chat-store');
    const persisted = idb.store.get('chat-store');
    expect(typeof persisted).toBe('string');
    expect(JSON.parse(persisted as string).state.sessions[0].messages[0].content).toBe(
      'hello idb'
    );
  });

  it('hydrates persisted sessions from idb on load', async () => {
    vi.stubGlobal('indexedDB', {});
    const session = {
      id: 's-old',
      title: '历史会话',
      messages: [],
      createdAt: 1,
      updatedAt: 1,
    };
    idb.store.set(
      'chat-store',
      JSON.stringify({
        state: { sessions: [session], activeSessionId: 's-old', contextMessageLimit: 20 },
        version: 2,
      })
    );

    const { useChatStore } = await import('./chat-store');
    await vi.waitFor(() => {
      expect(useChatStore.getState().sessions.map((s) => s.id)).toEqual(['s-old']);
    });
    expect(useChatStore.getState().activeSessionId).toBe('s-old');
  });
});
