import { beforeEach, describe, expect, it, vi } from 'vitest';

function seedPersistedSettings(model: string, version: number) {
  const map = new Map<string, string>();
  map.set(
    'settings-store',
    JSON.stringify({
      state: {
        settings: {
          temperature: 0.7,
          topP: 0.9,
          topK: 50,
          maxLength: 2000,
          systemPrompt: 'keep me',
          model,
          functions: [
            {
              id: 'legacy',
              name: 'legacy_fn',
              description: 'd',
              parameters: { type: 'object', properties: {}, required: [] },
              url: 'https://example.com',
              method: 'GET',
            },
          ],
        },
        apiKey: 'sk-legacy',
      },
      version,
    })
  );
  vi.stubGlobal('window', globalThis);
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => map.set(k, v),
    removeItem: (k: string) => map.delete(k),
    clear: () => map.clear(),
  });
}

async function importStore() {
  const mod = await import('./settings-store');
  return mod.useSettingsStore.getState();
}

describe('settings-store model migration (legacy chat/coder/reasoner -> pro)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('migrates legacy model "chat" to "pro" while keeping other settings', async () => {
    seedPersistedSettings('chat', 0);
    const state = await importStore();
    expect(state.settings.model).toBe('pro');
    expect(state.settings.systemPrompt).toBe('keep me');
  });

  it('migrates legacy model "reasoner" to "pro"', async () => {
    seedPersistedSettings('reasoner', 0);
    const state = await importStore();
    expect(state.settings.model).toBe('pro');
  });

  it('keeps a valid v1 model value untouched', async () => {
    seedPersistedSettings('flash', 1);
    const state = await importStore();
    expect(state.settings.model).toBe('flash');
  });

  it('defaults new installs to pro', async () => {
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    });
    const state = await importStore();
    expect(state.settings.model).toBe('pro');
  });
});
