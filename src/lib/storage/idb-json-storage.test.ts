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

describe('idbJsonStorage', () => {
  beforeEach(async () => {
    vi.unstubAllGlobals();
    idb.store.clear();
    idb.get.mockClear();
    idb.set.mockClear();
    idb.del.mockClear();
  });

  it('round-trips values through idb-keyval when indexedDB exists', async () => {
    vi.stubGlobal('indexedDB', {});
    const { idbJsonStorage } = await import('./idb-json-storage');

    await idbJsonStorage.setItem('chat-store', '{"a":1}');
    expect(idb.set).toHaveBeenCalledWith('chat-store', '{"a":1}');

    expect(await idbJsonStorage.getItem('chat-store')).toBe('{"a":1}');
    expect(await idbJsonStorage.getItem('missing')).toBeNull();

    await idbJsonStorage.removeItem('chat-store');
    expect(await idbJsonStorage.getItem('chat-store')).toBeNull();
  });

  it('degrades to null/no-op without indexedDB (SSR or private mode)', async () => {
    const { idbJsonStorage } = await import('./idb-json-storage');

    expect(await idbJsonStorage.getItem('chat-store')).toBeNull();
    await idbJsonStorage.setItem('chat-store', '{}');
    await idbJsonStorage.removeItem('chat-store');
    expect(idb.set).not.toHaveBeenCalled();
    expect(idb.del).not.toHaveBeenCalled();
  });
});
